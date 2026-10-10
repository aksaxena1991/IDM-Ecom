"""CSRF, metrics auth, MFA step-up, and SCIM integration checks."""

from __future__ import annotations

import base64
import hashlib
import secrets
import uuid
from urllib.parse import parse_qs, urlparse

import jwt
import pytest
from httpx import AsyncClient
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import get_settings
from app.core.redis import get_redis
from app.models.entities import Session


def _pkce() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    return verifier, challenge


async def _login_and_token(client: AsyncClient) -> str:
    verifier, challenge = _pkce()
    login = await client.post(
        "/login/json",
        json={"email": "aksaxena1991@gmail.com", "password": "@Admin2026", "tenant_slug": "test"},
        headers={"Origin": "http://localhost:3000"},
    )
    assert login.status_code == 200, login.text
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
    assert r.status_code == 302, r.text
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
    assert token.status_code == 200, token.text
    return token.json()["access_token"]


@pytest.mark.asyncio
async def test_csrf_rejects_evil_origin_on_login(client: AsyncClient):
    res = await client.post(
        "/login/json",
        json={"email": "aksaxena1991@gmail.com", "password": "@Admin2026", "tenant_slug": "test"},
        headers={"Origin": "https://evil.example"},
    )
    assert res.status_code == 403
    assert res.json()["title"] == "CSRF rejected"


@pytest.mark.asyncio
async def test_metrics_requires_scrape_token(client: AsyncClient):
    denied = await client.get("/metrics")
    assert denied.status_code == 401

    wrong = await client.get("/metrics", headers={"Authorization": "Bearer wrong-token"})
    assert wrong.status_code == 401

    settings = get_settings()
    ok = await client.get(
        "/metrics",
        headers={"Authorization": f"Bearer {settings.metrics_token}"},
    )
    assert ok.status_code == 200
    assert "text/plain" in ok.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_admin_write_requires_mfa_step_up(client: AsyncClient, db_engine):
    token = await _login_and_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    claims = jwt.decode(token, options={"verify_signature": False})
    sid = claims["sid"]

    factory = async_sessionmaker(db_engine, expire_on_commit=False, class_=AsyncSession)
    async with factory() as db:
        await db.execute(
            update(Session)
            .where(Session.id == uuid.UUID(sid))
            .values(admin_step_up_at=None, mfa_verified_at=None)
        )
        await db.commit()

    redis = await get_redis()
    await redis.delete(f"sso:session:{sid}")

    denied = await client.post(
        "/v1/apps",
        headers=headers,
        json={
            "name": "Needs Step Up",
            "protocol": "oidc",
            "redirect_uris": ["https://example.com/callback"],
        },
    )
    assert denied.status_code == 401
    body = denied.json()
    assert body.get("challenge") == "mfa_step_up" or "step-up" in (body.get("detail") or "").lower()


@pytest.mark.asyncio
async def test_scim_filter_total_results_and_invite_password(client: AsyncClient):
    headers = {"Authorization": "Bearer scim-test-token"}
    create = await client.post(
        "/scim/v2/Users",
        headers=headers,
        json={
            "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
            "userName": "invitee@example.com",
            "externalId": "ext-invitee",
            "active": True,
        },
    )
    assert create.status_code == 201
    payload = create.json()
    assert payload.get("password"), "invite flow should return a one-time temp password"
    assert payload["userName"] == "invitee@example.com"

    listed = await client.get(
        "/scim/v2/Users",
        headers=headers,
        params={"filter": 'userName eq "invitee@example.com"'},
    )
    assert listed.status_code == 200
    body = listed.json()
    assert body["totalResults"] == 1
    assert len(body["Resources"]) == 1
    assert body["Resources"][0]["id"] == payload["id"]

    empty = await client.get(
        "/scim/v2/Users",
        headers=headers,
        params={"filter": 'userName eq "missing@example.com"'},
    )
    assert empty.status_code == 200
    assert empty.json()["totalResults"] == 0


@pytest.mark.asyncio
async def test_admin_scim_token_create_and_revoke(client: AsyncClient):
    token = await _login_and_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    created = await client.post(
        "/v1/scim-tokens",
        headers=headers,
        json={"label": "integration"},
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body.get("token")
    token_id = body["id"]

    listed = await client.get("/v1/scim-tokens", headers=headers)
    assert listed.status_code == 200
    assert any(item["id"] == token_id for item in listed.json()["items"])

    scim = await client.get(
        "/scim/v2/Users",
        headers={"Authorization": f"Bearer {body['token']}"},
        params={"count": 1},
    )
    assert scim.status_code == 200

    revoked = await client.post(f"/v1/scim-tokens/{token_id}/revoke", headers=headers)
    assert revoked.status_code == 200

    denied = await client.get(
        "/scim/v2/Users",
        headers={"Authorization": f"Bearer {body['token']}"},
    )
    assert denied.status_code == 401
