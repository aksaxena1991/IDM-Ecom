from sqlalchemy import Column, Integer, String, UUID, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.config.db import Base
import uuid
class Policy(Base):
    __tablename__ = 'policies'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    policy = Column(JSONB, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    priority = Column(Integer, default=0, nullable=False)

    # GIN Index on JSONB column (exactly equivalent to your SQL)
    __table_args__ = (
        Index(
            'idx_policy_json', 
            'policy', 
            postgresql_using='gin'
        ),
    )