"""Drop audit events older than retention period."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, text

from app.core.config import get_settings
from app.core.db import SessionLocal, engine
from app.models.entities import AuditEvent

logger = logging.getLogger(__name__)


async def run_retention_once() -> int:
    settings = get_settings()
    cutoff = datetime.now(timezone.utc) - timedelta(days=settings.audit_retention_days)
    async with SessionLocal() as db:
        result = await db.execute(delete(AuditEvent).where(AuditEvent.occurred_at < cutoff))
        await db.commit()
        deleted = result.rowcount or 0
        logger.info("Deleted %s audit events older than %s", deleted, cutoff.isoformat())
        return deleted


async def ensure_rls_policies() -> None:
    """Enable basic RLS on tenant-scoped tables (Postgres only)."""
    statements = [
        "ALTER TABLE users ENABLE ROW LEVEL SECURITY",
        "ALTER TABLE applications ENABLE ROW LEVEL SECURITY",
        "ALTER TABLE groups ENABLE ROW LEVEL SECURITY",
        "ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY",
        """
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_users') THEN
            CREATE POLICY tenant_isolation_users ON users
              USING (tenant_id::text = current_setting('app.tenant_id', true));
          END IF;
        END $$;
        """,
    ]
    async with engine.begin() as conn:
        for stmt in statements:
            try:
                await conn.execute(text(stmt))
            except Exception as exc:  # noqa: BLE001
                logger.warning("RLS setup skipped/failed: %s", exc)


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    await ensure_rls_policies()
    await run_retention_once()


if __name__ == "__main__":
    asyncio.run(main())
