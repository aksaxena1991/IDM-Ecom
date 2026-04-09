from sqlalchemy import UUID, Column, ForeignKey, PrimaryKeyConstraint
from app.config.db import Base

class UserRole(Base):
    __tablename__ = 'user_roles'

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey('roles.id'), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('user_id', 'role_id'),
    )