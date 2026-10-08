from __future__ import annotations

import base64
import hashlib
import secrets
from urllib.parse import parse_qs, urlparse

import pytest
from httpx import AsyncClient


def _pkce() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    return verifier, challenge


async def _access_token(client: AsyncClient) -> str:
    verifier, challenge = _pkce()
    await client.post(
        "/login/json",
        json={"email": "aksaxena1991@gmail.com", "password": "@Admin2026"},
    )
    r = await client.get(
        "/oauth2/authorize",
        params={
            "client_id": "test-oidc",
            "redirect_uri": "http://localhost:3000/callback",
            "response_type": "code",
            "scope": "openid admin",
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        },
        follow_redirects=False,
    )
    code = parse_qs(urlparse(r.headers["location"]).query)["code"][0]
    token = await client.post(
        "/oauth2/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": "http://localhost:3000/callback",
            "client_id": "test-oidc",
            "code_verifier": verifier,
        },
    )
    return token.json()["access_token"]


@pytest.mark.asyncio
async def test_admin_apps_and_wildcard_reject(client: AsyncClient):
    token = await _access_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    bad = await client.post(
        "/v1/apps",
        headers=headers,
        json={
            "name": "Bad",
            "protocol": "oidc",
            "redirect_uris": ["https://example.com/*"],
        },
    )
    assert bad.status_code == 400

    ok = await client.post(
        "/v1/apps",
        headers=headers,
        json={
            "name": "Good",
            "protocol": "oidc",
            "redirect_uris": ["https://example.com/callback"],
        },
    )
    assert ok.status_code == 201

    users = await client.get("/v1/users", headers=headers, params={"page_size": 10})
    assert users.status_code == 200
    assert users.json()["items"]

    audit = await client.get("/v1/audit-events", headers=headers)
    assert audit.status_code == 200


@pytest.mark.asyncio
async def test_scim_user_lifecycle(client: AsyncClient):
    headers = {"Authorization": "Bearer scim-test-token"}
    create = await client.post(
        "/scim/v2/Users",
        headers=headers,
        json={
            "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
            "userName": "alice@example.com",
            "externalId": "ext-alice",
            "active": True,
        },
    )
    assert create.status_code == 201
    user_id = create.json()["id"]

    # idempotent
    again = await client.post(
        "/scim/v2/Users",
        headers=headers,
        json={
            "userName": "alice@example.com",
            "externalId": "ext-alice",
            "active": True,
        },
    )
    assert again.status_code == 201
    assert again.json()["id"] == user_id

    patch = await client.patch(
        f"/scim/v2/Users/{user_id}",
        headers=headers,
        json={
            "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
            "Operations": [{"op": "replace", "path": "active", "value": False}],
        },
    )
    assert patch.status_code == 200
    assert patch.json()["active"] is False

    bulk = await client.post("/scim/v2/Bulk", headers=headers, json={})
    assert bulk.status_code == 501


@pytest.mark.asyncio
async def test_pkce_unit():
    from app.core.security import pkce_challenge_s256, verify_pkce

    v = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
    assert verify_pkce(v, pkce_challenge_s256(v), "S256")
