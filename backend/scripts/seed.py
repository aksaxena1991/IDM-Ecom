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
    AppAssignment,
    Application,
    AppProtocol,
    AppStatus,
    Group,
    GroupMembership,
    GroupSource,
    PolicyEffect,
    PrincipalType,
    ResourceAttribute,
    Role,
    RolePermission,
    ScimToken,
    Tenant,
    User,
    UserAttribute,
    UserRole,
    UserStatus,
)
from app.services.role_service import ADMIN_PERMISSION, DEFAULT_USER_ROLE, SYSTEM_ADMIN_ROLE


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
            description="Allow app access for admins (flag/role/permission), or matching department.",
            effect=PolicyEffect.allow,
            priority=10,
            actions=["app:access"],
            conditions={
                "any": [
                    {"attr": "subject.is_admin", "op": "eq", "value": True},
                    {"attr": "subject.roles", "op": "contains", "value": SYSTEM_ADMIN_ROLE},
                    {"attr": "subject.permissions", "op": "contains", "value": ADMIN_PERMISSION},
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
        await _ensure_policy(
            db,
            tenant_id=tenant.id,
            name="allow-app-operator-role",
            description="Allow app:access when the user holds the app_operator RBAC role.",
            effect=PolicyEffect.allow,
            priority=15,
            actions=["app:access"],
            conditions={
                "all": [
                    {"attr": "subject.roles", "op": "contains", "value": "app_operator"},
                ]
            },
        )

        admin_role = await _ensure_role(
            db,
            tenant_id=tenant.id,
            name=SYSTEM_ADMIN_ROLE,
            description="Tenant administrator with full console access",
            permissions=[
                ADMIN_PERMISSION,
                "apps:read",
                "apps:write",
                "users:write",
                "policies:write",
                "roles:write",
                "audit:read",
                "groups:read",
                "groups:write",
            ],
            is_system=True,
        )
        user_role = await _ensure_role(
            db,
            tenant_id=tenant.id,
            name=DEFAULT_USER_ROLE,
            description="Default role for signed-up users",
            permissions=["portal:access"],
            is_system=True,
        )
        await _ensure_role(
            db,
            tenant_id=tenant.id,
            name="app_operator",
            description="Can access applications; useful for PBAC role checks",
            permissions=["apps:read"],
            is_system=False,
        )

        await _ensure_user_role(db, user.id, admin_role.id)
        await _ensure_user_role(db, user.id, user_role.id)

        # Entitlements: assign admin user + Admins group to demo apps
        for application in apps:
            await _ensure_assignment(db, application.id, PrincipalType.user, user.id)
            await _ensure_assignment(db, application.id, PrincipalType.group, group.id)

        await db.commit()
        await keystore.ensure_active_es256_key(db)
        await keystore.ensure_active_rs256_key(db)
        print("Seed complete.")
        print("Admin: aksaxena1991@gmail.com / @Admin2026")
        print("OIDC client_id: demo-oidc-app")
        print("SAML client_id: demo-saml-app")
        print(f"RBAC roles: {SYSTEM_ADMIN_ROLE}, {DEFAULT_USER_ROLE}, app_operator")


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


async def _ensure_role(db, *, tenant_id, name: str, description: str, permissions: list[str], is_system: bool):
    stmt = select(Role).where(Role.tenant_id == tenant_id).where(Role.name == name)
    role = (await db.execute(stmt)).scalar_one_or_none()
    if role is None:
        role = Role(
            tenant_id=tenant_id,
            name=name,
            description=description,
            is_system=is_system,
        )
        db.add(role)
        await db.flush()
    for perm in permissions:
        existing = (
            await db.execute(
                select(RolePermission)
                .where(RolePermission.role_id == role.id)
                .where(RolePermission.permission == perm)
            )
        ).scalar_one_or_none()
        if existing is None:
            db.add(RolePermission(role_id=role.id, permission=perm))
    await db.flush()
    return role


async def _ensure_user_role(db, user_id, role_id) -> None:
    existing = (
        await db.execute(
            select(UserRole).where(UserRole.user_id == user_id).where(UserRole.role_id == role_id)
        )
    ).scalar_one_or_none()
    if existing is None:
        db.add(UserRole(user_id=user_id, role_id=role_id))


async def _ensure_assignment(db, application_id, principal_type: PrincipalType, principal_id) -> None:
    existing = (
        await db.execute(
            select(AppAssignment)
            .where(AppAssignment.application_id == application_id)
            .where(AppAssignment.principal_type == principal_type)
            .where(AppAssignment.principal_id == principal_id)
        )
    ).scalar_one_or_none()
    if existing is None:
        db.add(
            AppAssignment(
                application_id=application_id,
                principal_type=principal_type,
                principal_id=principal_id,
            )
        )


if __name__ == "__main__":
    asyncio.run(seed())
