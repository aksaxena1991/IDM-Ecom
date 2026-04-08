from app.database.database_strategy import DatabaseStrategy


class DatabaseManager:
    _instance = None
    _strategies: dict[str, DatabaseStrategy] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
        return cls._instance

    def register_strategy(self, name: str, strategy: DatabaseStrategy):
        self._strategies[name] = strategy

    def get_strategy(self, name: str) -> DatabaseStrategy:
        if name not in self._strategies:
            raise KeyError(f"No strategy registered with name '{name}'")
        return self._strategies[name]

    async def connect(self, name: str):
        strategy = self.get_strategy(name)
        await strategy.connect()

    async def disconnect(self, name: str):
        strategy = self.get_strategy(name)
        await strategy.disconnect()

    def client(self, name: str):
        strategy = self.get_strategy(name)
        return strategy.get_client()


# Global access point
db_manager = DatabaseManager()