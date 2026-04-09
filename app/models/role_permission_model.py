from sqlalchemy import UUID, Column, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from app.config.db import Base

class RolePermission(Base):
    __tablename__ = 'role_permissions'

    role_id = Column(UUID(as_uuid=True), ForeignKey('roles.id'), nullable=False)
    permission_id = Column(UUID(as_uuid=True), ForeignKey('permissions.id'), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('role_id', 'permission_id'),
    )