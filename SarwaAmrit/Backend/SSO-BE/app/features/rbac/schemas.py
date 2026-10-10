from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    description: str | None = None
    permissions: list[str] = Field(default_factory=list)


class RolePatch(BaseModel):
    description: str | None = None
    permissions: list[str] | None = None


class UserRolesBody(BaseModel):
    role_ids: list[uuid.UUID] = Field(default_factory=list)
