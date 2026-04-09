from sqlalchemy import UUID
from sqlalchemy.orm import Session, joinedload
from app.models.user_model import User
import uuid
from app.models.role_model import Role

class UserRepository:
    @staticmethod
    def create_user(db:Session, password_hash:str, email:str,tenant_id:UUID):
        user = User(id=uuid.uuid4(), password_hash=password_hash, email=email, tenant_id=tenant_id)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db:Session, email:str):
        user = db.query(User).filter(User.email == email).first()
        return user

    @staticmethod
    def get_all_users(db:Session):
        users = db.query(User).all()
        return users

    @staticmethod
    def get_user_with_security_context(db: Session, email: str):
        """Fetches user with roles, permissions, and attributes in one query."""
        return db.query(User).options(
            joinedload(User.roles).joinedload(Role.permissions),
            joinedload(User.attributes)
        ).filter(User.email == email).first()
