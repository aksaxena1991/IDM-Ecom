"""Admin API to create and revoke SCIM bearer tokens."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.core.deps import _rate_limited
from app.core.deps import DbDep, RedisDep, require_permission
from app.core.middleware import ProblemDetail
from app.core.permissions import ADMIN_ACCESS, USERS_WRITE
from app.core.security import generate_token, hash_token
from app.models.entities import ScimToken, User
from app.features.audit.services import audit_service

router = APIRouter(prefix="/v1", tags=["scim-tokens"])

ScimTokenAdminDep = Annotated[User, Depends(_rate_limited(require_permission(USERS_WRITE, ADMIN_ACCESS)))]


class ScimTokenCreate(BaseModel):
    label: str | None = Field(default=None, max_length=255)


@router.get("/scim-tokens")
async def list_scim_tokens(db: DbDep, admin: ScimTokenAdminDep) -> dict[str, Any]:
    result = await db.execute(
        select(ScimToken)
        .where(ScimToken.tenant_id == admin.tenant_id)
        .order_by(ScimToken.created_at.desc())
    )
    items = [
        {
            "id": str(t.id),
            "label": t.label,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "revoked_at": t.revoked_at.isoformat() if t.revoked_at else None,
            "active": t.revoked_at is None,
        }
        for t in result.scalars().all()
    ]
    return {"items": items}


@router.post("/scim-tokens", status_code=201)
async def create_scim_token(
    body: ScimTokenCreate, db: DbDep, redis: RedisDep, admin: ScimTokenAdminDep
) -> dict[str, Any]:
    plaintext = generate_token(32)
    row = ScimToken(
        tenant_id=admin.tenant_id,
        token_hash=hash_token(plaintext),
        label=body.label,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="scim_token.create",
        target=str(row.id),
        payload={"label": body.label},
    )
    return {
        "id": str(row.id),
        "label": row.label,
        "token": plaintext,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


@router.post("/scim-tokens/{token_id}/revoke")
async def revoke_scim_token(
    token_id: uuid.UUID, db: DbDep, redis: RedisDep, admin: ScimTokenAdminDep
) -> dict[str, Any]:
    result = await db.execute(
        select(ScimToken)
        .where(ScimToken.id == token_id)
        .where(ScimToken.tenant_id == admin.tenant_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise ProblemDetail(status=404, title="Not Found", detail="SCIM token not found")
    if row.revoked_at is None:
        row.revoked_at = datetime.now(timezone.utc)
        await db.commit()
        await audit_service.record(
            db,
            redis,
            tenant_id=admin.tenant_id,
            actor=admin.email,
            action="scim_token.revoke",
            target=str(row.id),
        )
    return {"ok": True, "id": str(row.id), "revoked_at": row.revoked_at.isoformat() if row.revoked_at else None}
