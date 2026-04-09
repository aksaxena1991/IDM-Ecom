from app.database.database_strategy import DatabaseStrategy
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

class MongodbStrategy(DatabaseStrategy):
    def __init__(self, url:str):
        self.url = url
        self._client: AsyncIOMotorClient | None = None

    async def connect(self):
        print("Connecting to MongoDB...")
        try:
            self._client = AsyncIOMotorClient(self.url)
            # Test connection by pinging the server
            await self._client.admin.command('ping')
            print("Successfully connected to MongoDB!")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            self._client = None
            raise

    async def disconnect(self):
        print("Disconnecting from MongoDB...")
        if self._client is not None:
            self._client.close()
            # Give time for connections to close gracefully
            await asyncio.sleep(0.1)
            self._client = None
            print("Disconnected from MongoDB.")

    def get_client(self):
        if self._client is None:
            raise RuntimeError("MongoDB is not connected. Call connect() first.")
        return self._client

    @property
    def is_connected(self):
        return self._client is not None