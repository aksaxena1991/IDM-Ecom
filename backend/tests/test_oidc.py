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


@pytest.mark.asyncio
async def test_discovery(client: AsyncClient):
    r = await client.get("/.well-known/openid-configuration")
    assert r.status_code == 200
    body = r.json()
    assert body["authorization_endpoint"].endswith("/oauth2/authorize")
    assert "S256" in body["code_challenge_methods_supported"]


@pytest.mark.asyncio
async def test_authorize_rejects_missing_pkce(client: AsyncClient):
    r = await client.get(
        "/oauth2/authorize",
        params={
            "client_id": "test-oidc",
            "redirect_uri": "http://localhost:3000/callback",
            "response_type": "code",
            "scope": "openid",
        },
    )
    assert r.status_code == 400
    assert r.headers["content-type"].startswith("application/problem+json")


@pytest.mark.asyncio
async def test_oidc_code_flow(client: AsyncClient):
    verifier, challenge = _pkce()
    login = await client.post(
        "/login/json",
        json={"email": "admin@example.com", "password": "Admin123!", "tenant_slug": "test"},
    )
    assert login.status_code == 200
    assert client.cookies.get("sso_session")

    r = await client.get(
        "/oauth2/authorize",
        params={
            "client_id": "test-oidc",
            "redirect_uri": "http://localhost:3000/callback",
            "response_type": "code",
            "scope": "openid profile email groups admin",
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "state": "xyz",
        },
        follow_redirects=False,
    )
    assert r.status_code == 302
    loc = r.headers["location"]
    qs = parse_qs(urlparse(loc).query)
    code = qs["code"][0]

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
    assert token.status_code == 200
    body = token.json()
    assert body["expires_in"] == 900
    assert "access_token" in body
    assert "id_token" in body
    assert "refresh_token" in body

    ui = await client.get(
        "/oauth2/userinfo",
        headers={"Authorization": f"Bearer {body['access_token']}"},
    )
    assert ui.status_code == 200
    assert ui.json()["email"] == "admin@example.com"

    # refresh rotation
    refresh1 = await client.post(
        "/oauth2/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": body["refresh_token"],
            "client_id": "test-oidc",
        },
    )
    assert refresh1.status_code == 200
    new_refresh = refresh1.json()["refresh_token"]

    # reuse old refresh -> invalid_grant
    reuse = await client.post(
        "/oauth2/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": body["refresh_token"],
            "client_id": "test-oidc",
        },
    )
    assert reuse.status_code == 400
    assert reuse.json()["error"] == "invalid_grant"

    # new refresh still usable? family revoked on reuse — expect fail
    after_reuse = await client.post(
        "/oauth2/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": new_refresh,
            "client_id": "test-oidc",
        },
    )
    assert after_reuse.status_code == 400


@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    login = await client.post(
        "/login/json",
        json={"email": "admin@example.com", "password": "Admin123!"},
    )
    assert login.status_code == 200
    r = await client.post("/session/logout")
    assert r.status_code == 204
    me = await client.get("/session/me")
    assert me.status_code == 401
