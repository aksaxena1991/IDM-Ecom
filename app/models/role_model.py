from sqlalchemy import String,Column,UUID
from app.config.db import Base
from sqlalchemy.orm import relationship
class Role(Base):
      __tablename__ = "roles"

      id = Column(UUID, primary_key=True, nullable=False)
      name = Column(String, nullable=False)
      tenant_id = Column(UUID, nullable=False)

      users = relationship("User", secondary="user_roles", back_populates="roles")
      permissions = relationship("Permission", secondary="role_permissions")