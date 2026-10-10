"""Admin API for groups and memberships."""

from __future__ import annotations

import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import delete, select

from app.core.deps import _rate_limited
from app.core.deps import DbDep, RedisDep, require_permission
from app.core.middleware import ProblemDetail
from app.core.permissions import GROUPS_READ, GROUPS_WRITE
from app.models.entities import Group, GroupMembership, GroupSource, User
from app.features.audit.services import audit_service

router = APIRouter(prefix="/v1", tags=["groups"])

GroupsReadDep = Annotated[User, Depends(_rate_limited(require_permission(GROUPS_READ, GROUPS_WRITE)))]
GroupsWriteDep = Annotated[User, Depends(_rate_limited(require_permission(GROUPS_WRITE)))]


class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    source: GroupSource = GroupSource.manual


class GroupPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)


class MembersBody(BaseModel):
    user_ids: list[uuid.UUID] = Field(default_factory=list)


def _group_out(group: Group, member_ids: list[str] | None = None) -> dict[str, Any]:
    return {
        "id": str(group.id),
        "name": group.name,
        "source": group.source.value,
        "member_ids": member_ids or [],
    }


@router.get("/groups")
async def list_groups(db: DbDep, admin: GroupsReadDep) -> dict[str, Any]:
    result = await db.execute(
        select(Group).where(Group.tenant_id == admin.tenant_id).order_by(Group.name)
    )
    items = []
    for group in result.scalars().all():
        members = await db.execute(
            select(GroupMembership.user_id).where(GroupMembership.group_id == group.id)
        )
        items.append(_group_out(group, [str(uid) for uid in members.scalars().all()]))
    return {"items": items}


@router.post("/groups", status_code=201)
async def create_group(body: GroupCreate, db: DbDep, redis: RedisDep, admin: GroupsWriteDep) -> dict[str, Any]:
    existing = await db.execute(
        select(Group).where(Group.tenant_id == admin.tenant_id).where(Group.name == body.name)
    )
    if existing.scalar_one_or_none() is not None:
        raise ProblemDetail(status=409, title="Conflict", detail="Group name already exists")
    group = Group(tenant_id=admin.tenant_id, name=body.name, source=body.source)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    await audit_service.record(
        db, redis, tenant_id=admin.tenant_id, actor=admin.email, action="group.create", target=str(group.id)
    )
    return _group_out(group)


@router.patch("/groups/{group_id}")
async def patch_group(
    group_id: uuid.UUID, body: GroupPatch, db: DbDep, redis: RedisDep, admin: GroupsWriteDep
) -> dict[str, Any]:
    result = await db.execute(
        select(Group).where(Group.id == group_id).where(Group.tenant_id == admin.tenant_id)
    )
    group = result.scalar_one_or_none()
    if group is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Group not found")
    if body.name is not None:
        group.name = body.name
    await db.commit()
    await db.refresh(group)
    await audit_service.record(
        db, redis, tenant_id=admin.tenant_id, actor=admin.email, action="group.update", target=str(group.id)
    )
    members = await db.execute(select(GroupMembership.user_id).where(GroupMembership.group_id == group.id))
    return _group_out(group, [str(uid) for uid in members.scalars().all()])


@router.put("/groups/{group_id}/members")
async def put_members(
    group_id: uuid.UUID, body: MembersBody, db: DbDep, redis: RedisDep, admin: GroupsWriteDep
) -> dict[str, Any]:
    result = await db.execute(
        select(Group).where(Group.id == group_id).where(Group.tenant_id == admin.tenant_id)
    )
    group = result.scalar_one_or_none()
    if group is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Group not found")
    if body.user_ids:
        users = await db.execute(
            select(User.id)
            .where(User.tenant_id == admin.tenant_id)
            .where(User.id.in_(body.user_ids))
        )
        found = set(users.scalars().all())
        missing = [str(uid) for uid in body.user_ids if uid not in found]
        if missing:
            raise ProblemDetail(status=400, title="Validation Error", detail=f"Unknown users: {', '.join(missing)}")
    await db.execute(delete(GroupMembership).where(GroupMembership.group_id == group_id))
    for uid in dict.fromkeys(body.user_ids):
        db.add(GroupMembership(group_id=group_id, user_id=uid))
    await db.commit()
    await audit_service.record(
        db,
        redis,
        tenant_id=admin.tenant_id,
        actor=admin.email,
        action="group.members.set",
        target=str(group_id),
        payload={"count": len(body.user_ids)},
    )
    return {"ok": True, "member_ids": [str(uid) for uid in body.user_ids]}
