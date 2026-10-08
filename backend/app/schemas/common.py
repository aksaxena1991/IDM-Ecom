from __future__ import annotations

from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field

T = TypeVar("T")


class CursorPage(BaseModel, Generic[T]):
    items: list[T]
    next_cursor: str | None = None


class AssignmentIn(BaseModel):
    principal_type: str = Field(pattern="^(user|group)$")
    principal_id: UUID
