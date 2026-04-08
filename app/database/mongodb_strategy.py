from app.database.database_strategy import DatabaseStrategy


class MongoDBStrategy(DatabaseStrategy):
    def __init__(self, url:str):
        self.url = url
        self.client = None

    async def connect(self):
        print("Connecting to MongoDB...")

    async def disconnect(self):
        print("Disconnecting from MongoDB...")

    def get_client(self):
        return f"Mongo Client for {self.url}"