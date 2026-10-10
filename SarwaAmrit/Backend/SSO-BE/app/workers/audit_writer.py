"""Consumes Redis Streams audit events.

System of record: Postgres `audit_events` written synchronously by `audit_service.record`.
This worker ACKs the Redis stream for fan-out/hygiene; it is not the primary write path.
"""

from __future__ import annotations

import asyncio
import logging

from app.core.config import get_settings
from app.core.redis import close_redis, get_redis

logger = logging.getLogger(__name__)


async def run_audit_consumer(stop_event: asyncio.Event | None = None) -> None:
    settings = get_settings()
    redis = await get_redis()
    group = "audit-writers"
    consumer = "worker-1"
    stream = settings.audit_stream_key
    try:
        await redis.xgroup_create(stream, group, id="0", mkstream=True)
    except Exception:  # noqa: BLE001
        pass

    logger.info("Audit consumer started on %s", stream)
    while True:
        if stop_event and stop_event.is_set():
            break
        messages = await redis.xreadgroup(group, consumer, {stream: ">"}, count=50, block=5000)
        if not messages:
            continue
        for _stream_name, entries in messages:
            for msg_id, _fields in entries:
                # Events are already persisted synchronously; ACK for stream hygiene
                await redis.xack(stream, group, msg_id)
                logger.debug("Acked audit event %s", msg_id)


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    try:
        await run_audit_consumer()
    finally:
        await close_redis()


if __name__ == "__main__":
    asyncio.run(main())
