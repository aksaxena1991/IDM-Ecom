from __future__ import annotations

import pytest
from sqlalchemy import delete

from app.models.entities import AccessPolicy, PolicyEffect
from app.services.access_service import APP_ACCESS, access_service


@pytest.mark.asyncio
async def test_no_policies_deny_app_access(db_session, seeded):
    await db_session.execute(
        delete(AccessPolicy).where(AccessPolicy.tenant_id == seeded["tenant"].id)
    )
    await db_session.commit()
    decision = await access_service.decide(
        db_session,
        user=seeded["user"],
        application=seeded["app"],
        action=APP_ACCESS,
    )
    assert decision.allowed is False
    assert decision.reason == "no_policy_for_action"


@pytest.mark.asyncio
async def test_restricted_app_denies_low_clearance_admin(db_session, seeded):
    user = seeded["user"]
    app = seeded["app"]
    await access_service.replace_user_attributes(
        db_session, user.id, {"department": "engineering", "clearance": 1}
    )
    await access_service.replace_resource_attributes(
        db_session, app.id, {"sensitivity": "restricted", "owner_department": "engineering"}
    )
    
    await db_session.commit()

    denied = await access_service.decide(db_session, user=user, application=app, action=APP_ACCESS)
    assert denied.allowed is False
    assert denied.reason == "denied_by" in denied.matched_policies

    await access_service.replace_user_attributes(
        db_session, user.id, {"department": "engineering", "clearance": 5}
    )
    await db_session.commit()
    allowed = await access_service.decide(db_session, user=user, application=app, action=APP_ACCESS)
    assert allowed.allowed is True
    assert allowed.reason == "allowed_by"
