from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.admin.access import router as access_router
from app.api.admin.sync import router as sync_router
from app.api.auth import router as auth_router
from app.api.auth.saml import router as saml_router
from app.api.health import router as health_router
from app.api.scim import router as scim_router
from app.api.session import router as session_router
from app.api.well_known import router as well_known_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import RequestIdMiddleware, setup_logging
from app.core.redis import close_redis, get_redis


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    setup_logging(settings.debug)
    await get_redis()
    yield
    await close_redis()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestIdMiddleware)
    register_exception_handlers(app)

    app.include_router(health_router)
    app.include_router(well_known_router)
    app.include_router(auth_router)
    app.include_router(saml_router)
    app.include_router(session_router)
    app.include_router(admin_router)
    app.include_router(access_router)
    app.include_router(sync_router)
    app.include_router(scim_router)

    @app.get("/")
    async def root():
        return {"service": settings.app_name, "docs": "/docs"}

    return app


app = create_app()
