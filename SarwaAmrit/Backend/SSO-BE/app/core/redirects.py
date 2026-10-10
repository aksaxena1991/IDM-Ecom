"""Safe redirect helpers for hosted login/signup."""

from __future__ import annotations

from urllib.parse import urlparse


def safe_redirect_path(
    redirect: str | None,
    *,
    default: str = "/",
    base_url: str | None = None,
) -> str:
    """Allow only same-origin relative paths (or absolute URLs that match base_url).

    Rejects scheme-relative (`//evil`) and off-site absolute URLs.
    Same-origin absolute URLs are reduced to path + query so post-login can
    resume `/oauth2/authorize?...` after the hosted login form.
    """
    if not redirect:
        return default
    value = redirect.strip()

    if base_url is None:
        try:
            from app.core.config import get_settings

            base_url = get_settings().base_url
        except Exception:  # noqa: BLE001
            base_url = None

    if value.startswith(("http://", "https://")):
        if not base_url:
            return default
        base = urlparse(base_url.rstrip("/"))
        parsed = urlparse(value)
        if parsed.scheme != base.scheme or parsed.netloc != base.netloc:
            return default
        value = parsed.path or "/"
        if parsed.query:
            value = f"{value}?{parsed.query}"

    if not value.startswith("/") or value.startswith("//"):
        return default
    parsed = urlparse(value)
    if parsed.scheme or parsed.netloc:
        return default
    # Keep path + query (authorize resume); drop fragments
    if parsed.query:
        return f"{parsed.path}?{parsed.query}"
    return parsed.path or default


__all__ = ["safe_redirect_path"]
