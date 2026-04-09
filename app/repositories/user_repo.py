from sqlalchemy import UUID
from sqlalchemy.orm import Session
from app.models.user_model import User
import uuid

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

