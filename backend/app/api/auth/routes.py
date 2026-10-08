from __future__ import annotations

import uuid
from typing import Annotated
from urllib.parse import urlencode

from fastapi import APIRouter, Form, Header, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import select

from app.api.deps import DbDep, RedisDep, get_bearer_claims, get_current_session
from app.core.config import get_settings
from app.core.errors import ProblemDetail
from app.core.security import generate_token, hash_password, verify_password
from app.models.entities import Tenant, User, UserStatus
from app.core.redirects import safe_redirect_path
from app.services.access_service import APP_ACCESS, AccessDenied, access_service
from app.services.audit_service import audit_service
from app.services.metrics import metrics
from app.services.mfa_service import mfa_service
from app.services.oidc_service import oidc_service
from app.services.rate_limit import rate_limiter
from app.services.role_service import role_service
from app.services.session_service import session_service

router = APIRouter(tags=["auth"])

MIN_PASSWORD_LENGTH = 8


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_slug: str = "demo"
    mfa_code: str | None = None


class LoginResponse(BaseModel):
    session_id: str
    mfa_required: bool = False
    user_id: str | None = None


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    tenant_slug: str = "demo"


class SignupResponse(BaseModel):
    session_id: str
    user_id: str
    email: EmailStr


PAGE_STYLES = """
body{font-family:system-ui,sans-serif;max-width:420px;margin:4rem auto;padding:0 1rem}
input,button{display:block;width:100%;margin:.5rem 0;padding:.6rem}
p.muted{color:#555;font-size:.95rem}
a{color:#0b57d0}
.error{color:#b00020}
"""

LOGIN_HTML = """
<!DOCTYPE html>
<html><head><title>SSO Login</title>
<style>
{styles}
</style></head>
<body>
<h1>Sign in</h1>
<form method="post" action="/login">
  <input type="hidden" name="redirect" value="{redirect}"/>
  <label>Email <input name="email" type="email" required/></label>
  <label>Password <input name="password" type="password" required/></label>
  <label>MFA code (if enrolled) <input name="mfa_code" inputmode="numeric"/></label>
  <button type="submit">Continue</button>
</form>
{error}
<p class="muted">No account? <a href="/signup?redirect={redirect}">Sign up</a></p>
</body></html>
"""

SIGNUP_HTML = """
<!DOCTYPE html>
<html><head><title>SSO Sign up</title>
<style>
{styles}
</style></head>
<body>
<h1>Create account</h1>
<form method="post" action="/signup">
  <input type="hidden" name="redirect" value="{redirect}"/>
  <label>Name <input name="name" type="text" autocomplete="name"/></label>
  <label>Email <input name="email" type="email" required autocomplete="email"/></label>
  <label>Password <input name="password" type="password" required minlength="8" autocomplete="new-password"/></label>
  <label>Confirm password <input name="confirm_password" type="password" required minlength="8" autocomplete="new-password"/></label>
  <button type="submit">Create account</button>
</form>
{error}
<p class="muted">Already have an account? <a href="/login?redirect={redirect}">Sign in</a></p>
</body></html>
"""


def _login_html(redirect: str = "/", error: str = "") -> str:
    return LOGIN_HTML.format(styles=PAGE_STYLES, redirect=redirect, error=error)


def _signup_html(redirect: str = "/", error: str = "") -> str:
    return SIGNUP_HTML.format(styles=PAGE_STYLES, redirect=redirect, error=error)


def _validate_password(password: str) -> str | None:
    if len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters"
    return None


async def _get_tenant_by_slug(db: DbDep, tenant_slug: str) -> Tenant | None:
    result = await db.execute(select(Tenant).where(Tenant.slug == tenant_slug))
    return result.scalar_one_or_none()


async def _create_user(
    db: DbDep,
    *,
    email: str,
    password: str,
    name: str | None,
    tenant_slug: str,
) -> tuple[User | None, str | None]:
    password_error = _validate_password(password)
    if password_error:
        return None, password_error

    tenant = await _get_tenant_by_slug(db, tenant_slug)
    if tenant is None:
        return None, "Unknown organization"

    email_norm = email.lower().strip()
    existing = await db.execute(
        select(User).where(User.tenant_id == tenant.id).where(User.email == email_norm)
    )
    if existing.scalar_one_or_none() is not None:
        return None, "An account with this email already exists"

    user = User(
        tenant_id=tenant.id,
        email=email_norm,
        name=(name or "").strip() or None,
        password_hash=hash_password(password),
        status=UserStatus.active,
        is_admin=False,
    )
    db.add(user)
    await db.flush()
    await role_service.assign_default_user_role(db, user.id, tenant.id)
    await db.commit()
    await db.refresh(user)
    return user, None


def _session_cookie_response(
    *,
    settings,
    session_token: str,
    body: dict | None = None,
    redirect: str | None = None,
    status_code: int = 200,
):
    if redirect is not None:
        response = RedirectResponse(url=safe_redirect_path(redirect), status_code=303)
    else:
        response = JSONResponse(body or {}, status_code=status_code)
    cookie_kwargs = {
        "key": settings.cookie_name,
        "value": session_token,
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": "lax",
        "max_age": settings.session_absolute_hours * 3600,
        "path": "/",
    }
    response.set_cookie(**cookie_kwargs)
    return response


@router.get("/login", response_class=HTMLResponse)
async def login_page(redirect: str = "/") -> HTMLResponse:
    return HTMLResponse(_login_html(redirect=safe_redirect_path(redirect)))


@router.get("/signup", response_class=HTMLResponse)
async def signup_page(redirect: str = "/") -> HTMLResponse:
    return HTMLResponse(_signup_html(redirect=safe_redirect_path(redirect)))

async def _authenticate(
    db: DbDep,
    redis: RedisDep,
    *,
    email: str,
    password: str,
    mfa_code: str | None,
) -> tuple[User | None, str | None, bool]:
    """Returns (user, error, mfa_required)."""
    locked, _retry = await rate_limiter.is_locked(redis, email.lower())
    if locked:
        return None, "locked", False

    result = await db.execute(
        select(User).where(User.email == email.lower()).where(User.status == UserStatus.active)
    )
    user = result.scalar_one_or_none()
    if user is None or not user.password_hash or not verify_password(user.password_hash, password):
        await rate_limiter.login_failure(redis, email.lower())
        return None, "invalid", False

    needs_mfa = await mfa_service.has_mfa(db, user.id)
    if needs_mfa:
        if not mfa_code or not await mfa_service.verify_totp(db, user.id, mfa_code):
            return user, "mfa", True
    return user, None, False


@router.post("/login")
async def login_form(
    request: Request,
    db: DbDep,
    redis: RedisDep,
    email: str = Form(...),
    password: str = Form(...),
    mfa_code: str | None = Form(None),
    redirect: str = Form("/"),
):
    settings = get_settings()
    user, err, mfa_required = await _authenticate(
        db, redis, email=email, password=password, mfa_code=mfa_code
    )
    if err == "locked":
        metrics.incr("login_failures")
        raise ProblemDetail(status=429, title="Too Many Requests", detail="Account temporarily locked")
    if err == "invalid":
        metrics.incr("login_failures")
        return HTMLResponse(
            _login_html(redirect=redirect, error="<p class='error'>Invalid credentials</p>"),
            status_code=401,
        )
    if err == "mfa":
        return HTMLResponse(
            _login_html(redirect=redirect, error="<p class='error'>MFA code required</p>"),
            status_code=401,
        )
    assert user is not None
    await rate_limiter.clear_login_failures(redis, email.lower())
    session, token = await session_service.create(
        db, redis, user_id=user.id, tenant_id=user.tenant_id, mfa_verified=bool(mfa_code)
    )
    await audit_service.record(
        db, redis, tenant_id=user.tenant_id, actor=user.email, action="login.success", target=str(user.id)
    )
    return _session_cookie_response(
        settings=settings, session_token=token, redirect=safe_redirect_path(redirect)
    )


@router.post("/login/json", response_model=LoginResponse)
async def login_json(body: LoginRequest, db: DbDep, redis: RedisDep, request: Request):
    settings = get_settings()
    allowed, retry = await rate_limiter.hit(
        redis, f"sso:rl:login:{request.client.host if request.client else 'unknown'}", 30, 60
    )
    if not allowed:
        raise ProblemDetail(status=429, title="Too Many Requests", detail="Rate limit exceeded", extensions={"retry_after": retry})
    user, err, mfa_required = await _authenticate(
        db, redis, email=body.email, password=body.password, mfa_code=body.mfa_code
    )
    if err == "locked":
        raise ProblemDetail(status=429, title="Too Many Requests", detail="Account temporarily locked")
    if err == "invalid":
        raise ProblemDetail(status=401, title="Unauthorized", detail="Invalid credentials")
    if err == "mfa":
        return JSONResponse(
            {"session_id": "", "mfa_required": True, "user_id": str(user.id) if user else None},
            status_code=401,
        )
    assert user is not None
    await rate_limiter.clear_login_failures(redis, body.email.lower())
    mfa_ok = bool(body.mfa_code) or not await mfa_service.has_mfa(db, user.id)
    session, token = await session_service.create(
        db, redis, user_id=user.id, tenant_id=user.tenant_id, mfa_verified=mfa_ok
    )
    await audit_service.record(
        db, redis, tenant_id=user.tenant_id, actor=user.email, action="login.success", target=str(user.id)
    )
    return _session_cookie_response(
        settings=settings,
        session_token=token,
        body={"session_id": str(session.id), "mfa_required": False, "user_id": str(user.id)},
    )


@router.post("/signup")
async def signup_form(
    db: DbDep,
    redis: RedisDep,
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    name: str | None = Form(None),
    tenant_slug: str = Form("demo"),
    redirect: str = Form("/"),
):
    settings = get_settings()
    if password != confirm_password:
        return HTMLResponse(
            _signup_html(redirect=redirect, error="<p class='error'>Passwords do not match</p>"),
            status_code=400,
        )
    user, err = await _create_user(
        db, email=email, password=password, name=name, tenant_slug=tenant_slug
    )
    if err:
        return HTMLResponse(
            _signup_html(redirect=redirect, error=f"<p class='error'>{err}</p>"),
            status_code=400,
        )
    assert user is not None
    session, token = await session_service.create(
        db, redis, user_id=user.id, tenant_id=user.tenant_id, mfa_verified=False
    )
    await audit_service.record(
        db, redis, tenant_id=user.tenant_id, actor=user.email, action="signup.success", target=str(user.id)
    )
    return _session_cookie_response(
        settings=settings, session_token=token, redirect=safe_redirect_path(redirect)
    )


@router.post("/signup/json", response_model=SignupResponse, status_code=201)
async def signup_json(body: SignupRequest, db: DbDep, redis: RedisDep, request: Request):
    settings = get_settings()
    allowed, retry = await rate_limiter.hit(
        redis,
        f"sso:rl:signup:{request.client.host if request.client else 'unknown'}",
        settings.signup_rate_limit_per_minute,
        60,
    )
    if not allowed:
        raise ProblemDetail(
            status=429,
            title="Too Many Requests",
            detail="Signup rate limit exceeded",
            extensions={"retry_after": retry},
        )
    user, err = await _create_user(
        db,
        email=body.email,
        password=body.password,
        name=body.name,
        tenant_slug=body.tenant_slug,
    )
    if err:
        status = 409 if "already exists" in err else 400
        raise ProblemDetail(status=status, title="Signup Failed", detail=err)
    assert user is not None
    session, token = await session_service.create(
        db, redis, user_id=user.id, tenant_id=user.tenant_id, mfa_verified=False
    )
    await audit_service.record(
        db, redis, tenant_id=user.tenant_id, actor=user.email, action="signup.success", target=str(user.id)
    )
    return _session_cookie_response(
        settings=settings,
        session_token=token,
        body={"session_id": str(session.id), "user_id": str(user.id), "email": user.email},
        status_code=201,
    )


@router.get("/oauth2/authorize")
async def authorize(
    request: Request,
    db: DbDep,
    redis: RedisDep,
    client_id: str = Query(...),
    redirect_uri: str = Query(...),
    response_type: str = Query(...),
    scope: str = Query("openid"),
    state: str | None = Query(None),
    nonce: str | None = Query(None),
    code_challenge: str | None = Query(None),
    code_challenge_method: str | None = Query(None),
):
    if response_type != "code":
        raise ProblemDetail(status=400, title="unsupported_response_type", detail="Only code is supported")
    if not code_challenge or code_challenge_method != "S256":
        raise ProblemDetail(
            status=400,
            title="invalid_request",
            detail="PKCE code_challenge with S256 is required",
        )

    app = await oidc_service.get_application(db, client_id)
    if app is None:
        raise ProblemDetail(status=400, title="invalid_client", detail="Unknown client_id")
    if not oidc_service.validate_redirect_uri(app, redirect_uri):
        raise ProblemDetail(status=400, title="invalid_request", detail="redirect_uri mismatch")

    session = await get_current_session(request, db, redis)
    if session is None:
        qs = urlencode({"redirect": str(request.url)})
        return RedirectResponse(url=f"/login?{qs}", status_code=302)

    user_result = await db.execute(select(User).where(User.id == session.user_id))
    user = user_result.scalar_one()
    decision = await access_service.decide(db, user=user, application=app, action=APP_ACCESS)
    if not decision.allowed:
        await audit_service.record(
            db,
            redis,
            tenant_id=user.tenant_id,
            actor=user.email,
            action="access.denied",
            target=str(app.id),
            payload={"reason": decision.reason, "policies": decision.matched_policies, "via": "oidc"},
        )
        params = {"error": "access_denied", "error_description": decision.message}
        if state:
            params["state"] = state
        sep = "&" if "?" in redirect_uri else "?"
        return RedirectResponse(url=f"{redirect_uri}{sep}{urlencode(params)}", status_code=302)

    code = generate_token(32)
    await oidc_service.store_auth_code(
        redis,
        code=code,
        client_id=client_id,
        user_id=session.user_id,
        session_id=session.id,
        redirect_uri=redirect_uri,
        code_challenge=code_challenge,
        code_challenge_method=code_challenge_method,
        scope=scope,
        nonce=nonce,
    )
    params = {"code": code}
    if state:
        params["state"] = state
    sep = "&" if "?" in redirect_uri else "?"
    return RedirectResponse(url=f"{redirect_uri}{sep}{urlencode(params)}", status_code=302)


@router.post("/oauth2/token")
async def token(
    request: Request,
    db: DbDep,
    redis: RedisDep,
    grant_type: str = Form(...),
    code: str | None = Form(None),
    redirect_uri: str | None = Form(None),
    client_id: str = Form(...),
    code_verifier: str | None = Form(None),
    refresh_token: str | None = Form(None),
):
    settings = get_settings()
    allowed, retry = await rate_limiter.hit(
        redis,
        f"sso:rl:token:{request.client.host if request.client else 'unknown'}:{client_id}",
        settings.token_rate_limit_per_minute,
        60,
    )
    if not allowed:
        return JSONResponse(
            {"error": "temporarily_unavailable", "error_description": "Rate limit exceeded"},
            status_code=429,
            headers={"Retry-After": str(retry)},
        )
    if grant_type == "authorization_code":
        if not code or not redirect_uri or not code_verifier:
            return JSONResponse(
                {
                    "error": "invalid_request",
                    "error_description": "Missing code, redirect_uri, or code_verifier",
                },
                status_code=400,
            )
        stored = await oidc_service.consume_auth_code(redis, code)
        if stored is None:
            return JSONResponse(
                {"error": "invalid_grant", "error_description": "Invalid or expired code"},
                status_code=400,
            )
        if stored["client_id"] != client_id or stored["redirect_uri"] != redirect_uri:
            return JSONResponse(
                {"error": "invalid_grant", "error_description": "Code mismatch"},
                status_code=400,
            )
        if not oidc_service.verify_code_challenge(
            code_verifier, stored["code_challenge"], stored["code_challenge_method"]
        ):
            return JSONResponse(
                {"error": "invalid_grant", "error_description": "PKCE verification failed"},
                status_code=400,
            )
        app = await oidc_service.get_application(db, client_id)
        if app is None:
            return JSONResponse({"error": "invalid_client"}, status_code=400)
        user_result = await db.execute(select(User).where(User.id == uuid.UUID(stored["user_id"])))
        user = user_result.scalar_one()
        decision = await access_service.decide(db, user=user, application=app, action=APP_ACCESS)
        if not decision.allowed:
            return JSONResponse(
                {"error": "access_denied", "error_description": decision.message},
                status_code=403,
            )
        tokens = await oidc_service.issue_tokens(
            db,
            redis,
            user=user,
            app=app,
            session_id=uuid.UUID(stored["session_id"]),
            scope=stored.get("scope") or "openid",
            nonce=stored.get("nonce"),
        )
        return tokens

    if grant_type == "refresh_token":
        if not refresh_token:
            return JSONResponse({"error": "invalid_request"}, status_code=400)
        try:
            return await oidc_service.rotate_refresh(
                db, redis, refresh_token=refresh_token, client_id=client_id
            )
        except AccessDenied as exc:
            return JSONResponse(
                {"error": "access_denied", "error_description": str(exc)},
                status_code=403,
            )
        except ValueError as exc:
            return JSONResponse(
                {"error": "invalid_grant", "error_description": str(exc)},
                status_code=400,
            )

    return JSONResponse({"error": "unsupported_grant_type"}, status_code=400)


@router.get("/oauth2/userinfo")
async def userinfo(
    db: DbDep,
    redis: RedisDep,
    authorization: Annotated[str | None, Header()] = None,
):
    claims = await get_bearer_claims(db, redis, authorization)
    attributes: dict = {}
    roles: list[str] = list(claims.get("roles") or [])
    permissions: list[str] = list(claims.get("permissions") or [])
    sub = claims.get("sub")
    if sub:
        user_id = uuid.UUID(sub)
        attributes = await access_service.subject_custom_attributes(db, user_id)
        roles = await role_service.user_role_names(db, user_id)
        permissions = await role_service.user_permissions(db, user_id)
    return {
        "sub": sub,
        "email": claims.get("email"),
        "name": claims.get("name"),
        "groups": claims.get("groups", []),
        "roles": roles,
        "permissions": permissions,
        "attributes": attributes,
        "tenant_id": claims.get("tenant_id"),
    }


# MFA enrollment / verify
class MfaEnrollResponse(BaseModel):
    factor_id: str
    secret: str
    otpauth_uri: str


@router.post("/mfa/totp/enroll", response_model=MfaEnrollResponse)
async def enroll_totp(
    request: Request,
    db: DbDep,
    redis: RedisDep,
):
    session = await get_current_session(request, db, redis)
    if session is None:
        raise ProblemDetail(status=401, title="Unauthorized", detail="Authentication required")
    factor, secret, uri = await mfa_service.enroll_totp(db, session.user_id)
    await audit_service.record(
        db,
        redis,
        tenant_id=session.tenant_id,
        actor=str(session.user_id),
        action="mfa.enroll",
        target=str(factor.id),
    )
    return MfaEnrollResponse(factor_id=str(factor.id), secret=secret, otpauth_uri=uri)


class MfaVerifyRequest(BaseModel):
    code: str


@router.post("/mfa/totp/verify")
async def verify_totp(
    body: MfaVerifyRequest,
    request: Request,
    db: DbDep,
    redis: RedisDep,
):
    session = await get_current_session(request, db, redis)
    if session is None:
        raise ProblemDetail(status=401, title="Unauthorized", detail="Authentication required")
    ok = await mfa_service.verify_totp(db, session.user_id, body.code)
    if not ok:
        raise ProblemDetail(status=401, title="Unauthorized", detail="Invalid MFA code")
    await session_service.mark_mfa_verified(db, redis, session)
    return {"verified": True}
