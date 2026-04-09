from sqlalchemy import String,Column,UUID
from app.config.db import Base
class Role(Base):
      __tablename__ = "roles"

      id = Column(UUID, primary_key=True, nullable=False)
      name = Column(String, nullable=False)
      tenant_id = Column(UUID, nullable=False)

