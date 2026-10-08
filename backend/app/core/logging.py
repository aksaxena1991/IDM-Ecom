import logging
import uuid
from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)
tenant_id_ctx: ContextVar[str | None] = ContextVar("tenant_id", default=None)


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
    """Set tenant id for structured logs (called from auth/deps when known)."""
    if tenant_id:
        tenant_id_ctx.set(tenant_id)


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
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
