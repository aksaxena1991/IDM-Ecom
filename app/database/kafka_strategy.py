from app.database.database_strategy import DatabaseStrategy


class KafkaStrategy(DatabaseStrategy):

    def __init__(self, url: str):
        self.url = url
        self._client = None

    def connect(self):
        print("Connecting to Kafka....")

    def disconnect(self):
        print("Disconnecting from Kafka....")

    def get_client(self):
        return self._client