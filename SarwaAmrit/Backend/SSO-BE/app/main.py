from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.config import get_settings
from app.core.metrics import metrics_router
from app.core.middleware import (
    CookieCsrfMiddleware,
    RequestIdMiddleware,
    install_cors,
    register_exception_handlers,
    setup_logging,
)
from app.core.redis import close_redis, get_redis
from app.features.access.router import router as access_router
from app.features.apps.router import router as apps_router
from app.features.auth.router import router as auth_router
from app.features.directory.router import router as directory_router
from app.features.oidc.router import router as oidc_router
from app.features.rbac.router import router as rbac_router
from app.features.saml.router import router as saml_router
from app.features.scim.router import router as scim_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    setup_logging(settings.debug)
    await get_redis()
    yield
    await close_redis()


def create_app() -> FastAPI:
    settings = get_settings()
    docs_enabled = settings.debug
    app = FastAPI(
        title=settings.app_name,
        lifespan=lifespan,
        docs_url="/docs" if docs_enabled else None,
        redoc_url="/redoc" if docs_enabled else None,
        openapi_url="/openapi.json" if docs_enabled else None,
    )
    install_cors(app)
    app.add_middleware(CookieCsrfMiddleware)
    app.add_middleware(RequestIdMiddleware)
    register_exception_handlers(app)

    app.include_router(health_router)
    app.include_router(oidc_router)
    app.include_router(auth_router)
    app.include_router(saml_router)
    app.include_router(apps_router)
    app.include_router(access_router)
    app.include_router(rbac_router)
    app.include_router(directory_router)
    app.include_router(scim_router)
    app.include_router(metrics_router)

    @app.get("/")
    async def root():
        return {"service": settings.app_name, "docs": "/docs"}

    return app


app = create_app()
