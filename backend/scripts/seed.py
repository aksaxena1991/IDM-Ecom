"""Seed demo tenant, admin user, OIDC + SAML apps, SCIM token."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.db import SessionLocal
from app.core.keystore import keystore
from app.core.security import generate_token, hash_password, hash_token
from app.models.entities import (
    Application,
    AppProtocol,
    AppStatus,
    Group,
    GroupMembership,
    GroupSource,
    ScimToken,
    Tenant,
    User,
    UserStatus,
)


async def seed() -> None:
    async with SessionLocal() as db:
        result = await db.execute(select(Tenant).where(Tenant.slug == "demo"))
        tenant = result.scalar_one_or_none()
        if tenant is None:
            tenant = Tenant(name="Demo Tenant", slug="demo")
            db.add(tenant)
            await db.flush()

        user_result = await db.execute(
            select(User).where(User.tenant_id == tenant.id).where(User.email == "admin@example.com")
        )
        user = user_result.scalar_one_or_none()
        if user is None:
            user = User(
                tenant_id=tenant.id,
                email="admin@example.com",
                name="Demo Admin",
                password_hash=hash_password("Admin123!"),
                status=UserStatus.active,
                is_admin=True,
                external_id="demo-admin",
            )
            db.add(user)
            await db.flush()

        group_result = await db.execute(
            select(Group).where(Group.tenant_id == tenant.id).where(Group.name == "Admins")
        )
        group = group_result.scalar_one_or_none()
        if group is None:
            group = Group(tenant_id=tenant.id, name="Admins", source=GroupSource.manual)
            db.add(group)
            await db.flush()
            db.add(GroupMembership(group_id=group.id, user_id=user.id))

        oidc_result = await db.execute(
            select(Application)
            .where(Application.tenant_id == tenant.id)
            .where(Application.client_id == "demo-oidc-app")
        )
        if oidc_result.scalar_one_or_none() is None:
            db.add(
                Application(
                    tenant_id=tenant.id,
                    name="Demo OIDC App",
                    client_id="demo-oidc-app",
                    protocol=AppProtocol.oidc,
                    status=AppStatus.active,
                    config={"redirect_uris": ["http://localhost:3000/callback", "http://127.0.0.1:3000/callback"]},
                )
            )

        saml_result = await db.execute(
            select(Application)
            .where(Application.tenant_id == tenant.id)
            .where(Application.client_id == "demo-saml-app")
        )
        if saml_result.scalar_one_or_none() is None:
            db.add(
                Application(
                    tenant_id=tenant.id,
                    name="Demo SAML App",
                    client_id="demo-saml-app",
                    protocol=AppProtocol.saml,
                    status=AppStatus.active,
                    config={
                        "acs_url": "http://localhost:3000/saml/acs",
                        "entity_id": "http://localhost:3000/saml/metadata",
                        "audience": "http://localhost:3000/saml/metadata",
                    },
                )
            )

        scim_result = await db.execute(select(ScimToken).where(ScimToken.tenant_id == tenant.id))
        if scim_result.scalar_one_or_none() is None:
            plain = "scim-demo-token-change-me"
            db.add(
                ScimToken(
                    tenant_id=tenant.id,
                    token_hash=hash_token(plain),
                    label="demo",
                )
            )
            print(f"SCIM bearer token: {plain}")

        await db.commit()
        await keystore.ensure_active_es256_key(db)
        await keystore.ensure_active_rs256_key(db)
        print("Seed complete.")
        print("Admin: admin@example.com / Admin123!")
        print("OIDC client_id: demo-oidc-app")
        print("SAML client_id: demo-saml-app")


if __name__ == "__main__":
    asyncio.run(seed())
