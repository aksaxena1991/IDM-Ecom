class DatabaseManager:
    _instance = None
    _strategy = DatabaseStrategy = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager,cls).__new__(cls)
        return cls._instance

    def set_strategy(self, strategy: DatabaseStrategy):
        self._strategy = strategy

        async def connect(self):
            if not self._strategy:
                raise ValueError("Strategy not set!")
            await self._strategy.connect()

        async def disconnect(self):
            if self._strategy:
                await self._strategy.disconnect()

        def client(self):
            return self._strategy.get_client()

    # Global access point
db_manager = DatabaseManager()