
from sqlalchemy import Column, String, UUID, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.config.db import Base
from sqlalchemy.orm import relationship

from datetime import datetime
import uuid
class User(Base):
    __tablename__ = 'users'

    id = Column(UUID, primary_key=True, nullable=False, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    tenant_id = Column(UUID, nullable=False)
    create_at = Column(DateTime, default=datetime.now)

    roles = relationship("Role", secondary="user_roles", back_populates="users")
    attributes = relationship("UserAttribute", backref="user")

