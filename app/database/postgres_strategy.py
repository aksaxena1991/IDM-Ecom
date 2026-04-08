from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.database.database_strategy import DatabaseStrategy


class PostgresStrategy(DatabaseStrategy):
    def __init__(self, url: str):
        self.url = url
        self.engine = None
        self.session_local = None

    async def connect(self):
        print("Connecting to PostgreSQL....")
        self.engine = create_engine(self.url)
        self.session_local = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )
        print("PostgreSQL connected successfully.")

    async def disconnect(self):
        print("Disconnecting from PostgreSQL....")
        if self.engine:
            self.engine.dispose()
            self.engine = None
            self.session_local = None
        print("PostgreSQL disconnected.")

    def get_client(self) -> Session:
        if not self.session_local:
            raise RuntimeError("PostgreSQL is not connected. Call connect() first.")
        return self.session_local()
