import redis.asyncio as redis
from app.database.database_strategy import DatabaseStrategy

class RedisStrategy(DatabaseStrategy):
    def __init__(self, url: str):
        self.url = url
        self._client: redis.Redis | None = None

    async def connect(self):
        """
        Initializes the Redis connection pool.
        """
        print(f"Connecting to Redis at {self.url}...")
        try:
            # We create the client using the connection URL
            self._client = redis.from_url(
                self.url, 
                encoding="utf-8", 
                decode_responses=True
            )
            # Ping to verify the connection is actually alive
            await self._client.ping()
            print("Redis connected successfully.")
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            raise

    async def disconnect(self):
        """
        Closes the Redis connection.
        """
        if self._client:
            print("Disconnecting from Redis....")
            await self._client.close()
            self._client = None
            print("Redis disconnected.")

    def get_client(self) -> redis.Redis:
        """
        Returns the Redis client instance.
        """
        if self._client is None:
            raise RuntimeError("Redis is not connected. Call connect() first.")
        return self._client