from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.api.admin.routes import AdminDep, AppsReadDep, AppsWriteDep, PoliciesWriteDep, UsersWriteDep
from app.api.deps import DbDep, RedisDep
from app.core.errors import ProblemDetail
from app.models.entities import AccessPolicy, Application, PolicyEffect, User
from app.services.access_service import APP_ACCESS, access_service
from app.services.audit_service import audit_service
from app.services.policy_engine import PolicyValidationError, validate_policy

router = APIRouter(prefix="/v1", tags=["access"])


class AttributeBody(BaseModel):
    attributes: dict[str, Any] = Field(default_factory=dict)


class PolicyIn(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    description: str | None = None
    effect: PolicyEffect
    priority: int = Field(default=0, ge=0, le=10000)
    enabled: bool = True
    actions: list[str] = Field(min_length=1)
    resource_match: dict[str, Any] = Field(default_factory=dict)
    conditions: dict[str, Any] = Field(default_factory=dict)


class PolicyPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=128)
    description: str | None = None
    effect: PolicyEffect | None = None
    priority: int | None = Field(default=None, ge=0, le=10000)
    enabled: bool | None = None
    actions: list[str] | None = None
    resource_match: dict[str, Any] | None = None
    conditions: dict[str, Any] | None = None


class EvaluateBody(BaseModel):
    user_id: uuid.UUID
    client_id: str
    action: str = APP_ACCESS


def _policy_out(row: AccessPolicy) -> dict[str, Any]:
    return {
        "id": str(row.id),
        "name": row.name,
        "description": row.description,
        "effect": row.effect.value,
        "priority": row.priority,
        "enabled": row.enabled,
        "actions": row.actions,
        "resource_match": row.resource_match,
        "conditions": row.conditions,
    }


def _reject_invalid(exc: PolicyValidationError) -> None:
    raise ProblemDetail(status=400, title="Validation Error", detail=str(exc)) from exc


async def _user_in_tenant(db: DbDep, admin_tenant: uuid.UUID, user_id: uuid.UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id).where(User.tenant_id == admin_tenant))
    user = result.scalar_one_or_none()
    if user is None:
        raise ProblemDetail(status=404, title="Not Found", detail="User not found")
    return user


async def _app_in_tenant(db: DbDep, admin_tenant: uuid.UUID, app_id: uuid.UUID) -> Application:
    result = await db.execute(
        select(Application).where(Application.id == app_id).where(Application.tenant_id == admin_tenant)
    )
    app = result.scalar_one_or_none()
    if app is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Application not found")
    return app


@router.get("/users/{user_id}/attributes")
async def get_user_attributes(user_id: uuid.UUID, db: DbDep, admin: UsersWriteDep):
    await _user_in_tenant(db, admin.tenant_id, user_id)
    attributes = await access_service.subject_custom_attributes(db, user_id)
    return {"user_id": str(user_id), "attributes": attributes}


@router.put("/users/{user_id}/attributes")
async def put_user_attributes(
    user_id: uuid.UUID, body: AttributeBody, db: DbDep, redis: RedisDep, admin: UsersWriteDep
):
    await _user_in_tenant(db, admin.tenant_id, user_id)
    try:
        stored = await access_service.replace_user_attributes(db, user_id, body.attributes)
    except PolicyValidationError as exc:
        _reject_invalid(exc)
    await db.commit()
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="user.attributes.set",
        target=str(user_id),
        payload={"keys": sorted(stored)},
    )
    return {"user_id": str(user_id), "attributes": stored}


@router.get("/apps/{app_id}/attributes")
async def get_app_attributes(app_id: uuid.UUID, db: DbDep, admin: AppsReadDep):
    await _app_in_tenant(db, admin.tenant_id, app_id)
    attributes = await access_service.resource_custom_attributes(db, app_id)
    return {"application_id": str(app_id), "attributes": attributes}


@router.put("/apps/{app_id}/attributes")
async def put_app_attributes(
    app_id: uuid.UUID, body: AttributeBody, db: DbDep, redis: RedisDep, admin: AppsWriteDep
):
    await _app_in_tenant(db, admin.tenant_id, app_id)
    try:
        stored = await access_service.replace_resource_attributes(db, app_id, body.attributes)
    except PolicyValidationError as exc:
        _reject_invalid(exc)
    await db.commit()
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="app.attributes.set",
        target=str(app_id),
        payload={"keys": sorted(stored)},
    )
    return {"application_id": str(app_id), "attributes": stored}


@router.get("/policies")
async def list_policies(db: DbDep, admin: PoliciesWriteDep):
    result = await db.execute(
        select(AccessPolicy)
        .where(AccessPolicy.tenant_id == admin.tenant_id)
        .order_by(AccessPolicy.priority.desc(), AccessPolicy.name)
    )
    return {"items": [_policy_out(row) for row in result.scalars().all()]}


@router.post("/policies", status_code=201)
async def create_policy(body: PolicyIn, db: DbDep, redis: RedisDep, admin: PoliciesWriteDep):
    try:
        validate_policy(actions=body.actions, resource_match=body.resource_match, conditions=body.conditions)
    except PolicyValidationError as exc:
        _reject_invalid(exc)
    existing = await db.execute(
        select(AccessPolicy)
        .where(AccessPolicy.tenant_id == admin.tenant_id)
        .where(AccessPolicy.name == body.name)
    )
    if existing.scalar_one_or_none() is not None:
        raise ProblemDetail(status=409, title="Conflict", detail="A policy with this name already exists")
    row = AccessPolicy(
        tenant_id=admin.tenant_id,
        name=body.name,
        description=body.description,
        effect=body.effect,
        priority=body.priority,
        enabled=body.enabled,
        actions=body.actions,
        resource_match=body.resource_match,
        conditions=body.conditions,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="policy.create",
        target=str(row.id),
        payload={"name": row.name, "effect": row.effect.value},
    )
    return _policy_out(row)


@router.patch("/policies/{policy_id}")
async def patch_policy(
    policy_id: uuid.UUID, body: PolicyPatch, db: DbDep, redis: RedisDep, admin: PoliciesWriteDep
):
    result = await db.execute(
        select(AccessPolicy).where(AccessPolicy.id == policy_id).where(AccessPolicy.tenant_id == admin.tenant_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Policy not found")
    data = body.model_dump(exclude_unset=True)
    if "name" in data and data["name"] != row.name:
        clash = await db.execute(
            select(AccessPolicy)
            .where(AccessPolicy.tenant_id == admin.tenant_id)
            .where(AccessPolicy.name == data["name"])
        )
        if clash.scalar_one_or_none() is not None:
            raise ProblemDetail(status=409, title="Conflict", detail="A policy with this name already exists")
        row.name = data["name"]
    if "description" in data:
        row.description = data["description"]
    if "effect" in data:
        row.effect = data["effect"]
    if "priority" in data:
        row.priority = data["priority"]
    if "enabled" in data:
        row.enabled = data["enabled"]
    if "actions" in data:
        row.actions = data["actions"]
    if "resource_match" in data:
        row.resource_match = data["resource_match"]
    if "conditions" in data:
        row.conditions = data["conditions"]
    try:
        validate_policy(actions=list(row.actions), resource_match=dict(row.resource_match), conditions=dict(row.conditions))
    except PolicyValidationError as exc:
        _reject_invalid(exc)
    await db.commit()
    await db.refresh(row)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="policy.update",
        target=str(row.id),
        payload={"name": row.name},
    )
    return _policy_out(row)


@router.delete("/policies/{policy_id}")
async def delete_policy(policy_id: uuid.UUID, db: DbDep, redis: RedisDep, admin: PoliciesWriteDep):
    result = await db.execute(
        select(AccessPolicy).where(AccessPolicy.id == policy_id).where(AccessPolicy.tenant_id == admin.tenant_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Policy not found")
    name = row.name
    await db.delete(row)
    await db.commit()
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="policy.delete",
        target=str(policy_id),
        payload={"name": name},
    )
    return {"ok": True}


@router.post("/access/evaluate")
async def evaluate_access(body: EvaluateBody, db: DbDep, admin: AdminDep):
    user = await _user_in_tenant(db, admin.tenant_id, body.user_id)
    result = await db.execute(
        select(Application)
        .where(Application.client_id == body.client_id)
        .where(Application.tenant_id == admin.tenant_id)
    )
    app = result.scalar_one_or_none()
    if app is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Application not found")
    decision = await access_service.decide(db, user=user, application=app, action=body.action)
    return {
        "allowed": decision.allowed,
        "reason": decision.reason,
        "message": decision.message,
        "matched_policies": decision.matched_policies,
        "action": body.action,
        "client_id": body.client_id,
        "user_id": str(user.id),
    }
