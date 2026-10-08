"""Safe redirect helpers for hosted login/signup."""

from __future__ import annotations

from urllib.parse import urlparse


def safe_redirect_path(redirect: str | None, *, default: str = "/") -> str:
    """Allow only relative same-origin paths (reject scheme-relative and absolute URLs)."""
    if not redirect:
        return default
    value = redirect.strip()
    if not value.startswith("/") or value.startswith("//"):
        return default
    parsed = urlparse(value)
    if parsed.scheme or parsed.netloc:
        return default
    return value


__all__ = ["safe_redirect_path"]
