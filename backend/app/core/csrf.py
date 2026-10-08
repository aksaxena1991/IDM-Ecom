"""Origin/Referer checks for cookie-authenticated mutating requests."""

from __future__ import annotations

from urllib.parse import urlparse

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import get_settings

MUTATING = {"POST", "PUT", "PATCH", "DELETE"}
COOKIE_PATH_PREFIXES = (
    "/login",
    "/signup",
    "/mfa/",
    "/session/",
)


class CookieCsrfMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method not in MUTATING:
            return await call_next(request)
        path = request.url.path
        if not any(path == p or path.startswith(p) for p in COOKIE_PATH_PREFIXES):
            return await call_next(request)
        # Bearer-only clients without cookies skip Origin (SPA often sends both)
        if request.headers.get("authorization", "").lower().startswith("bearer "):
            if not request.cookies:
                return await call_next(request)
        if not _origin_allowed(request):
            return JSONResponse(
                status_code=403,
                content={
                    "type": "about:blank",
                    "title": "CSRF rejected",
                    "status": 403,
                    "detail": "Origin/Referer not allowed for cookie-authenticated mutation",
                },
            )
        return await call_next(request)


def _origin_allowed(request: Request) -> bool:
    settings = get_settings()
    allowed = {o.strip().rstrip("/") for o in settings.cors_origins.split(",") if o.strip()}
    allowed.add(settings.base_url.rstrip("/"))
    origin = request.headers.get("origin")
    if origin:
        return origin.rstrip("/") in allowed
    referer = request.headers.get("referer")
    if referer:
        parsed = urlparse(referer)
        ref = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
        return ref in allowed
    # Same-site form posts from hosted HTML may omit Origin on some browsers; allow when Host matches
    host = request.headers.get("host")
    base_host = urlparse(settings.base_url).netloc
    return bool(host and host == base_host)


__all__ = ["CookieCsrfMiddleware"]
