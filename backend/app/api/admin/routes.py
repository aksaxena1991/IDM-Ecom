from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select

from app.api.deps import DbDep, RedisDep, require_admin
from app.core.errors import ProblemDetail
from app.core.security import decode_cursor, encode_cursor, generate_token, hash_password
from app.models.entities import (
    AppAssignment,
    Application,
    AppProtocol,
    AppStatus,
    AuditEvent,
    PrincipalType,
    User,
    UserStatus,
)
from app.services.audit_service import audit_service
from app.services.rate_limit import rate_limiter
from app.core.config import get_settings

router = APIRouter(prefix="/v1", tags=["admin"])


class AppCreate(BaseModel):
    name: str
    protocol: AppProtocol
    redirect_uris: list[str] = Field(default_factory=list)
    acs_url: str | None = None
    entity_id: str | None = None
    audience: str | None = None


class AppUpdate(BaseModel):
    name: str | None = None
    status: AppStatus | None = None
    redirect_uris: list[str] | None = None
    acs_url: str | None = None
    entity_id: str | None = None
    audience: str | None = None


class AssignmentBody(BaseModel):
    assignments: list[dict[str, str]]


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str | None
    status: UserStatus
    is_admin: bool

    model_config = {"from_attributes": True}


async def _rate_limit_admin(redis: RedisDep, admin: User = Depends(require_admin)) -> User:
    settings = get_settings()
    allowed, retry = await rate_limiter.hit(
        redis,
        f"sso:admin:rl:{admin.id}",
        settings.admin_rate_limit_per_minute,
        60,
    )
    if not allowed:
        raise ProblemDetail(
            status=429,
            title="Too Many Requests",
            detail="Admin rate limit exceeded",
            extensions={"retry_after": retry},
        )
    return admin


AdminDep = Annotated[User, Depends(_rate_limit_admin)]


def _reject_wildcards(uris: list[str]) -> None:
    if any("*" in u for u in uris):
        raise ProblemDetail(
            status=400,
            title="Validation Error",
            detail="Wildcard redirect URIs are not allowed",
        )


@router.get("/apps")
async def list_apps(db: DbDep, admin: AdminDep):
    result = await db.execute(
        select(Application).where(Application.tenant_id == admin.tenant_id).order_by(Application.name)
    )
    apps = result.scalars().all()
    return {
        "items": [
            {
                "id": str(a.id),
                "name": a.name,
                "client_id": a.client_id,
                "protocol": a.protocol.value,
                "status": a.status.value,
                "config": a.config,
            }
            for a in apps
        ]
    }


@router.post("/apps", status_code=201)
async def create_app(body: AppCreate, db: DbDep, redis: RedisDep, admin: AdminDep):
    _reject_wildcards(body.redirect_uris)
    config: dict[str, Any] = {"redirect_uris": body.redirect_uris}
    if body.protocol == AppProtocol.saml:
        config.update(
            {
                "acs_url": body.acs_url,
                "entity_id": body.entity_id,
                "audience": body.audience or body.entity_id,
            }
        )
    app = Application(
        tenant_id=admin.tenant_id,
        name=body.name,
        client_id=generate_token(16),
        protocol=body.protocol,
        status=AppStatus.active,
        config=config,
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="app.create",
        target=str(app.id),
        payload={"name": app.name, "protocol": app.protocol.value},
    )
    return {
        "id": str(app.id),
        "name": app.name,
        "client_id": app.client_id,
        "protocol": app.protocol.value,
        "status": app.status.value,
        "config": app.config,
    }


@router.patch("/apps/{app_id}")
async def patch_app(app_id: uuid.UUID, body: AppUpdate, db: DbDep, redis: RedisDep, admin: AdminDep):
    result = await db.execute(
        select(Application)
        .where(Application.id == app_id)
        .where(Application.tenant_id == admin.tenant_id)
    )
    app = result.scalar_one_or_none()
    if app is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Application not found")
    if body.redirect_uris is not None:
        _reject_wildcards(body.redirect_uris)
        app.config = {**app.config, "redirect_uris": body.redirect_uris}
    if body.name is not None:
        app.name = body.name
    if body.status is not None:
        app.status = body.status
    if body.acs_url is not None:
        app.config = {**app.config, "acs_url": body.acs_url}
    if body.entity_id is not None:
        app.config = {**app.config, "entity_id": body.entity_id}
    if body.audience is not None:
        app.config = {**app.config, "audience": body.audience}
    await db.commit()
    await db.refresh(app)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="app.update",
        target=str(app.id),
    )
    return {
        "id": str(app.id),
        "name": app.name,
        "client_id": app.client_id,
        "protocol": app.protocol.value,
        "status": app.status.value,
        "config": app.config,
    }


@router.put("/apps/{app_id}/assignments")
async def set_assignments(
    app_id: uuid.UUID, body: AssignmentBody, db: DbDep, redis: RedisDep, admin: AdminDep
):
    result = await db.execute(
        select(Application)
        .where(Application.id == app_id)
        .where(Application.tenant_id == admin.tenant_id)
    )
    app = result.scalar_one_or_none()
    if app is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Application not found")

    existing = await db.execute(select(AppAssignment).where(AppAssignment.application_id == app_id))
    for row in existing.scalars().all():
        await db.delete(row)

    for item in body.assignments:
        ptype = PrincipalType(item["principal_type"])
        pid = uuid.UUID(item["principal_id"])
        db.add(AppAssignment(application_id=app_id, principal_type=ptype, principal_id=pid))
    await db.commit()
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="app.assignments.set",
        target=str(app_id),
        payload={"count": len(body.assignments)},
    )
    return {"ok": True, "count": len(body.assignments)}


@router.get("/users")
async def list_users(
    db: DbDep,
    admin: AdminDep,
    q: str | None = Query(None),
    page_size: int = Query(50, ge=1, le=200),
    cursor: str | None = Query(None),
):
    stmt = select(User).where(User.tenant_id == admin.tenant_id).order_by(User.email)
    if q:
        stmt = stmt.where(User.email.ilike(f"%{q}%"))
    if cursor:
        try:
            email_cursor = decode_cursor(cursor)
            stmt = stmt.where(User.email > email_cursor)
        except Exception as exc:  # noqa: BLE001
            raise ProblemDetail(status=400, title="Bad Request", detail="Invalid cursor") from exc
    stmt = stmt.limit(page_size + 1)
    result = await db.execute(stmt)
    rows = list(result.scalars().all())
    next_cursor = None
    if len(rows) > page_size:
        rows = rows[:page_size]
        next_cursor = encode_cursor(rows[-1].email)
    return {
        "items": [
            {
                "id": str(u.id),
                "email": u.email,
                "name": u.name,
                "status": u.status.value,
                "is_admin": u.is_admin,
            }
            for u in rows
        ],
        "next_cursor": next_cursor,
    }


@router.get("/audit-events")
async def list_audit_events(
    request: Request,
    db: DbDep,
    admin: AdminDep,
    format: str | None = Query(None),
    action: str | None = Query(None),
    actor: str | None = Query(None),
    page_size: int = Query(50, ge=1, le=200),
    cursor: str | None = Query(None),
):
    settings = get_settings()
    stmt = (
        select(AuditEvent)
        .where(AuditEvent.tenant_id == admin.tenant_id)
        .order_by(AuditEvent.occurred_at.desc(), AuditEvent.id.desc())
    )
    if action:
        stmt = stmt.where(AuditEvent.action == action)
    if actor:
        stmt = stmt.where(AuditEvent.actor == actor)

    if format == "csv":
        stmt = stmt.limit(settings.audit_csv_max_rows)
        result = await db.execute(stmt)
        rows = list(result.scalars().all())

        def generate():
            buf = io.StringIO()
            writer = csv.writer(buf)
            writer.writerow(["id", "actor", "action", "target", "occurred_at"])
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)
            for r in rows:
                writer.writerow([str(r.id), r.actor, r.action, r.target or "", r.occurred_at.isoformat()])
                yield buf.getvalue()
                buf.seek(0)
                buf.truncate(0)

        return StreamingResponse(
            generate(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=audit-events.csv"},
        )

    if cursor:
        # cursor = occurred_at|id
        try:
            occurred_s, id_s = decode_cursor(cursor).split("|", 1)
            occurred_at = datetime.fromisoformat(occurred_s)
            cid = uuid.UUID(id_s)
            stmt = stmt.where(
                (AuditEvent.occurred_at < occurred_at)
                | ((AuditEvent.occurred_at == occurred_at) & (AuditEvent.id < cid))
            )
        except Exception as exc:  # noqa: BLE001
            raise ProblemDetail(status=400, title="Bad Request", detail="Invalid cursor") from exc

    stmt = stmt.limit(page_size + 1)
    result = await db.execute(stmt)
    rows = list(result.scalars().all())
    next_cursor = None
    if len(rows) > page_size:
        rows = rows[:page_size]
        last = rows[-1]
        next_cursor = encode_cursor(f"{last.occurred_at.isoformat()}|{last.id}")

    return {
        "items": [
            {
                "id": str(e.id),
                "actor": e.actor,
                "action": e.action,
                "target": e.target,
                "occurred_at": e.occurred_at.isoformat(),
                "payload": e.payload,
            }
            for e in rows
        ],
        "next_cursor": next_cursor,
    }
