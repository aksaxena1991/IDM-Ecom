"""System permission catalog for admin RBAC.

Custom permissions may still be attached to roles; these constants are enforced on API routes.
"""

from __future__ import annotations

ADMIN_ACCESS = "platform-super-admin:access"
APPS_READ = "apps:read"
APPS_WRITE = "apps:write"
USERS_WRITE = "users:write"
ROLES_WRITE = "roles:write"
POLICIES_WRITE = "policies:write"
AUDIT_READ = "audit:read"
GROUPS_READ = "groups:read"
GROUPS_WRITE = "groups:write"

# System permissions are the only ones wired to `require_permission` routes.
# Custom permissions may still be stored on roles for app-specific claims.

# Having write implies read for the same resource family.
READ_IMPLIED_BY_WRITE: dict[str, tuple[str, ...]] = {
    APPS_READ: (APPS_WRITE,),
    GROUPS_READ: (GROUPS_WRITE,),
    AUDIT_READ: (ADMIN_ACCESS,),
}

SYSTEM_PERMISSIONS = frozenset(
    {
        ADMIN_ACCESS,
        APPS_READ,
        APPS_WRITE,
        USERS_WRITE,
        ROLES_WRITE,
        POLICIES_WRITE,
        AUDIT_READ,
        GROUPS_READ,
        GROUPS_WRITE,
    }
)

__all__ = [
    "ADMIN_ACCESS",
    "APPS_READ",
    "APPS_WRITE",
    "USERS_WRITE",
    "ROLES_WRITE",
    "POLICIES_WRITE",
    "AUDIT_READ",
    "GROUPS_READ",
    "GROUPS_WRITE",
    "READ_IMPLIED_BY_WRITE",
    "SYSTEM_PERMISSIONS",
]
