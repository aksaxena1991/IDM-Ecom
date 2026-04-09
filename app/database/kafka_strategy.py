from app.database.database_strategy import DatabaseStrategy
import asyncio
from aiokafka import AIOKafkaProducer

class KafkaStrategy(DatabaseStrategy):

    def __init__(self, url: str):
        self.url = url
        self._client:AIOKafkaProducer | None = None

    async def connect(self):
        print("Connecting to Kafka....")
        try:
            self._client = AIOKafkaProducer(bootstrap_servers=self.url)
            await self._client.start()
            print("Kafka connected successfully.")
        except Exception as e:
            print(f"Failed to connect to Kafka: {e}")
            raise e

    async def disconnect(self):
        print("Disconnecting from Kafka....")
        if self._client:
            print("Disconnecting from Kafka....")
            await self._client.stop()

    def get_client(self)-> AIOKafkaProducer | None:
        return self._client