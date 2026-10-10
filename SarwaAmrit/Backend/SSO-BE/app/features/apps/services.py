"""Redirect URI and entitlement validation."""

from app.core.middleware import ProblemDetail
from app.features.oidc.services import oidc_service


def reject_wildcard_redirects(uris: list[str]) -> None:
    if any("*" in u for u in uris):
        raise ProblemDetail(
            status=400,
            title="Validation Error",
            detail="Wildcard redirect URIs are not allowed",
        )


def validate_redirect_uri(app, redirect_uri: str) -> bool:
    return oidc_service.validate_redirect_uri(app, redirect_uri)
