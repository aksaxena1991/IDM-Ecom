from abc import ABC, abstractmethod

class DatabaseStrategy(ABC):
    @abstractmethod
    async def connect(self):
        pass

    @abstractmethod
    async def disconnect(self):
        pass

    @abstractmethod
    def get_client(self):
        pass