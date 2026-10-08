from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, Header, Request
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.db import get_db
from app.core.errors import ProblemDetail
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
    session_id_raw = request.cookies.get(cookie_name)
    if not session_id_raw:
        return None
    try:
        session_id = uuid.UUID(session_id_raw)
    except ValueError:
        return None
    session = await session_service.get(db, redis, session_id)
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


async def require_admin(
    db: DbDep,
    redis: RedisDep,
    claims: Annotated[dict, Depends(get_bearer_claims)],
    request: Request,
) -> User:
    user_id = uuid.UUID(claims["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or user.status != UserStatus.active:
        raise ProblemDetail(status=403, title="Forbidden", detail="Admin required")

    is_admin = await role_service.is_admin_principal(db, user.id, is_admin_flag=user.is_admin)
    if not is_admin:
        raise ProblemDetail(status=403, title="Forbidden", detail="Admin required")

    # Step-up MFA for writes older than 15 minutes
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        sid = claims.get("sid")
        if sid:
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
    return user


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
