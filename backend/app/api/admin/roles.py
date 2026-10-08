"""Admin API for RBAC roles and user role assignments."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.api.admin.routes import AdminDep
from app.api.deps import DbDep, RedisDep
from app.core.errors import ProblemDetail
from app.models.entities import User
from app.services.audit_service import audit_service
from app.services.role_service import RoleValidationError, role_service

router = APIRouter(prefix="/v1", tags=["roles"])


class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    description: str | None = None
    permissions: list[str] = Field(default_factory=list)


class RolePatch(BaseModel):
    description: str | None = None
    permissions: list[str] | None = None


class UserRolesBody(BaseModel):
    role_ids: list[uuid.UUID] = Field(default_factory=list)


def _reject(exc: RoleValidationError) -> None:
    raise ProblemDetail(status=400, title="Validation Error", detail=str(exc)) from exc


async def _user_in_tenant(db: DbDep, admin_tenant: uuid.UUID, user_id: uuid.UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id).where(User.tenant_id == admin_tenant))
    user = result.scalar_one_or_none()
    if user is None:
        raise ProblemDetail(status=404, title="Not Found", detail="User not found")
    return user


@router.get("/roles")
async def list_roles(db: DbDep, admin: AdminDep) -> dict[str, Any]:
    roles = await role_service.list_roles(db, admin.tenant_id)
    return {"items": [role_service.role_out(r) for r in roles]}


@router.post("/roles", status_code=201)
async def create_role(body: RoleCreate, db: DbDep, redis: RedisDep, admin: AdminDep) -> dict[str, Any]:
    try:
        role = await role_service.create_role(
            db,
            tenant_id=admin.tenant_id,
            name=body.name,
            description=body.description,
            permissions=body.permissions,
        )
    except RoleValidationError as exc:
        _reject(exc)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="role.create",
        target=str(role.id),
        payload={"name": role.name, "permissions": [p.permission for p in role.permissions]},
    )
    await db.commit()
    return role_service.role_out(role)


@router.get("/roles/{role_id}")
async def get_role(role_id: uuid.UUID, db: DbDep, admin: AdminDep) -> dict[str, Any]:
    role = await role_service.get_role(db, admin.tenant_id, role_id)
    if role is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Role not found")
    return role_service.role_out(role)


@router.patch("/roles/{role_id}")
async def patch_role(
    role_id: uuid.UUID, body: RolePatch, db: DbDep, redis: RedisDep, admin: AdminDep
) -> dict[str, Any]:
    role = await role_service.get_role(db, admin.tenant_id, role_id)
    if role is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Role not found")
    try:
        role = await role_service.update_role(
            db, role, description=body.description, permissions=body.permissions
        )
    except RoleValidationError as exc:
        _reject(exc)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="role.update",
        target=str(role.id),
        payload={"permissions": body.permissions, "description": body.description},
    )
    await db.commit()
    return role_service.role_out(role)


@router.delete("/roles/{role_id}")
async def delete_role(role_id: uuid.UUID, db: DbDep, redis: RedisDep, admin: AdminDep) -> dict[str, bool]:
    role = await role_service.get_role(db, admin.tenant_id, role_id)
    if role is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Role not found")
    try:
        await role_service.delete_role(db, role)
    except RoleValidationError as exc:
        _reject(exc)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="role.delete",
        target=str(role_id),
    )
    await db.commit()
    return {"ok": True}


@router.get("/users/{user_id}/roles")
async def get_user_roles(user_id: uuid.UUID, db: DbDep, admin: AdminDep) -> dict[str, Any]:
    await _user_in_tenant(db, admin.tenant_id, user_id)
    roles = await role_service.list_user_roles(db, user_id)
    return {
        "user_id": str(user_id),
        "roles": [role_service.role_out(r) for r in roles],
        "role_ids": [str(r.id) for r in roles],
        "permissions": await role_service.user_permissions(db, user_id),
    }


@router.put("/users/{user_id}/roles")
async def put_user_roles(
    user_id: uuid.UUID, body: UserRolesBody, db: DbDep, redis: RedisDep, admin: AdminDep
) -> dict[str, Any]:
    await _user_in_tenant(db, admin.tenant_id, user_id)
    try:
        roles = await role_service.replace_user_roles(
            db, user_id=user_id, tenant_id=admin.tenant_id, role_ids=body.role_ids
        )
    except RoleValidationError as exc:
        _reject(exc)
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="user.roles.set",
        target=str(user_id),
        payload={"role_ids": [str(r) for r in body.role_ids]},
    )
    await db.commit()
    return {
        "user_id": str(user_id),
        "roles": [role_service.role_out(r) for r in roles],
        "role_ids": [str(r.id) for r in roles],
        "permissions": await role_service.user_permissions(db, user_id),
    }
