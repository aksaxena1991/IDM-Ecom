from __future__ import annotations

import uuid
from collections.abc import Callable, Coroutine
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

from fastapi import Depends, Header, Request
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.db import get_db
from app.core.errors import ProblemDetail
from app.core.permissions import ADMIN_ACCESS, READ_IMPLIED_BY_WRITE
from app.core.redis import get_redis
from app.core.security import hash_token
from app.models.entities import ScimToken, Session, User, UserStatus
from app.services.oidc_service import oidc_service
from app.services.role_service import role_service
from app.services.session_service import session_service

DbDep = Annotated[AsyncSession, Depends(get_db)]
RedisDep = Annotated[Redis, Depends(get_redis)]


async def get_current_session(
    request: Request,
    db: DbDep,
    redis: RedisDep,
) -> Session | None:
    settings = get_settings()
    cookie_name = settings.cookie_name
    raw = request.cookies.get(cookie_name)
    if not raw:
        return None
    session = await session_service.get_by_token(db, redis, raw)
    if session is None:
        return None
    await session_service.touch(db, redis, session)
    return session


async def require_session(
    session: Annotated[Session | None, Depends(get_current_session)],
) -> Session:
    if session is None:
        raise ProblemDetail(status=401, title="Unauthorized", detail="Authentication required")
    return session


async def get_current_user(
    db: DbDep,
    session: Annotated[Session, Depends(require_session)],
) -> User:
    result = await db.execute(select(User).where(User.id == session.user_id))
    user = result.scalar_one_or_none()
    if user is None or user.status != UserStatus.active:
        raise ProblemDetail(status=401, title="Unauthorized", detail="User inactive")
    return user


async def get_bearer_claims(
    db: DbDep,
    redis: RedisDep,
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise ProblemDetail(status=401, title="Unauthorized", detail="Bearer token required")
    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = await oidc_service.decode_access_token(db, token)
    except Exception as exc:  # noqa: BLE001
        raise ProblemDetail(status=401, title="Unauthorized", detail="Invalid access token") from exc
    jti = claims.get("jti")
    if jti and await oidc_service.is_token_revoked(redis, jti):
        raise ProblemDetail(status=401, title="Unauthorized", detail="Token revoked")
    return claims


async def _load_active_user(db: AsyncSession, claims: dict) -> User:
    user_id = uuid.UUID(claims["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or user.status != UserStatus.active:
        raise ProblemDetail(status=403, title="Forbidden", detail="Admin required")
    return user


async def _enforce_admin_step_up(
    db: AsyncSession, redis: Redis, claims: dict, request: Request, user: User
) -> None:
    if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
        return
    settings = get_settings()
    from app.services.mfa_service import mfa_service

    if settings.require_admin_mfa and not await mfa_service.has_mfa(db, user.id):
        raise ProblemDetail(
            status=403,
            title="MFA required",
            detail="Admin writes require an enrolled and verified MFA factor",
        )
    sid = claims.get("sid")
    if not sid:
        raise ProblemDetail(
            status=401,
            title="Step-up required",
            detail="MFA step-up required for admin writes",
            extensions={"challenge": "mfa_step_up"},
        )
    session = await session_service.get(db, redis, uuid.UUID(sid))
    if session is None or session.admin_step_up_at is None:
        raise ProblemDetail(
            status=401,
            title="Step-up required",
            detail="MFA step-up required for admin writes",
            extensions={"challenge": "mfa_step_up"},
        )
    if session.admin_step_up_at < datetime.now(timezone.utc) - timedelta(minutes=15):
        raise ProblemDetail(
            status=401,
            title="Step-up required",
            detail="MFA step-up required for admin writes",
            extensions={"challenge": "mfa_step_up"},
        )


async def _user_has_any_permission(db: AsyncSession, user: User, permissions: tuple[str, ...]) -> bool:
    if await role_service.is_admin_principal(db, user.id, is_admin_flag=user.is_admin):
        return True
    held = set(await role_service.user_permissions(db, user.id))
    if ADMIN_ACCESS in held or "admin:*" in held or "*" in held:
        return True
    for perm in permissions:
        if perm in held:
            return True
        for writer in READ_IMPLIED_BY_WRITE.get(perm, ()):
            if writer in held:
                return True
        prefix = perm.split(":")[0] + ":*"
        if prefix in held:
            return True
    return False


async def require_admin(
    db: DbDep,
    redis: RedisDep,
    claims: Annotated[dict, Depends(get_bearer_claims)],
    request: Request,
) -> User:
    """Any admin-console principal (is_admin or admin:access)."""
    user = await _load_active_user(db, claims)
    if not await role_service.is_admin_principal(db, user.id, is_admin_flag=user.is_admin):
        raise ProblemDetail(status=403, title="Forbidden", detail="Admin required")
    await _enforce_admin_step_up(db, redis, claims, request, user)
    return user


def require_permission(
    *permissions: str,
) -> Callable[..., Coroutine[Any, Any, User]]:
    """Allow if superuser (is_admin / admin:access) or user holds any listed permission."""

    async def _dep(
        db: DbDep,
        redis: RedisDep,
        claims: Annotated[dict, Depends(get_bearer_claims)],
        request: Request,
    ) -> User:
        user = await _load_active_user(db, claims)
        if not await _user_has_any_permission(db, user, permissions):
            raise ProblemDetail(
                status=403,
                title="Forbidden",
                detail=f"Permission required: {' or '.join(permissions)}",
            )
        await _enforce_admin_step_up(db, redis, claims, request, user)
        return user

    return _dep


async def require_scim_token(
    db: DbDep,
    authorization: Annotated[str | None, Header()] = None,
) -> uuid.UUID:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise ProblemDetail(status=401, title="Unauthorized", detail="SCIM bearer token required")
    token = authorization.split(" ", 1)[1].strip()
    result = await db.execute(
        select(ScimToken).where(ScimToken.token_hash == hash_token(token)).where(ScimToken.revoked_at.is_(None))
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise ProblemDetail(status=401, title="Unauthorized", detail="Invalid SCIM token")
    return row.tenant_id
