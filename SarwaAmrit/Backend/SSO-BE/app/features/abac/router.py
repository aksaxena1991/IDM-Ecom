"""User and application attribute management (registered via access router)."""

from app.features.access.admin_access import (
    get_app_attributes,
    get_user_attributes,
    put_app_attributes,
    put_user_attributes,
)

__all__ = [
    "get_app_attributes",
    "get_user_attributes",
    "put_app_attributes",
    "put_user_attributes",
]
