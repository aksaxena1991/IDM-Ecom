from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, Field

from app.features.access.services import APP_ACCESS
from app.models.entities import PolicyEffect


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
