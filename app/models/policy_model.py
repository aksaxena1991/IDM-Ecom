from sqlalchemy import String,UUID,Column,ForeignKey,Integer
from app.config.db import Base
class Policy(Base):
    __tablename__ = 'policies'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    policy = Column(JSONB, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'), nullable=False)
    priority = Column(Integer, default=0, nullable=False)

    # Optional: Add index on tenant_id for better performance
    __table_args__ = (
        {"schema": "public"},  # if you're using a specific schema
    )