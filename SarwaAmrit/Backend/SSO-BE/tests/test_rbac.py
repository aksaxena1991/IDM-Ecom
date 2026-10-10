from __future__ import annotations

import pytest

from app.models.entities import AccessPolicy, PolicyEffect, UserRole
from app.services.access_service import APP_ACCESS, access_service
from app.services.role_service import PLATFORM_SUPER_ADMIN_PERMISSION, role_service


@pytest.mark.asyncio
async def test_subject_includes_roles_and_permissions(db_session, seeded):
    user = seeded["user"]
    role = await role_service.create_role(
        db_session,
        tenant_id=user.tenant_id,
        name="finance",
        description="Finance operators",
        permissions=["reports:read"],
    )
    db_session.add(UserRole(user_id=user.id, role_id=role.id))
    await db_session.commit()

    subject = await access_service._subject(db_session, user)
    assert "finance" in subject["roles"]
    assert "reports:read" in subject["permissions"]


@pytest.mark.asyncio
async def test_admin_permission_grants_admin_principal(db_session, seeded):
    user = seeded["user"]
    user.is_admin = False
    role = await role_service.create_role(
        db_session,
        tenant_id=user.tenant_id,
        name="console_admin",
        description="Admin via permission",
        permissions=[PLATFORM_SUPER_ADMIN_PERMISSION],
    )
    db_session.add(UserRole(user_id=user.id, role_id=role.id))
    await db_session.commit()

    assert await role_service.is_admin_principal(db_session, user.id, is_admin_flag=False) is True
