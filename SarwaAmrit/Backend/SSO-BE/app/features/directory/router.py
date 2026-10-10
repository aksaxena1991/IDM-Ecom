"""Users (cursor pagination on /v1/users) and group CRUD."""

from fastapi import APIRouter

from app.features.apps.admin_routes import router as _admin
from app.features.directory.groups import router as groups_router

router = APIRouter()
# /v1/users is defined on the admin routes module; groups are included here.
router.include_router(groups_router)

__all__ = ["router", "_admin"]
