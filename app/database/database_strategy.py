from abc import ABC, abstractmethod

class DatabaseStrategy(ABC):
    @abstractmethod
    def connect(self):
        pass
    @abstractmethod
    def disconnect(self):
        pass
    @abstractmethod
    def get_client(self):
        pass