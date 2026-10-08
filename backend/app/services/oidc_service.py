from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from redis.asyncio import Redis
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.keystore import keystore
from app.core.security import generate_token, hash_token, verify_pkce
from app.models.entities import Application, AppStatus, RefreshToken, User
from app.services.access_service import APP_ACCESS, AccessDenied, access_service


class OidcService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _code_key(self, code_hash: str) -> str:
        return f"sso:authcode:{code_hash}"

    def _revoked_token_key(self, jti: str) -> str:
        return f"sso:revoked_token:{jti}"

    async def store_auth_code(
        self,
        redis: Redis,
        *,
        code: str,
        client_id: str,
        user_id: uuid.UUID,
        session_id: uuid.UUID,
        redirect_uri: str,
        code_challenge: str,
        code_challenge_method: str,
        scope: str,
        nonce: str | None,
    ) -> None:
        payload = {
            "client_id": client_id,
            "user_id": str(user_id),
            "session_id": str(session_id),
            "redirect_uri": redirect_uri,
            "code_challenge": code_challenge,
            "code_challenge_method": code_challenge_method,
            "scope": scope,
            "nonce": nonce,
        }
        await redis.set(
            self._code_key(hash_token(code)),
            json.dumps(payload),
            ex=self.settings.auth_code_ttl_seconds,
        )

    async def consume_auth_code(self, redis: Redis, code: str) -> dict[str, Any] | None:
        key = self._code_key(hash_token(code))
        raw = await redis.get(key)
        if not raw:
            return None
        await redis.delete(key)
        return json.loads(raw)

    async def get_application(self, db: AsyncSession, client_id: str) -> Application | None:
        result = await db.execute(
            select(Application).where(Application.client_id == client_id)
        )
        app = result.scalar_one_or_none()
        if app is None or app.status != AppStatus.active:
            return None
        return app

    def validate_redirect_uri(self, app: Application, redirect_uri: str) -> bool:
        uris = app.config.get("redirect_uris") or []
        if any("*" in u for u in uris):
            return False
        return redirect_uri in uris

    async def issue_tokens(
        self,
        db: AsyncSession,
        redis: Redis,
        *,
        user: User,
        app: Application,
        session_id: uuid.UUID,
        scope: str,
        nonce: str | None,
        family_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        signing_key = await keystore.ensure_active_es256_key(db)
        jti_access = str(uuid.uuid4())
        jti_id = str(uuid.uuid4())

        groups = await self._user_groups(db, user.id)
        attributes = await access_service.subject_custom_attributes(db, user.id)

        id_claims = {
            "iss": self.settings.base_url,
            "sub": str(user.id),
            "aud": app.client_id,
            "exp": int((now + timedelta(seconds=self.settings.id_token_ttl_seconds)).timestamp()),
            "iat": int(now.timestamp()),
            "auth_time": int(now.timestamp()),
            "email": user.email,
            "name": user.name or user.email,
            "groups": groups,
            "attributes": attributes,
            "tenant_id": str(user.tenant_id),
            "jti": jti_id,
        }
        if nonce:
            id_claims["nonce"] = nonce

        access_claims = {
            "iss": self.settings.base_url,
            "sub": str(user.id),
            "aud": app.client_id,
            "exp": int((now + timedelta(seconds=self.settings.access_token_ttl_seconds)).timestamp()),
            "iat": int(now.timestamp()),
            "scope": scope,
            "tenant_id": str(user.tenant_id),
            "email": user.email,
            "name": user.name or user.email,
            "groups": groups,
            "attributes": attributes,
            "jti": jti_access,
            "sid": str(session_id),
            "token_use": "access",
            "is_admin": user.is_admin,
        }

        id_token = keystore.sign_jwt(signing_key, id_claims)
        access_token = keystore.sign_jwt(signing_key, access_claims)

        refresh_plain = generate_token(48)
        family = family_id or uuid.uuid4()
        refresh = RefreshToken(
            token_hash=hash_token(refresh_plain),
            user_id=user.id,
            application_id=app.id,
            session_id=session_id,
            family_id=family,
            expires_at=now + timedelta(days=self.settings.refresh_token_ttl_days),
        )
        db.add(refresh)
        await db.commit()

        return {
            "access_token": access_token,
            "id_token": id_token,
            "refresh_token": refresh_plain,
            "token_type": "Bearer",
            "expires_in": self.settings.access_token_ttl_seconds,
            "scope": scope,
        }

    async def rotate_refresh(
        self,
        db: AsyncSession,
        redis: Redis,
        *,
        refresh_token: str,
        client_id: str,
    ) -> dict[str, Any]:
        token_hash = hash_token(refresh_token)
        result = await db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        existing = result.scalar_one_or_none()
        if existing is None:
            raise ValueError("invalid_grant")

        if existing.revoked_at is not None or existing.replaced_by is not None:
            # Reuse detection: revoke entire family
            await db.execute(
                update(RefreshToken)
                .where(RefreshToken.family_id == existing.family_id)
                .values(revoked_at=datetime.now(timezone.utc))
            )
            await db.commit()
            raise ValueError("invalid_grant_reuse")

        if existing.expires_at < datetime.now(timezone.utc):
            raise ValueError("invalid_grant")

        app = await self.get_application(db, client_id)
        if app is None or app.id != existing.application_id:
            raise ValueError("invalid_client")

        user_result = await db.execute(select(User).where(User.id == existing.user_id))
        user = user_result.scalar_one()

        decision = await access_service.decide(db, user=user, application=app, action=APP_ACCESS)
        if not decision.allowed:
            raise AccessDenied(decision.message)

        existing.revoked_at = datetime.now(timezone.utc)
        await db.flush()

        tokens = await self.issue_tokens(
            db,
            redis,
            user=user,
            app=app,
            session_id=existing.session_id,
            scope="openid profile email groups",
            nonce=None,
            family_id=existing.family_id,
        )
        # Link old token to the newly issued refresh family member
        new_hash = hash_token(tokens["refresh_token"])
        new_result = await db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == new_hash)
        )
        new_row = new_result.scalar_one()
        existing.replaced_by = new_row.id
        await db.commit()
        return tokens

    async def _user_groups(self, db: AsyncSession, user_id: uuid.UUID) -> list[str]:
        from app.models.entities import Group, GroupMembership

        result = await db.execute(
            select(Group.name)
            .join(GroupMembership, GroupMembership.group_id == Group.id)
            .where(GroupMembership.user_id == user_id)
        )
        return list(result.scalars().all())

    async def decode_access_token(self, db: AsyncSession, token: str) -> dict[str, Any]:
        unverified = jwt_get_unverified_header(token)
        kid = unverified.get("kid")
        if not kid:
            raise ValueError("invalid_token")
        key = await keystore.get_key_by_kid(db, kid)
        if key is None:
            raise ValueError("invalid_token")
        claims = keystore.verify_jwt(token, key)
        jti = claims.get("jti")
        if jti:
            # checked by caller with redis for revocation
            pass
        return claims

    async def is_token_revoked(self, redis: Redis, jti: str) -> bool:
        return bool(await redis.exists(self._revoked_token_key(jti)))

    async def revoke_jti(self, redis: Redis, jti: str, ttl: int = 900) -> None:
        await redis.set(self._revoked_token_key(jti), "1", ex=ttl)

    def verify_code_challenge(self, verifier: str, challenge: str, method: str) -> bool:
        return verify_pkce(verifier, challenge, method)


def jwt_get_unverified_header(token: str) -> dict:
    import jwt as pyjwt

    return pyjwt.get_unverified_header(token)


oidc_service = OidcService()
