from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


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


class ScimTokenCreate(BaseModel):
    label: str | None = Field(default=None, max_length=255)


class SyncCursorOut(BaseModel):
    source: str
    last_token: str | None
