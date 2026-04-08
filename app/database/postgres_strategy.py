from app.database.database_strategy import DatabaseStrategy


class PostgresStrategy(DatabaseStrategy):
    def __init__(self, url:str):
        self.url = url
        self.engine = None

    async def connect(self):
        print("Connecting to PostgreSQL....")

    async def disconnect(self):
        print("Disconnecting from PostgreSQL....")

    def get_engine(self):
        return f"Postgres Client for {self.url}"
