from __future__ import annotations

from redis.asyncio import Redis

from app.core.config import get_settings


class RateLimiter:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def hit(self, redis: Redis, key: str, limit: int, window_seconds: int = 60) -> tuple[bool, int]:
        """Return (allowed, retry_after_seconds)."""
        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, window_seconds)
        if current > limit:
            ttl = await redis.ttl(key)
            return False, max(ttl, 1)
        return True, 0

    async def login_failure(self, redis: Redis, identity: str) -> tuple[bool, int]:
        """Track failures; return (locked, retry_after)."""
        fail_key = f"sso:login:fail:{identity}"
        lock_key = f"sso:login:lock:{identity}"
        if await redis.exists(lock_key):
            ttl = await redis.ttl(lock_key)
            return True, max(ttl, 1)

        count = await redis.incr(fail_key)
        if count == 1:
            await redis.expire(fail_key, self.settings.login_lockout_seconds)
        if count >= self.settings.login_max_failures:
            await redis.set(lock_key, "1", ex=self.settings.login_lockout_seconds)
            await redis.delete(fail_key)
            return True, self.settings.login_lockout_seconds
        return False, 0

    async def clear_login_failures(self, redis: Redis, identity: str) -> None:
        await redis.delete(f"sso:login:fail:{identity}")
        await redis.delete(f"sso:login:lock:{identity}")

    async def is_locked(self, redis: Redis, identity: str) -> tuple[bool, int]:
        lock_key = f"sso:login:lock:{identity}"
        if await redis.exists(lock_key):
            ttl = await redis.ttl(lock_key)
            return True, max(ttl, 1)
        return False, 0


rate_limiter = RateLimiter()
