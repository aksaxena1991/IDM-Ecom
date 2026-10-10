from __future__ import annotations

import pytest

from app.models.entities import AppAssignment, PrincipalType, User, UserStatus
from app.services.access_service import APP_ACCESS, access_service
from app.core.security import hash_password


@pytest.mark.asyncio
async def test_empty_assignments_skip_entitlement_check(db_session, seeded):
    decision = await access_service.decide(
        db_session,
        user=seeded["user"],
        application=seeded["app"],
        action=APP_ACCESS,
    )
    # No assignments on seeded test app → open for entitlement; may still pass PBAC (no policies)
    assert decision.reason != "not_assigned"


@pytest.mark.asyncio
async def test_assignments_deny_unlisted_user(db_session, seeded):
    user = seeded["user"]
    app = seeded["app"]
    other = User(
        tenant_id=user.tenant_id,
        email="other@example.com",
        name="Other",
        password_hash=hash_password("Password1!"),
        status=UserStatus.active,
        is_admin=False,
    )
    db_session.add(other)
    await db_session.flush()
    db_session.add(
        AppAssignment(
            application_id=app.id,
            principal_type=PrincipalType.user,
            principal_id=user.id,
        )
    )
    await db_session.commit()

    allowed = await access_service.decide(db_session, user=user, application=app, action=APP_ACCESS)
    assert allowed.allowed is True or allowed.reason != "not_assigned"

    denied = await access_service.decide(db_session, user=other, application=app, action=APP_ACCESS)
    assert denied.allowed is False
    assert denied.reason == "not_assigned"
