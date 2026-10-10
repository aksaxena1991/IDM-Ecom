"""Prometheus-style in-process counters and the scrape endpoint."""

from __future__ import annotations

from collections import defaultdict
from threading import Lock
from typing import Annotated

from fastapi import APIRouter, Header
from fastapi.responses import PlainTextResponse

from app.core.config import get_settings
from app.core.middleware import ProblemDetail
from app.core.security import hash_token


class MetricsRegistry:
    def __init__(self) -> None:
        self._counters: dict[str, int] = defaultdict(int)
        self._lock = Lock()

    def incr(self, name: str, amount: int = 1) -> None:
        with self._lock:
            self._counters[name] += amount

    def render(self) -> str:
        with self._lock:
            lines = ["# HELP sso_custom Custom SSO counters", "# TYPE sso_custom counter"]
            for name, value in sorted(self._counters.items()):
                lines.append(f"sso_{name} {value}")
            return "\n".join(lines) + "\n"


metrics = MetricsRegistry()
metrics_router = APIRouter(tags=["metrics"])


def _bearer_equals(authorization: str | None, expected: str) -> bool:
    if not authorization or not expected:
        return False
    if not authorization.lower().startswith("bearer "):
        return False
    provided = authorization.split(" ", 1)[1].strip()
    return hash_token(provided) == hash_token(expected)


@metrics_router.get("/metrics")
async def prometheus_metrics(
    authorization: Annotated[str | None, Header()] = None,
):
    settings = get_settings()
    if not settings.metrics_token:
        raise ProblemDetail(status=404, title="Not Found", detail="Metrics disabled")
    if not _bearer_equals(authorization, settings.metrics_token):
        raise ProblemDetail(status=401, title="Unauthorized", detail="Metrics scrape token required")
    return PlainTextResponse(metrics.render(), media_type="text/plain; version=0.0.4")


__all__ = ["metrics", "MetricsRegistry", "metrics_router"]
