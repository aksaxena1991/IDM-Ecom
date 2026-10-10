"""SAML XMLDSig helpers — `build_saml_response` is defined on the router."""

from __future__ import annotations

from typing import Any


def build_saml_response(*args: Any, **kwargs: Any):
    from app.features.saml.router import build_saml_response as _impl

    return _impl(*args, **kwargs)


__all__ = ["build_saml_response"]
