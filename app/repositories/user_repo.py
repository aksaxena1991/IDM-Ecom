from sqlalchemy.orm import Session
from app.models.user_model import User

class UserRepository:
    @staticmethod
    def create_user(db:Session, name:str, email:str):
        user = User(name=name,email=email)
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

