"""Prometheus-style metrics endpoint (scrape-token protected)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Header
from fastapi.responses import PlainTextResponse

from app.core.config import get_settings
from app.core.errors import ProblemDetail
from app.core.security import hash_token
from app.services.metrics import metrics

router = APIRouter(tags=["metrics"])


def _bearer_equals(authorization: str | None, expected: str) -> bool:
    if not authorization or not expected:
        return False
    if not authorization.lower().startswith("bearer "):
        return False
    provided = authorization.split(" ", 1)[1].strip()
    # Constant-time compare via hashes (tokens are not passwords but avoid casual leaks)
    return hash_token(provided) == hash_token(expected)


@router.get("/metrics")
async def prometheus_metrics(
    authorization: Annotated[str | None, Header()] = None,
):
    settings = get_settings()
    if not settings.metrics_token:
        raise ProblemDetail(status=404, title="Not Found", detail="Metrics disabled")
    if not _bearer_equals(authorization, settings.metrics_token):
        raise ProblemDetail(status=401, title="Unauthorized", detail="Metrics scrape token required")
    return PlainTextResponse(metrics.render(), media_type="text/plain; version=0.0.4")
