from __future__ import annotations

import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Ensure test env before app import
os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://sso:sso_dev_password@localhost:5433/sso_test"
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/1")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("COOKIE_SECURE", "false")
os.environ.setdefault("SIGNING_KEYS_DIR", "./keys-test")
os.environ.setdefault("BASE_URL", "http://testserver")

from app.core.config import get_settings
from app.core.db import Base, get_db
from app.core.redis import close_redis, get_redis
from app.core.security import hash_password, hash_token
from app.main import create_app
from app.models.entities import (
    AccessPolicy,
    Application,
    AppProtocol,
    AppStatus,
    PolicyEffect,
    ScimToken,
    Tenant,
    User,
    UserStatus,
)

get_settings.cache_clear()


@pytest_asyncio.fixture
async def db_engine():
    settings = get_settings()
    engine = create_async_engine(settings.database_url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(db_engine, expire_on_commit=False, class_=AsyncSession)
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def seeded(db_session: AsyncSession):
    tenant = Tenant(name="Test", slug="test")
    db_session.add(tenant)
    await db_session.flush()
    user = User(
        tenant_id=tenant.id,
        email="aksaxena1991@gmail.com",
        name="Admin",
        password_hash=hash_password("@Admin2026"),
        status=UserStatus.active,
        is_admin=True,
    )
    db_session.add(user)
    app = Application(
        tenant_id=tenant.id,
        name="Test OIDC",
        client_id="test-oidc",
        protocol=AppProtocol.oidc,
        status=AppStatus.active,
        config={"redirect_uris": ["http://localhost:3000/callback"]},
    )
    db_session.add(app)
    db_session.add(
        ScimToken(tenant_id=tenant.id, token_hash=hash_token("scim-test-token"), label="test")
    )
    db_session.add(
        AccessPolicy(
            tenant_id=tenant.id,
            name="allow-active-users",
            description="Baseline allow for tests",
            effect=PolicyEffect.allow,
            priority=1,
            enabled=True,
            actions=["app:access"],
            resource_match={},
            conditions={"all": [{"attr": "subject.status", "op": "eq", "value": "active"}]},
        )
    )
    await db_session.commit()
    return {"tenant": tenant, "user": user, "app": app}


@pytest_asyncio.fixture
async def client(db_engine, seeded) -> AsyncGenerator[AsyncClient, None]:
    session_factory = async_sessionmaker(db_engine, expire_on_commit=False, class_=AsyncSession)
    app = create_app()

    async def override_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    redis = await get_redis()
    await redis.flushdb()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

    app.dependency_overrides.clear()
    await close_redis()
