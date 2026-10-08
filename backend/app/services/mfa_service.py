from __future__ import annotations

import uuid

import pyotp
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_secret, encrypt_secret
from app.models.entities import MfaFactor, MfaType


class MfaService:
    async def enroll_totp(
        self, db: AsyncSession, user_id: uuid.UUID, *, label: str | None = None
    ) -> tuple[MfaFactor, str, str]:
        secret = pyotp.random_base32()
        factor = MfaFactor(
            user_id=user_id,
            type=MfaType.totp,
            secret_ref=encrypt_secret(secret),
            label=label or "Authenticator",
        )
        db.add(factor)
        await db.commit()
        await db.refresh(factor)
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=label or str(user_id), issuer_name="SSO")
        return factor, secret, uri

    async def get_totp_factors(self, db: AsyncSession, user_id: uuid.UUID) -> list[MfaFactor]:
        result = await db.execute(
            select(MfaFactor)
            .where(MfaFactor.user_id == user_id)
            .where(MfaFactor.type == MfaType.totp)
        )
        return list(result.scalars().all())

    async def verify_totp(self, db: AsyncSession, user_id: uuid.UUID, code: str) -> bool:
        factors = await self.get_totp_factors(db, user_id)
        for factor in factors:
            secret = decrypt_secret(factor.secret_ref)
            if pyotp.TOTP(secret).verify(code, valid_window=1):
                return True
        return False

    async def has_mfa(self, db: AsyncSession, user_id: uuid.UUID) -> bool:
        factors = await self.get_totp_factors(db, user_id)
        return len(factors) > 0


mfa_service = MfaService()
