from __future__ import annotations

import uuid

from pydantic import BaseModel, EmailStr, Field

from app.models.entities import GroupSource, UserStatus


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str | None
    status: UserStatus
    is_admin: bool

    model_config = {"from_attributes": True}


class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    source: GroupSource = GroupSource.manual


class GroupPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)


class MembersBody(BaseModel):
    user_ids: list[uuid.UUID] = Field(default_factory=list)
