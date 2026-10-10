from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.entities import AuditEvent


class AuditService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def record(
        self,
        db: AsyncSession,
        redis: Redis | None,
        *,
        tenant_id: uuid.UUID,
        actor: str,
        action: str,
        target: str | None = None,
        payload: dict[str, Any] | None = None,
        commit: bool = True,
    ) -> AuditEvent:
        event = AuditEvent(
            tenant_id=tenant_id,
            actor=actor,
            action=action,
            target=target,
            occurred_at=datetime.now(timezone.utc),
            payload=payload or {},
        )
        db.add(event)
        if commit:
            await db.commit()
            await db.refresh(event)
        else:
            await db.flush()

        if redis is not None:
            await redis.xadd(
                self.settings.audit_stream_key,
                {
                    "id": str(event.id),
                    "tenant_id": str(tenant_id),
                    "actor": actor,
                    "action": action,
                    "target": target or "",
                    "payload": json.dumps(payload or {}),
                },
            )
        return event


audit_service = AuditService()
