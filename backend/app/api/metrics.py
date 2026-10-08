"""Lightweight Prometheus-style metrics endpoint."""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from app.services.metrics import metrics

router = APIRouter(tags=["metrics"])


@router.get("/metrics")
async def prometheus_metrics():
    return PlainTextResponse(metrics.render(), media_type="text/plain; version=0.0.4")
