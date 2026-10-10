"""RBAC: tenant roles, permissions, and user assignments."""

from __future__ import annotations

import re
import uuid
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.entities import Role, RolePermission, UserRole

ROLE_NAME = re.compile(r"^[a-z][a-z0-9_-]{0,63}$")
PERMISSION_NAME = re.compile(r"^[a-z*][a-z0-9_:*]{0,63}$")
PLATFORM_SUPER_ADMIN_PERMISSION = "platform-platform-super-admin:access"
DEFAULT_USER_ROLE = "user"
PLATFORM_SUPER_ADMIN_ROLE = "platform-super-admin"
PLATFORM_ADMIN_ROLE = "platform-admin"


class RoleValidationError(ValueError):
    pass


class RoleService:
    async def list_roles(self, db: AsyncSession, tenant_id: uuid.UUID) -> list[Role]:
        result = await db.execute(
            select(Role)
            .where(Role.tenant_id == tenant_id)
            .options(selectinload(Role.permissions))
            .order_by(Role.name)
        )
        return list(result.scalars().unique().all())

    async def get_role(self, db: AsyncSession, tenant_id: uuid.UUID, role_id: uuid.UUID) -> Role | None:
        result = await db.execute(
            select(Role)
            .where(Role.tenant_id == tenant_id)
            .where(Role.id == role_id)
            .options(selectinload(Role.permissions))
        )
        return result.scalar_one_or_none()

    async def get_role_by_name(self, db: AsyncSession, tenant_id: uuid.UUID, name: str) -> Role | None:
        result = await db.execute(
            select(Role).where(Role.tenant_id == tenant_id).where(Role.name == name)
        )
        return result.scalar_one_or_none()

    def validate_role_name(self, name: str) -> str:
        cleaned = name.strip().lower()
        if not ROLE_NAME.match(cleaned):
            raise RoleValidationError(
                "Role name must be lowercase alphanumeric with _ or - (max 64 chars)"
            )
        return cleaned

    def validate_permissions(self, permissions: list[str]) -> list[str]:
        cleaned: list[str] = []
        seen: set[str] = set()
        for raw in permissions:
            if not isinstance(raw, str):
                raise RoleValidationError("Each permission must be a string")
            perm = raw.strip().lower()
            if not PERMISSION_NAME.match(perm):
                raise RoleValidationError(f"Invalid permission: {raw!r}")
            if perm not in seen:
                seen.add(perm)
                cleaned.append(perm)
        if len(cleaned) > 50:
            raise RoleValidationError("At most 50 permissions per role")
        return cleaned

    async def create_role(
        self,
        db: AsyncSession,
        *,
        tenant_id: uuid.UUID,
        name: str,
        description: str | None,
        permissions: list[str],
        is_system: bool = False,
    ) -> Role:
        role_name = self.validate_role_name(name)
        perms = self.validate_permissions(permissions)
        existing = await self.get_role_by_name(db, tenant_id, role_name)
        if existing is not None:
            raise RoleValidationError(f"Role '{role_name}' already exists")
        role = Role(
            tenant_id=tenant_id,
            name=role_name,
            description=description,
            is_system=is_system,
        )
        db.add(role)
        await db.flush()
        for perm in perms:
            db.add(RolePermission(role_id=role.id, permission=perm))
        await db.flush()
        return await self.get_role(db, tenant_id, role.id)  # type: ignore[return-value]

    async def update_role(
        self,
        db: AsyncSession,
        role: Role,
        *,
        description: str | None = None,
        permissions: list[str] | None = None,
    ) -> Role:
        if description is not None:
            role.description = description
        if permissions is not None:
            perms = self.validate_permissions(permissions)
            await db.execute(delete(RolePermission).where(RolePermission.role_id == role.id))
            for perm in perms:
                db.add(RolePermission(role_id=role.id, permission=perm))
        await db.flush()
        return await self.get_role(db, role.tenant_id, role.id)  # type: ignore[return-value]

    async def delete_role(self, db: AsyncSession, role: Role) -> None:
        if role.is_system:
            raise RoleValidationError("System roles cannot be deleted")
        await db.execute(delete(UserRole).where(UserRole.role_id == role.id))
        await db.delete(role)
        await db.flush()

    async def user_role_names(self, db: AsyncSession, user_id: uuid.UUID) -> list[str]:
        result = await db.execute(
            select(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
            .order_by(Role.name)
        )
        return list(result.scalars().all())

    async def user_permissions(self, db: AsyncSession, user_id: uuid.UUID) -> list[str]:
        result = await db.execute(
            select(RolePermission.permission)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
        )
        return sorted(set(result.scalars().all()))

    async def user_has_permission(self, db: AsyncSession, user_id: uuid.UUID, permission: str) -> bool:
        perms = await self.user_permissions(db, user_id)
        if permission in perms:
            return True
        # Wildcard support: admin:* grants platform-super-admin:access
        prefix = permission.split(":")[0] + ":*"
        return prefix in perms or "*" in perms

    async def is_admin_principal(self, db: AsyncSession, user_id: uuid.UUID, *, is_admin_flag: bool) -> bool:
        if is_admin_flag:
            return True
        return await self.user_has_permission(db, user_id, SUPER_ADMIN_PERMISSION)

    async def list_user_roles(self, db: AsyncSession, user_id: uuid.UUID) -> list[Role]:
        result = await db.execute(
            select(Role)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
            .options(selectinload(Role.permissions))
            .order_by(Role.name)
        )
        return list(result.scalars().unique().all())

    async def replace_user_roles(
        self,
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        tenant_id: uuid.UUID,
        role_ids: list[uuid.UUID],
    ) -> list[Role]:
        if len(role_ids) > 20:
            raise RoleValidationError("A user may hold at most 20 roles")
        unique_ids = list(dict.fromkeys(role_ids))
        if unique_ids:
            result = await db.execute(
                select(Role).where(Role.tenant_id == tenant_id).where(Role.id.in_(unique_ids))
            )
            found = {row.id: row for row in result.scalars().all()}
            missing = [str(rid) for rid in unique_ids if rid not in found]
            if missing:
                raise RoleValidationError(f"Unknown role ids: {', '.join(missing)}")
        await db.execute(delete(UserRole).where(UserRole.user_id == user_id))
        for rid in unique_ids:
            db.add(UserRole(user_id=user_id, role_id=rid))
        await db.flush()
        return await self.list_user_roles(db, user_id)

    async def assign_default_user_role(self, db: AsyncSession, user_id: uuid.UUID, tenant_id: uuid.UUID) -> None:
        role = await self.get_role_by_name(db, tenant_id, DEFAULT_USER_ROLE)
        if role is None:
            return
        existing = await db.execute(
            select(UserRole).where(UserRole.user_id == user_id).where(UserRole.role_id == role.id)
        )
        if existing.scalar_one_or_none() is None:
            db.add(UserRole(user_id=user_id, role_id=role.id))
            await db.flush()

    def role_out(self, role: Role) -> dict[str, Any]:
        return {
            "id": str(role.id),
            "name": role.name,
            "description": role.description,
            "is_system": role.is_system,
            "permissions": sorted(p.permission for p in (role.permissions or [])),
        }


role_service = RoleService()

__all__ = [
    "SUPER_ADMIN_PERMISSION",
    "DEFAULT_USER_ROLE",
    "PLATFORM_SUPER_ADMIN_ROLE",
    "PLATFORM_ADMIN_ROLE",
    "RoleService",
    "RoleValidationError",
    "role_service",
]
