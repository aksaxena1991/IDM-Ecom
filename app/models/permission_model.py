from app.config.db import Base
from sqlalchemy import UUID,Column,String
class Permission(Base):
      __tablename__='permissions'

      id = Column(UUID, primary_key=True, nullable=False)
      resource = Column(String, nullable=True)
      action = Column(String, nullable=True)