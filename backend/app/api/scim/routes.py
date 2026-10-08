from __future__ import annotations

import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Response
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.api.deps import DbDep, RedisDep, require_scim_token
from app.core.errors import ProblemDetail
from app.models.entities import Group, GroupMembership, GroupSource, User, UserStatus
from app.services.session_service import session_service

router = APIRouter(prefix="/scim/v2", tags=["scim"])

TenantDep = Annotated[uuid.UUID, Depends(require_scim_token)]


def scim_user(user: User) -> dict[str, Any]:
    return {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
        "id": str(user.id),
        "externalId": user.external_id,
        "userName": user.email,
        "name": {"formatted": user.name or user.email},
        "emails": [{"value": user.email, "primary": True}],
        "active": user.status == UserStatus.active,
        "meta": {"resourceType": "User"},
    }


def scim_group(group: Group, members: list[str] | None = None) -> dict[str, Any]:
    return {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
        "id": str(group.id),
        "externalId": group.external_id,
        "displayName": group.name,
        "members": [{"value": m} for m in (members or [])],
        "meta": {"resourceType": "Group"},
    }


class ScimUserIn(BaseModel):
    schemas: list[str] = Field(default_factory=lambda: ["urn:ietf:params:scim:schemas:core:2.0:User"])
    userName: str
    externalId: str | None = None
    name: dict[str, Any] | None = None
    emails: list[dict[str, Any]] | None = None
    active: bool = True


class ScimPatch(BaseModel):
    schemas: list[str] = Field(
        default_factory=lambda: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"]
    )
    Operations: list[dict[str, Any]]


class ScimGroupIn(BaseModel):
    schemas: list[str] = Field(default_factory=lambda: ["urn:ietf:params:scim:schemas:core:2.0:Group"])
    displayName: str
    externalId: str | None = None
    members: list[dict[str, Any]] | None = None


@router.get("/Users")
async def list_users(
    db: DbDep,
    tenant_id: TenantDep,
    filter: str | None = Query(None),
    startIndex: int = Query(1, ge=1),
    count: int = Query(100, ge=1, le=200),
):
    stmt = select(User).where(User.tenant_id == tenant_id)
    if filter:
        # Support userName eq "x" and externalId eq "x"
        if 'userName eq "' in filter:
            value = filter.split('userName eq "')[1].rstrip('"')
            stmt = stmt.where(User.email == value.lower())
        elif 'externalId eq "' in filter:
            value = filter.split('externalId eq "')[1].rstrip('"')
            stmt = stmt.where(User.external_id == value)
    result = await db.execute(stmt.offset(startIndex - 1).limit(count))
    users = list(result.scalars().all())
    return {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        "totalResults": len(users),
        "startIndex": startIndex,
        "itemsPerPage": count,
        "Resources": [scim_user(u) for u in users],
    }


@router.post("/Users", status_code=201)
async def create_user(body: ScimUserIn, db: DbDep, tenant_id: TenantDep):
    if body.externalId:
        existing = await db.execute(
            select(User)
            .where(User.tenant_id == tenant_id)
            .where(User.external_id == body.externalId)
        )
        found = existing.scalar_one_or_none()
        if found:
            return scim_user(found)

    email = body.userName.lower()
    name = None
    if body.name:
        name = body.name.get("formatted")
    user = User(
        tenant_id=tenant_id,
        email=email,
        name=name,
        external_id=body.externalId,
        status=UserStatus.active if body.active else UserStatus.suspended,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return scim_user(user)


@router.get("/Users/{user_id}")
async def get_user(user_id: uuid.UUID, db: DbDep, tenant_id: TenantDep):
    result = await db.execute(
        select(User).where(User.id == user_id).where(User.tenant_id == tenant_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise ProblemDetail(status=404, title="Not Found", detail="User not found")
    return scim_user(user)


@router.put("/Users/{user_id}")
async def put_user(user_id: uuid.UUID, body: ScimUserIn, db: DbDep, redis: RedisDep, tenant_id: TenantDep):
    result = await db.execute(
        select(User).where(User.id == user_id).where(User.tenant_id == tenant_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise ProblemDetail(status=404, title="Not Found", detail="User not found")
    user.email = body.userName.lower()
    user.external_id = body.externalId
    if body.name:
        user.name = body.name.get("formatted")
    was_active = user.status == UserStatus.active
    user.status = UserStatus.active if body.active else UserStatus.suspended
    await db.commit()
    if was_active and not body.active:
        await session_service.revoke_user_sessions(db, redis, user.id)
    await db.refresh(user)
    return scim_user(user)


@router.patch("/Users/{user_id}")
async def patch_user(
    user_id: uuid.UUID, body: ScimPatch, db: DbDep, redis: RedisDep, tenant_id: TenantDep
):
    result = await db.execute(
        select(User).where(User.id == user_id).where(User.tenant_id == tenant_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise ProblemDetail(status=404, title="Not Found", detail="User not found")
    was_active = user.status == UserStatus.active
    for op in body.Operations:
        path = op.get("path")
        value = op.get("value")
        if path == "active" or (isinstance(value, dict) and "active" in value):
            active = value if isinstance(value, bool) else value.get("active")
            user.status = UserStatus.active if active else UserStatus.suspended
        if path == "userName":
            user.email = str(value).lower()
        if path == "externalId":
            user.external_id = str(value) if value is not None else None
        if path == "name.formatted" or path == "name":
            if isinstance(value, dict):
                user.name = value.get("formatted")
            else:
                user.name = str(value)
    await db.commit()
    if was_active and user.status != UserStatus.active:
        await session_service.revoke_user_sessions(db, redis, user.id)
    await db.refresh(user)
    return scim_user(user)


@router.delete("/Users/{user_id}", status_code=204)
async def delete_user(user_id: uuid.UUID, db: DbDep, redis: RedisDep, tenant_id: TenantDep):
    result = await db.execute(
        select(User).where(User.id == user_id).where(User.tenant_id == tenant_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise ProblemDetail(status=404, title="Not Found", detail="User not found")
    user.status = UserStatus.deprovisioned
    await db.commit()
    await session_service.revoke_user_sessions(db, redis, user.id)
    return Response(status_code=204)


@router.get("/Groups")
async def list_groups(db: DbDep, tenant_id: TenantDep):
    result = await db.execute(select(Group).where(Group.tenant_id == tenant_id))
    groups = list(result.scalars().all())
    resources = []
    for g in groups:
        mem = await db.execute(
            select(GroupMembership.user_id).where(GroupMembership.group_id == g.id)
        )
        members = [str(m) for m in mem.scalars().all()]
        resources.append(scim_group(g, members))
    return {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        "totalResults": len(resources),
        "Resources": resources,
    }


@router.post("/Groups", status_code=201)
async def create_group(body: ScimGroupIn, db: DbDep, tenant_id: TenantDep):
    if body.externalId:
        existing = await db.execute(
            select(Group)
            .where(Group.tenant_id == tenant_id)
            .where(Group.external_id == body.externalId)
        )
        found = existing.scalar_one_or_none()
        if found:
            return scim_group(found)

    group = Group(
        tenant_id=tenant_id,
        name=body.displayName,
        external_id=body.externalId,
        source=GroupSource.directory,
    )
    db.add(group)
    await db.flush()
    for m in body.members or []:
        db.add(GroupMembership(group_id=group.id, user_id=uuid.UUID(m["value"])))
    await db.commit()
    await db.refresh(group)
    return scim_group(group, [m["value"] for m in (body.members or [])])


@router.get("/Groups/{group_id}")
async def get_group(group_id: uuid.UUID, db: DbDep, tenant_id: TenantDep):
    result = await db.execute(
        select(Group).where(Group.id == group_id).where(Group.tenant_id == tenant_id)
    )
    group = result.scalar_one_or_none()
    if group is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Group not found")
    mem = await db.execute(
        select(GroupMembership.user_id).where(GroupMembership.group_id == group.id)
    )
    return scim_group(group, [str(m) for m in mem.scalars().all()])


@router.api_route("/Bulk", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def bulk_disabled():
    raise ProblemDetail(status=501, title="Not Implemented", detail="Bulk operations disabled in v1")
