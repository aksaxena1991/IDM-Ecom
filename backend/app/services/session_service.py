from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone

from redis.asyncio import Redis
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import generate_token, hash_token
from app.models.entities import RefreshToken, Session


class SessionService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _redis_key(self, session_id: uuid.UUID) -> str:
        return f"sso:session:{session_id}"

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    async def create(
        self,
        db: AsyncSession,
        redis: Redis,
        *,
        user_id: uuid.UUID,
        tenant_id: uuid.UUID,
        mfa_verified: bool = False,
    ) -> tuple[Session, str]:
        now = self._now()
        idle = timedelta(minutes=self.settings.session_idle_minutes)
        absolute = timedelta(hours=self.settings.session_absolute_hours)
        plain = generate_token(32)
        session = Session(
            user_id=user_id,
            tenant_id=tenant_id,
            token_hash=hash_token(plain),
            created_at=now,
            last_seen_at=now,
            expires_at=now + idle,
            absolute_expires_at=now + absolute,
            mfa_verified_at=now if mfa_verified else None,
            admin_step_up_at=now if mfa_verified else None,
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        await self._write_redis(redis, session)
        return session, plain

    async def _write_redis(self, redis: Redis, session: Session) -> None:
        payload = {
            "id": str(session.id),
            "user_id": str(session.user_id),
            "tenant_id": str(session.tenant_id),
            "created_at": session.created_at.isoformat(),
            "last_seen_at": session.last_seen_at.isoformat(),
            "expires_at": session.expires_at.isoformat(),
            "absolute_expires_at": session.absolute_expires_at.isoformat(),
            "revoked_at": session.revoked_at.isoformat() if session.revoked_at else None,
            "mfa_verified_at": session.mfa_verified_at.isoformat() if session.mfa_verified_at else None,
            "admin_step_up_at": session.admin_step_up_at.isoformat() if session.admin_step_up_at else None,
        }
        ttl = max(1, int((session.absolute_expires_at - self._now()).total_seconds()))
        await redis.set(self._redis_key(session.id), json.dumps(payload), ex=ttl)

    async def get(self, db: AsyncSession, redis: Redis, session_id: uuid.UUID) -> Session | None:
        cached = await redis.get(self._redis_key(session_id))
        if cached:
            data = json.loads(cached)
            if data.get("revoked_at"):
                return None
            expires_at = datetime.fromisoformat(data["expires_at"])
            absolute = datetime.fromisoformat(data["absolute_expires_at"])
            now = self._now()
            if now > expires_at or now > absolute:
                return None

        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one_or_none()
        return self._validate(session)

    async def get_by_token(self, db: AsyncSession, redis: Redis, token: str) -> Session | None:
        """Resolve opaque cookie token (preferred) or legacy raw session UUID."""
        hashed = hash_token(token)
        result = await db.execute(select(Session).where(Session.token_hash == hashed))
        session = result.scalar_one_or_none()
        if session is None:
            try:
                return await self.get(db, redis, uuid.UUID(token))
            except ValueError:
                return None
        return self._validate(session)

    def _validate(self, session: Session | None) -> Session | None:
        if session is None:
            return None
        if session.revoked_at is not None:
            return None
        now = self._now()
        if now > session.expires_at or now > session.absolute_expires_at:
            return None
        return session

    async def touch(self, db: AsyncSession, redis: Redis, session: Session) -> Session:
        now = self._now()
        idle = timedelta(minutes=self.settings.session_idle_minutes)
        new_expires = min(now + idle, session.absolute_expires_at)
        session.last_seen_at = now
        session.expires_at = new_expires
        await db.commit()
        await db.refresh(session)
        await self._write_redis(redis, session)
        return session

    async def revoke(self, db: AsyncSession, redis: Redis, session_id: uuid.UUID) -> None:
        now = self._now()
        await db.execute(
            update(Session).where(Session.id == session_id).values(revoked_at=now)
        )
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.session_id == session_id)
            .where(RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await db.commit()
        await redis.delete(self._redis_key(session_id))

    async def revoke_user_sessions(self, db: AsyncSession, redis: Redis, user_id: uuid.UUID) -> int:
        result = await db.execute(
            select(Session).where(Session.user_id == user_id).where(Session.revoked_at.is_(None))
        )
        sessions = list(result.scalars().all())
        for session in sessions:
            await self.revoke(db, redis, session.id)
        return len(sessions)

    async def mark_mfa_verified(self, db: AsyncSession, redis: Redis, session: Session) -> Session:
        now = self._now()
        session.mfa_verified_at = now
        session.admin_step_up_at = now
        await db.commit()
        await db.refresh(session)
        await self._write_redis(redis, session)
        return session


session_service = SessionService()
