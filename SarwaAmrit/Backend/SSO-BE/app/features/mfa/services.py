from __future__ import annotations

import uuid
from datetime import datetime, timezone

import pyotp
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_secret, encrypt_secret
from app.models.entities import MfaFactor, MfaType


class MfaService:
    async def enroll_totp(
        self, db: AsyncSession, user_id: uuid.UUID, *, label: str | None = None
    ) -> tuple[MfaFactor, str, str]:
        """Create a pending TOTP factor (verified_at is null until first successful code)."""
        secret = pyotp.random_base32()
        factor = MfaFactor(
            user_id=user_id,
            type=MfaType.totp,
            secret_ref=encrypt_secret(secret),
            label=label or "Authenticator",
            verified_at=None,
        )
        db.add(factor)
        await db.commit()
        await db.refresh(factor)
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=label or str(user_id), issuer_name="SSO")
        return factor, secret, uri

    async def get_totp_factors(
        self, db: AsyncSession, user_id: uuid.UUID, *, verified_only: bool = False
    ) -> list[MfaFactor]:
        stmt = (
            select(MfaFactor)
            .where(MfaFactor.user_id == user_id)
            .where(MfaFactor.type == MfaType.totp)
        )
        if verified_only:
            stmt = stmt.where(MfaFactor.verified_at.is_not(None))
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def verify_totp(self, db: AsyncSession, user_id: uuid.UUID, code: str) -> bool:
        factors = await self.get_totp_factors(db, user_id, verified_only=False)
        now = datetime.now(timezone.utc)
        for factor in factors:
            secret = decrypt_secret(factor.secret_ref)
            if pyotp.TOTP(secret).verify(code, valid_window=1):
                if factor.verified_at is None:
                    factor.verified_at = now
                    await db.commit()
                return True
        return False

    async def has_mfa(self, db: AsyncSession, user_id: uuid.UUID) -> bool:
        factors = await self.get_totp_factors(db, user_id, verified_only=True)
        return len(factors) > 0


mfa_service = MfaService()
