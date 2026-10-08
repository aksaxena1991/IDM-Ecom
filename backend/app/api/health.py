from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.errors import ProblemDetail
from app.core.redis import get_redis

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> dict[str, str]:
    try:
        await db.execute(text("SELECT 1"))
        await redis.ping()
    except Exception as exc:  # noqa: BLE001
        raise ProblemDetail(
            status=503,
            title="Service Unavailable",
            detail=f"Dependency check failed: {exc}",
        ) from exc
    return {"status": "ready"}
