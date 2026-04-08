from sqlalchemy import Column, Integer, String
from app.config.db import Base

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email= Column(String, unique=True, nullable=False, index=True)

