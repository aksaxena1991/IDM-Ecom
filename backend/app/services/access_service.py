from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import (
    AccessPolicy,
    AppAssignment,
    Application,
    Group,
    GroupMembership,
    PrincipalType,
    ResourceAttribute,
    User,
    UserAttribute,
    UserStatus,
)
from app.services.policy_engine import (
    AccessDecision,
    PolicyRule,
    PolicyValidationError,
    evaluate,
    validate_attribute_map,
)
from app.services.role_service import role_service

APP_ACCESS = "app:access"


class AccessDenied(Exception):
    """Raised when a token grant must stop because policy denied the user."""


class AccessService:
    async def subject_custom_attributes(self, db: AsyncSession, user_id: uuid.UUID) -> dict[str, Any]:
        result = await db.execute(select(UserAttribute).where(UserAttribute.user_id == user_id))
        return {row.attr_key: row.attr_value for row in result.scalars().all()}

    async def resource_custom_attributes(self, db: AsyncSession, application_id: uuid.UUID) -> dict[str, Any]:
        result = await db.execute(
            select(ResourceAttribute).where(ResourceAttribute.application_id == application_id)
        )
        return {row.attr_key: row.attr_value for row in result.scalars().all()}

    async def replace_user_attributes(
        self, db: AsyncSession, user_id: uuid.UUID, attributes: dict[str, Any]
    ) -> dict[str, Any]:
        cleaned = validate_attribute_map(attributes)
        await db.execute(delete(UserAttribute).where(UserAttribute.user_id == user_id))
        for key, value in cleaned.items():
            db.add(UserAttribute(user_id=user_id, attr_key=key, attr_value=value))
        await db.flush()
        return cleaned

    async def replace_resource_attributes(
        self, db: AsyncSession, application_id: uuid.UUID, attributes: dict[str, Any]
    ) -> dict[str, Any]:
        cleaned = validate_attribute_map(attributes)
        await db.execute(delete(ResourceAttribute).where(ResourceAttribute.application_id == application_id))
        for key, value in cleaned.items():
            db.add(ResourceAttribute(application_id=application_id, attr_key=key, attr_value=value))
        await db.flush()
        return cleaned

    async def decide(
        self,
        db: AsyncSession,
        *,
        user: User,
        application: Application,
        action: str,
        now: datetime | None = None,
    ) -> AccessDecision:
        if user.tenant_id != application.tenant_id:
            return AccessDecision(
                allowed=False,
                reason="tenant_mismatch",
                message="User and application belong to different tenants",
            )
        if user.status != UserStatus.active:
            return AccessDecision(
                allowed=False,
                reason="user_inactive",
                message="User is not active",
            )

        if action == APP_ACCESS:
            assigned = await self._assignment_allows(db, user=user, application=application)
            if assigned is False:
                return AccessDecision(
                    allowed=False,
                    reason="not_assigned",
                    message="User is not assigned to this application",
                )

        subject = await self._subject(db, user)
        resource = await self._resource(db, application)
        moment = now or datetime.now(timezone.utc)
        environment = {"hour": moment.hour, "weekday": moment.weekday()}
        policies = await self._rules(db, user.tenant_id)
        return evaluate(
            policies,
            action=action,
            subject=subject,
            resource=resource,
            environment=environment,
        )

    async def _assignment_allows(
        self, db: AsyncSession, *, user: User, application: Application
    ) -> bool | None:
        """Return False if denied by assignments, True if assigned, None if no assignments (open)."""
        result = await db.execute(
            select(AppAssignment).where(AppAssignment.application_id == application.id)
        )
        rows = list(result.scalars().all())
        if not rows:
            return None
        group_ids = await self._group_ids(db, user.id)
        for row in rows:
            if row.principal_type == PrincipalType.user and row.principal_id == user.id:
                return True
            if row.principal_type == PrincipalType.group and row.principal_id in group_ids:
                return True
        return False

    async def _group_ids(self, db: AsyncSession, user_id: uuid.UUID) -> set[uuid.UUID]:
        result = await db.execute(
            select(GroupMembership.group_id).where(GroupMembership.user_id == user_id)
        )
        return set(result.scalars().all())

    async def _subject(self, db: AsyncSession, user: User) -> dict[str, Any]:
        custom = await self.subject_custom_attributes(db, user.id)
        groups = await self._groups(db, user.id)
        roles = await role_service.user_role_names(db, user.id)
        permissions = await role_service.user_permissions(db, user.id)
        is_admin = await role_service.is_admin_principal(db, user.id, is_admin_flag=user.is_admin)
        return {
            **custom,
            "id": str(user.id),
            "email": user.email,
            "name": user.name or user.email,
            "is_admin": is_admin,
            "status": user.status.value,
            "groups": groups,
            "roles": roles,
            "permissions": permissions,
        }

    async def _resource(self, db: AsyncSession, application: Application) -> dict[str, Any]:
        custom = await self.resource_custom_attributes(db, application.id)
        return {
            **custom,
            "id": str(application.id),
            "name": application.name,
            "client_id": application.client_id,
            "protocol": application.protocol.value,
            "status": application.status.value,
        }

    async def _groups(self, db: AsyncSession, user_id: uuid.UUID) -> list[str]:
        result = await db.execute(
            select(Group.name)
            .join(GroupMembership, GroupMembership.group_id == Group.id)
            .where(GroupMembership.user_id == user_id)
        )
        return list(result.scalars().all())

    async def _rules(self, db: AsyncSession, tenant_id: uuid.UUID) -> list[PolicyRule]:
        result = await db.execute(
            select(AccessPolicy).where(AccessPolicy.tenant_id == tenant_id).where(AccessPolicy.enabled.is_(True))
        )
        return [
            PolicyRule(
                name=row.name,
                effect=row.effect.value,
                priority=row.priority,
                actions=list(row.actions or []),
                resource_match=dict(row.resource_match or {}),
                conditions=dict(row.conditions or {}),
                enabled=row.enabled,
            )
            for row in result.scalars().all()
        ]


access_service = AccessService()

__all__ = ["APP_ACCESS", "AccessDenied", "AccessService", "PolicyValidationError", "access_service"]
