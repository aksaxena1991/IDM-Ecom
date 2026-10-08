"""Seed demo tenant, admin user, OIDC + SAML apps, SCIM token."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.db import SessionLocal
from app.core.keystore import keystore
from app.core.security import hash_password, hash_token
from app.models.entities import (
    AccessPolicy,
    Application,
    AppProtocol,
    AppStatus,
    Group,
    GroupMembership,
    GroupSource,
    PolicyEffect,
    ResourceAttribute,
    ScimToken,
    Tenant,
    User,
    UserAttribute,
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
            select(User).where(User.tenant_id == tenant.id).where(User.email == "aksaxena1991@gmail.com")
        )
        user = user_result.scalar_one_or_none()
        if user is None:
            user = User(
                tenant_id=tenant.id,
                email="aksaxena1991@gmail.com",
                name="Anubhav Saxena",
                password_hash=hash_password("@Admin2026"),
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

        await db.flush()
        await _ensure_attributes(
            db,
            UserAttribute,
            "user_id",
            user.id,
            {"department": "engineering", "clearance": 5, "title": "platform-admin"},
        )

        apps = list(
            (
                await db.execute(select(Application).where(Application.tenant_id == tenant.id))
            ).scalars().all()
        )
        for application in apps:
            await _ensure_attributes(
                db,
                ResourceAttribute,
                "application_id",
                application.id,
                {"sensitivity": "internal", "owner_department": "engineering"},
            )

        # Baseline: any active user may access apps unless a higher-priority deny matches.
        # Without this, enable policies for app:access cause default-deny for normal signups.
        await _ensure_policy(
            db,
            tenant_id=tenant.id,
            name="allow-active-users",
            description="Allow app:access for any active user (baseline). Deny policies still override.",
            effect=PolicyEffect.allow,
            priority=1,
            actions=["app:access"],
            conditions={
                "all": [
                    {"attr": "subject.status", "op": "eq", "value": "active"},
                ]
            },
        )
        await _ensure_policy(
            db,
            tenant_id=tenant.id,
            name="deny-restricted-without-clearance",
            description="Deny app access when the application is restricted and clearance is below 3.",
            effect=PolicyEffect.deny,
            priority=100,
            actions=["app:access"],
            conditions={
                "all": [
                    {"attr": "resource.sensitivity", "op": "eq", "value": "restricted"},
                    {"attr": "subject.clearance", "op": "lt", "value": 3},
                ]
            },
        )
        await _ensure_policy(
            db,
            tenant_id=tenant.id,
            name="allow-admin-or-owning-department",
            description="Allow app access for admins, or when the user department owns the application.",
            effect=PolicyEffect.allow,
            priority=10,
            actions=["app:access"],
            conditions={
                "any": [
                    {"attr": "subject.is_admin", "op": "eq", "value": True},
                    {
                        "all": [
                            {
                                "attr": "subject.department",
                                "op": "eq",
                                "value_from": "resource.owner_department",
                            }
                        ]
                    },
                ]
            },
        )

        await db.commit()
        await keystore.ensure_active_es256_key(db)
        await keystore.ensure_active_rs256_key(db)
        print("Seed complete.")
        print("Admin: aksaxena1991@gmail.com / @Admin2026")
        print("OIDC client_id: demo-oidc-app")
        print("SAML client_id: demo-saml-app")


async def _ensure_attributes(db, model, owner_field: str, owner_id, attributes: dict) -> None:
    for key, value in attributes.items():
        stmt = select(model).where(getattr(model, owner_field) == owner_id).where(model.attr_key == key)
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing is None:
            db.add(model(**{owner_field: owner_id, "attr_key": key, "attr_value": value}))


async def _ensure_policy(db, **fields) -> None:
    stmt = (
        select(AccessPolicy)
        .where(AccessPolicy.tenant_id == fields["tenant_id"])
        .where(AccessPolicy.name == fields["name"])
    )
    if (await db.execute(stmt)).scalar_one_or_none() is None:
        db.add(
            AccessPolicy(
                resource_match={},
                enabled=True,
                **fields,
            )
        )


if __name__ == "__main__":
    asyncio.run(seed())
