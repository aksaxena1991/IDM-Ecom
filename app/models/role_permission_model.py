from sqlalchemy import UUID, Column,ForeignKey,PrimaryKeyConstraint
from app.config.db import Base
class RolePermission(Base):
    __tablename__ = 'role_permissions'

    role_id = Column(UUID(as_uuid=True), ForeignKey('role.id'), nullable=False)
    permission_id = Column(UUID(as_uuid=True), ForeignKey('permission.id'), nullable=False)

    # Option 1: Using PrimaryKeyConstraint (Recommended for composite keys)
    __table_args__ = (
        PrimaryKeyConstraint('role_id', 'permission_id'),
    )