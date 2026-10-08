from __future__ import annotations

import base64
import uuid
from datetime import datetime, timezone
from pathlib import Path

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, rsa
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.entities import SigningKey


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_int(val: int) -> str:
    length = (val.bit_length() + 7) // 8
    return _b64url(val.to_bytes(length, "big"))


def _ec_jwk(public_key, kid: str, alg: str) -> dict:
    numbers = public_key.public_numbers()
    return {
        "kty": "EC",
        "crv": "P-256",
        "x": _b64url(numbers.x.to_bytes(32, "big")),
        "y": _b64url(numbers.y.to_bytes(32, "big")),
        "kid": kid,
        "use": "sig",
        "alg": alg,
    }


def _rsa_jwk(public_key, kid: str, alg: str) -> dict:
    numbers = public_key.public_numbers()
    return {
        "kty": "RSA",
        "n": _b64url_int(numbers.n),
        "e": _b64url_int(numbers.e),
        "kid": kid,
        "use": "sig",
        "alg": alg,
    }


class KeyStore:
    """Local file-backed signing keys with DB metadata (KMS interface later)."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.keys_dir = Path(self.settings.signing_keys_dir)
        self.keys_dir.mkdir(parents=True, exist_ok=True)

    def _private_path(self, kid: str) -> Path:
        return self.keys_dir / f"{kid}.pem"

    async def ensure_active_es256_key(
        self, db: AsyncSession, tenant_id: uuid.UUID | None = None
    ) -> SigningKey:
        result = await db.execute(
            select(SigningKey)
            .where(SigningKey.algorithm == "ES256")
            .where(SigningKey.retired_at.is_(None))
            .order_by(SigningKey.active_from.desc())
            .limit(1)
        )
        existing = result.scalar_one_or_none()
        if existing and self._private_path(existing.kid).exists():
            return existing

        private_key = ec.generate_private_key(ec.SECP256R1())
        public_key = private_key.public_key()
        kid = f"es256-{uuid.uuid4().hex[:16]}"

        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        self._private_path(kid).write_bytes(private_pem)

        key = SigningKey(
            kid=kid,
            algorithm="ES256",
            public_key=public_pem.decode("utf-8"),
            private_key_ref=str(self._private_path(kid)),
            tenant_id=tenant_id,
            active_from=datetime.now(timezone.utc),
        )
        db.add(key)
        await db.commit()
        await db.refresh(key)
        return key

    async def ensure_active_rs256_key(
        self, db: AsyncSession, tenant_id: uuid.UUID | None = None
    ) -> SigningKey:
        result = await db.execute(
            select(SigningKey)
            .where(SigningKey.algorithm == "RS256")
            .where(SigningKey.retired_at.is_(None))
            .order_by(SigningKey.active_from.desc())
            .limit(1)
        )
        existing = result.scalar_one_or_none()
        if existing and self._private_path(existing.kid).exists():
            return existing

        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        public_key = private_key.public_key()
        kid = f"rs256-{uuid.uuid4().hex[:16]}"

        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        self._private_path(kid).write_bytes(private_pem)

        key = SigningKey(
            kid=kid,
            algorithm="RS256",
            public_key=public_pem.decode("utf-8"),
            private_key_ref=str(self._private_path(kid)),
            tenant_id=tenant_id,
            active_from=datetime.now(timezone.utc),
        )
        db.add(key)
        await db.commit()
        await db.refresh(key)
        return key

    def load_private_pem(self, key: SigningKey) -> bytes:
        return Path(key.private_key_ref).read_bytes()

    def sign_jwt(self, key: SigningKey, claims: dict, headers: dict | None = None) -> str:
        private_pem = self.load_private_pem(key)
        hdr = {"kid": key.kid, "alg": key.algorithm}
        if headers:
            hdr.update(headers)
        return jwt.encode(claims, private_pem, algorithm=key.algorithm, headers=hdr)

    def verify_jwt(self, token: str, key: SigningKey, audience: str | None = None) -> dict:
        return jwt.decode(
            token,
            key.public_key,
            algorithms=[key.algorithm],
            audience=audience,
            options={"verify_aud": audience is not None},
        )

    async def jwks(self, db: AsyncSession) -> dict:
        result = await db.execute(select(SigningKey).where(SigningKey.retired_at.is_(None)))
        keys = []
        for sk in result.scalars().all():
            public = serialization.load_pem_public_key(sk.public_key.encode("utf-8"))
            if sk.algorithm == "ES256":
                keys.append(_ec_jwk(public, sk.kid, sk.algorithm))
            elif sk.algorithm == "RS256":
                keys.append(_rsa_jwk(public, sk.kid, sk.algorithm))
        return {"keys": keys}

    async def get_key_by_kid(self, db: AsyncSession, kid: str) -> SigningKey | None:
        result = await db.execute(select(SigningKey).where(SigningKey.kid == kid))
        return result.scalar_one_or_none()

    async def get_active_key(self, db: AsyncSession, algorithm: str = "ES256") -> SigningKey | None:
        result = await db.execute(
            select(SigningKey)
            .where(SigningKey.algorithm == algorithm)
            .where(SigningKey.retired_at.is_(None))
            .order_by(SigningKey.active_from.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()


keystore = KeyStore()
