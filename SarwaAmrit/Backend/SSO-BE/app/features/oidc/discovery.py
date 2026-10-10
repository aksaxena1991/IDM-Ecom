from __future__ import annotations

from fastapi import APIRouter

from app.core.deps import DbDep
from app.core.config import get_settings
from app.core.keystore import keystore

router = APIRouter(tags=["discovery"])


@router.get("/.well-known/openid-configuration")
async def openid_configuration():
    settings = get_settings()
    base = settings.base_url.rstrip("/")
    return {
        "issuer": base,
        "authorization_endpoint": f"{base}/oauth2/authorize",
        "token_endpoint": f"{base}/oauth2/token",
        "userinfo_endpoint": f"{base}/oauth2/userinfo",
        "jwks_uri": f"{base}/.well-known/jwks.json",
        "response_types_supported": ["code"],
        "subject_types_supported": ["public"],
        "id_token_signing_alg_values_supported": ["ES256", "RS256"],
        "scopes_supported": ["openid", "profile", "email", "groups", "admin"],
        "token_endpoint_auth_methods_supported": ["none", "client_secret_post"],
        "code_challenge_methods_supported": ["S256"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "claims_supported": ["sub", "email", "name", "groups", "tenant_id"],
    }


@router.get("/.well-known/jwks.json")
async def jwks(db: DbDep):
    await keystore.ensure_active_es256_key(db)
    return await keystore.jwks(db)
