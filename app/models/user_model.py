
from sqlalchemy import Column, String, UUID, DateTime, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.config.db import Base
from datetime import datetime
import uuid
class User(Base):
    __tablename__ = 'users'

    id = Column(UUID, primary_key=True, nullable=False, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    tenant_id = Column(UUID, nullable=False)
    create_at = Column(DateTime, default=datetime.now)

