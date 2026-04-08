from abc import ABC, abstractmethod

class DatabaseFactory(ABC):
    @abstractmethod
    def get_connection(self):
        pass
    @abstractmethod
    def get_repository(self):
        pass
    @abstractmethod
    def get_user(self):
        pass