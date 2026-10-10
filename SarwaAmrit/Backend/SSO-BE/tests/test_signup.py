from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup_json_and_login(client: AsyncClient):
    r = await client.post(
        "/signup/json",
        json={
            "email": "newuser@example.com",
            "password": "SecurePass1!",
            "name": "New User",
            "tenant_slug": "test",
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "newuser@example.com"
    assert body["session_id"]
    assert client.cookies.get("sso_session")

    me = await client.get("/session/me")
    assert me.status_code == 200
    assert me.json()["user_id"] == body["user_id"]

    await client.post("/session/logout")

    login = await client.post(
        "/login/json",
        json={"email": "newuser@example.com", "password": "SecurePass1!", "tenant_slug": "test"},
    )
    assert login.status_code == 200


@pytest.mark.asyncio
async def test_signup_rejects_duplicate_and_short_password(client: AsyncClient):
    short = await client.post(
        "/signup/json",
        json={"email": "short@example.com", "password": "short", "tenant_slug": "test"},
    )
    assert short.status_code == 400

    first = await client.post(
        "/signup/json",
        json={"email": "dup@example.com", "password": "SecurePass1!", "tenant_slug": "test"},
    )
    assert first.status_code == 201

    dup = await client.post(
        "/signup/json",
        json={"email": "dup@example.com", "password": "SecurePass1!", "tenant_slug": "test"},
    )
    assert dup.status_code == 409


@pytest.mark.asyncio
async def test_signup_page_redirects_to_login(client: AsyncClient):
    r = await client.get("/signup", follow_redirects=False)
    assert r.status_code == 302
    assert r.headers["location"].startswith("/login")
