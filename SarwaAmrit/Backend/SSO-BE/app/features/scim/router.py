"""SCIM 2.0 users/groups, admin tokens, and sync-cursor stubs."""

from fastapi import APIRouter

from app.features.scim.cursors import router as cursors_router
from app.features.scim.provisioning import router as provisioning_router
from app.features.scim.tokens import router as tokens_router

router = APIRouter()
router.include_router(provisioning_router)
router.include_router(tokens_router)
router.include_router(cursors_router)
