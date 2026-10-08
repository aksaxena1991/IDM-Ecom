from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.api.deps import DbDep, RedisDep, get_current_session
from app.core.config import get_settings
from app.core.errors import ProblemDetail
from app.services.audit_service import audit_service
from app.services.session_service import session_service

router = APIRouter(tags=["session"])


@router.post("/session/logout")
async def logout(request: Request, response: Response, db: DbDep, redis: RedisDep):
    settings = get_settings()
    session = await get_current_session(request, db, redis)
    if session is None:
        raise ProblemDetail(status=401, title="Unauthorized", detail="No active session")
    await session_service.revoke(db, redis, session.id)
    await audit_service.record(
        db,
        redis,
        tenant_id=session.tenant_id,
        actor=str(session.user_id),
        action="session.logout",
        target=str(session.id),
    )
    response = Response(status_code=204)
    response.delete_cookie(settings.cookie_name, path="/")
    return response


@router.get("/session/me")
async def session_me(request: Request, db: DbDep, redis: RedisDep):
    session = await get_current_session(request, db, redis)
    if session is None:
        raise ProblemDetail(status=401, title="Unauthorized", detail="No active session")
    return {
        "session_id": str(session.id),
        "user_id": str(session.user_id),
        "tenant_id": str(session.tenant_id),
        "expires_at": session.expires_at.isoformat(),
        "absolute_expires_at": session.absolute_expires_at.isoformat(),
        "mfa_verified_at": session.mfa_verified_at.isoformat() if session.mfa_verified_at else None,
    }
