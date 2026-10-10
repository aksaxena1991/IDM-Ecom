from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.entities import AppProtocol, AppStatus


class AppCreate(BaseModel):
    name: str
    protocol: AppProtocol
    redirect_uris: list[str] = Field(default_factory=list)
    acs_url: str | None = None
    entity_id: str | None = None
    audience: str | None = None


class AppUpdate(BaseModel):
    name: str | None = None
    status: AppStatus | None = None
    redirect_uris: list[str] | None = None
    acs_url: str | None = None
    entity_id: str | None = None
    audience: str | None = None


class AssignmentBody(BaseModel):
    assignments: list[dict[str, str]]
