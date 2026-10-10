"""Request ID, CSRF origin checks, CORS helpers, and RFC 7807 problem details."""

from __future__ import annotations

import logging
import uuid
from contextvars import ContextVar
from typing import Any
from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import JSONResponse as StarletteJSONResponse
from starlette.responses import Response

from app.core.config import get_settings

request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)
tenant_id_ctx: ContextVar[str | None] = ContextVar("tenant_id", default=None)

MUTATING = {"POST", "PUT", "PATCH", "DELETE"}
COOKIE_PATH_PREFIXES = (
    "/login",
    "/signup",
    "/mfa/",
    "/session/",
)


class ProblemDetail(Exception):
    def __init__(
        self,
        *,
        status: int,
        title: str,
        detail: str | None = None,
        type_: str = "about:blank",
        instance: str | None = None,
        extensions: dict[str, Any] | None = None,
    ) -> None:
        self.status = status
        self.title = title
        self.detail = detail
        self.type = type_
        self.instance = instance
        self.extensions = extensions or {}


def problem_response(
    *,
    status: int,
    title: str,
    detail: str | None = None,
    type_: str = "about:blank",
    instance: str | None = None,
    extensions: dict[str, Any] | None = None,
) -> JSONResponse:
    body: dict[str, Any] = {
        "type": type_,
        "title": title,
        "status": status,
    }
    if detail is not None:
        body["detail"] = detail
    if instance is not None:
        body["instance"] = instance
    if extensions:
        body.update(extensions)
    return JSONResponse(
        status_code=status,
        content=body,
        media_type="application/problem+json",
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ProblemDetail)
    async def problem_detail_handler(_: Request, exc: ProblemDetail) -> JSONResponse:
        return problem_response(
            status=exc.status,
            title=exc.title,
            detail=exc.detail,
            type_=exc.type,
            instance=exc.instance,
            extensions=exc.extensions,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        return problem_response(
            status=exc.status_code,
            title=detail,
            detail=detail,
            instance=str(request.url.path),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return problem_response(
            status=422,
            title="Validation Error",
            detail="Request validation failed",
            instance=str(request.url.path),
            extensions={"errors": exc.errors()},
        )


class RequestContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx.get() or "-"  # type: ignore[attr-defined]
        record.tenant_id = tenant_id_ctx.get() or "-"  # type: ignore[attr-defined]
        return True


def setup_logging(debug: bool = False) -> None:
    level = logging.DEBUG if debug else logging.INFO
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s request_id=%(request_id)s tenant_id=%(tenant_id)s %(name)s %(message)s"
        )
    )
    handler.addFilter(RequestContextFilter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)


def set_tenant_context(tenant_id: str | None) -> None:
    if tenant_id:
        tenant_id_ctx.set(tenant_id)


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next) -> Response:
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        rid_token = request_id_ctx.set(request_id)
        tenant_hint = request.headers.get("x-tenant-id") or request.headers.get("x-tenant-slug")
        auth = request.headers.get("authorization") or ""
        if auth.lower().startswith("bearer ") and "." in auth:
            try:
                import base64
                import json

                payload_b64 = auth.split(" ", 1)[1].split(".")[1]
                pad = "=" * (-len(payload_b64) % 4)
                claims = json.loads(base64.urlsafe_b64decode(payload_b64 + pad))
                if claims.get("tenant_id"):
                    tenant_hint = str(claims["tenant_id"])
            except Exception:  # noqa: BLE001
                pass
        tid_token = tenant_id_ctx.set(tenant_hint)
        request.state.request_id = request_id
        try:
            response = await call_next(request)
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            request_id_ctx.reset(rid_token)
            tenant_id_ctx.reset(tid_token)


class CookieCsrfMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next) -> Response:
        if request.method not in MUTATING:
            return await call_next(request)
        path = request.url.path
        if not any(path == p or path.startswith(p) for p in COOKIE_PATH_PREFIXES):
            return await call_next(request)
        if request.headers.get("authorization", "").lower().startswith("bearer "):
            if not request.cookies:
                return await call_next(request)
        if not _origin_allowed(request):
            return StarletteJSONResponse(
                status_code=403,
                content={
                    "type": "about:blank",
                    "title": "CSRF rejected",
                    "status": 403,
                    "detail": "Origin/Referer not allowed for cookie-authenticated mutation",
                },
            )
        return await call_next(request)


def _origin_allowed(request: StarletteRequest) -> bool:
    settings = get_settings()
    allowed = {o.rstrip("/") for o in settings.cors_origins}
    allowed.add(settings.base_url.rstrip("/"))
    origin = request.headers.get("origin")
    if origin:
        return origin.rstrip("/") in allowed
    referer = request.headers.get("referer")
    if referer:
        parsed = urlparse(referer)
        ref = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
        return ref in allowed
    host = request.headers.get("host")
    base_host = urlparse(settings.base_url).netloc
    return bool(host and host == base_host)


def install_cors(app: FastAPI) -> None:
    settings = get_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-Id"],
    )


__all__ = [
    "ProblemDetail",
    "problem_response",
    "register_exception_handlers",
    "setup_logging",
    "set_tenant_context",
    "RequestIdMiddleware",
    "CookieCsrfMiddleware",
    "install_cors",
]
