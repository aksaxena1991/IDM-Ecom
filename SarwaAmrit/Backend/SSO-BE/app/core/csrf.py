"""Compatibility shim — use app.core.middleware."""

from app.core.middleware import CookieCsrfMiddleware

__all__ = ["CookieCsrfMiddleware"]
