"""Seed demo tenant, admin user, OIDC + SAML apps, SCIM token.

Credentials come from environment (never hardcode production secrets):

  SEED_ADMIN_EMAIL       default: aksaxena1991@gmail.com
  SEED_ADMIN_PASSWORD    default: @Admin2026
  SEED_ADMIN_NAME        default: Anubhav Saxena
  SEED_SCIM_TOKEN        default: scim-demo-token-change-me
  SEED_PRINT_SECRETS     set to 1/true to print password + SCIM token
"""

from __future__ import annotations

import asyncio
import os
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
from app.services.role_service import PLATFORM_SUPER_ADMIN_PERMISSION, PLATFORM_SUPER_ADMIN_ROLE, PLATFORM_ADMIN_ROLE

ADMIN_EMAIL = os.environ.get("SEED_ADMIN_EMAIL", "aksaxena1991@gmail.com").strip().lower()
ADMIN_PASSWORD = os.environ.get("SEED_ADMIN_PASSWORD", "@Admin2026")
ADMIN_NAME = os.environ.get("SEED_ADMIN_NAME", "Anubhav Saxena")
SCIM_PLAIN = os.environ.get("SEED_SCIM_TOKEN", "scim-demo-token-change-me")
PRINT_SECRETS = os.environ.get("SEED_PRINT_SECRETS", "").strip().lower() in {"1", "true", "yes"}


async def seed() -> None:
    async with SessionLocal() as db:
        result = await db.execute(select(Tenant).where(Tenant.slug == "demo"))
        tenant = result.scalar_one_or_none()
        if tenant is None:
            tenant = Tenant(name="sarwa amrit tenant", slug="sarwa-amrit-tenant")
            db.add(tenant)
            await db.flush()

        user_result = await db.execute(
            select(User).where(User.tenant_id == tenant.id).where(User.external_id == "")
        )
        user = user_result.scalar_one_or_none()
        if user is None:
            user_result = await db.execute(
                select(User).where(User.tenant_id == tenant.id).where(User.email == ADMIN_EMAIL)
            )
            user = user_result.scalar_one_or_none()
        if user is None:
            user = User(
                tenant_id=tenant.id,
                email=ADMIN_EMAIL,
                name=ADMIN_NAME,
                password_hash=hash_password(ADMIN_PASSWORD),
                status=UserStatus.active,
                is_admin=True,
                external_id="",
            )
            db.add(user)
            await db.flush()
        else:
            # Keep Anubhav Saxena aligned with env when re-seeding
            user.email = ADMIN_EMAIL
            user.name = ADMIN_NAME
            user.password_hash = hash_password(ADMIN_PASSWORD)
            user.is_admin = True
            user.external_id = ""
            user.status = UserStatus.active

        group_result = await db.execute(
            select(Group).where(Group.tenant_id == tenant.id).where(Group.name == "Platform-Admins")
        )
        group = group_result.scalar_one_or_none()
        if group is None:
            group = Group(tenant_id=tenant.id, name="Platform-Admins", source=GroupSource.manual)
            db.add(group)
            await db.flush()
            db.add(GroupMembership(group_id=group.id, user_id=user.id))

        await _ensure_oidc_app(
            db,
            tenant_id=tenant.id,
            name="IDM OIDC App",
            client_id="idm-oidc-app",
            redirect_uris=["http://localhost:3000/callback", "http://127.0.0.1:3000/callback"],
        )
        await _ensure_oidc_app(
            db,
            tenant_id=tenant.id,
            name="IMS OIDC App",
            client_id="ims-oidc-app",
            redirect_uris=["http://localhost:3001/callback", "http://127.0.0.1:3001/callback"],
        )

        saml_result = await db.execute(
            select(Application)
            .where(Application.tenant_id == tenant.id)
            .where(Application.client_id == "idm-saml-app")
        )
        if saml_result.scalar_one_or_none() is None:
            db.add(
                Application(
                    tenant_id=tenant.id,
                    name="IDM SAML App",
                    client_id="idm-saml-app",
                    protocol=AppProtocol.saml,
                    status=AppStatus.active,
                    config={
                        "acs_url": "http://localhost:3000/saml/acs",
                        "entity_id": "http://localhost:3000/saml/metadata",
                        "audience": "http://localhost:3000/saml/metadata",
                    },
                )
            )

        scim_result = await db.execute(
            select(ScimToken).where(ScimToken.tenant_id == tenant.id).where(ScimToken.revoked_at.is_(None))
        )
        scim_row = scim_result.scalar_one_or_none()
        if scim_row is None:
            db.add(
                ScimToken(
                    tenant_id=tenant.id,
                    token_hash=hash_token(SCIM_PLAIN),
                    label="demo",
                )
            )
        else:
            scim_row.token_hash = hash_token(SCIM_PLAIN)

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
        
        
        

        super_admin_role = await _ensure_role(
            db,
            tenant_id=tenant.id,
            name=PLATFORM_SUPER_ADMIN_ROLE,
            description="Full platform access for super admins",
            permissions=[
                PLATFORM_SUPER_ADMIN_PERMISSION,
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
            name=PLATFORM_ADMIN_ROLE,
            description="Platform-level access for admins",
            permissions=["portal:access"],
            is_system=True,
        )
        

        await _ensure_user_role(db, user.id, super_admin_role.id)
        await _ensure_user_role(db, user.id, user_role.id)

        # Entitlements: assign admin user + Admins group to demo apps
        for application in apps:
            await _ensure_assignment(db, application.id, PrincipalType.user, user.id)
            await _ensure_assignment(db, application.id, PrincipalType.group, group.id)

        await db.commit()
        await keystore.ensure_active_es256_key(db)
        await keystore.ensure_active_rs256_key(db)
        print("Seed complete.")
        print(f"Admin email: {ADMIN_EMAIL}")
        if PRINT_SECRETS:
            print(f"Admin password: {ADMIN_PASSWORD}")
            print(f"SCIM bearer token: {SCIM_PLAIN}")
        else:
            print("Admin password / SCIM token: set via SEED_* env (use SEED_PRINT_SECRETS=1 to print)")
        print("OIDC client_id: idm-oidc-app")
        print("OIDC client_id: ims-oidc-app")
        print("SAML client_id: idm-saml-app")
        print(f"RBAC roles: {PLATFORM_SUPER_ADMIN_ROLE}, {PLATFORM_ADMIN_ROLE}")


async def _ensure_oidc_app(
    db,
    *,
    tenant_id,
    name: str,
    client_id: str,
    redirect_uris: list[str],
) -> Application:
    stmt = (
        select(Application)
        .where(Application.tenant_id == tenant_id)
        .where(Application.client_id == client_id)
    )
    application = (await db.execute(stmt)).scalar_one_or_none()
    if application is None:
        application = Application(
            tenant_id=tenant_id,
            name=name,
            client_id=client_id,
            protocol=AppProtocol.oidc,
            status=AppStatus.active,
            config={"redirect_uris": list(redirect_uris)},
        )
        db.add(application)
        await db.flush()
        return application

    application.name = name
    application.protocol = AppProtocol.oidc
    application.status = AppStatus.active
    config = dict(application.config or {})
    existing = [str(uri) for uri in (config.get("redirect_uris") or [])]
    merged = list(dict.fromkeys([*existing, *redirect_uris]))
    config["redirect_uris"] = merged
    application.config = config
    await db.flush()
    return application


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
