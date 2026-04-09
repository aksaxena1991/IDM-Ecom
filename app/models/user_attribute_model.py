from sqlalchemy import UUID, Column, String, ForeignKey
from app.config.db import Base

class UserAttribute(Base):
      __tablename__ = 'user_attributes'

      # Changed to ForeignKey to link to the User model
      user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True, nullable=False)
      key = Column(String, nullable=False, primary_key=True) # Added as part of PK for uniqueness
      value = Column(String, nullable=False)