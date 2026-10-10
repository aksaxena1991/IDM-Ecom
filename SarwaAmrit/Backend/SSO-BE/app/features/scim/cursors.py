"""Directory sync cursor stubs (Entra/Google sync deferred)."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select

from app.core.deps import AdminDep
from app.core.deps import DbDep
from app.models.entities import SyncCursor

router = APIRouter(prefix="/v1", tags=["sync"])


class SyncCursorOut(BaseModel):
    source: str
    last_token: str | None


@router.get("/sync-cursors")
async def list_sync_cursors(db: DbDep, admin: AdminDep):
    result = await db.execute(select(SyncCursor).where(SyncCursor.tenant_id == admin.tenant_id))
    rows = result.scalars().all()
    return {
        "items": [{"source": r.source, "last_token": r.last_token} for r in rows],
        "note": "Entra ID and Google Workspace sync workers are deferred; cursors are reserved.",
    }


@router.put("/sync-cursors/{source}")
async def upsert_sync_cursor(source: str, body: SyncCursorOut, db: DbDep, admin: AdminDep):
    result = await db.execute(
        select(SyncCursor)
        .where(SyncCursor.tenant_id == admin.tenant_id)
        .where(SyncCursor.source == source)
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = SyncCursor(tenant_id=admin.tenant_id, source=source, last_token=body.last_token)
        db.add(row)
    else:
        row.last_token = body.last_token
    await db.commit()
    return {"source": source, "last_token": body.last_token}
