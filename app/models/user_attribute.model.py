from sqlalchemy import UUID,Column,String
from app.config.db import Base
class UserAttribute(Base):
      __tablename__ = 'user_attributes'

      user_id = Column(UUID, primary_key=True, nullable=False)
      key= Column(String, nullable=False)
      value = Column(String, nullable=False)

      