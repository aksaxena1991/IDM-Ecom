from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository

from fastapi import HTTPException

class UserService:

    @staticmethod
    def create_user(db:Session, name:str, email:str):
        existing_user = UserRepository.get_user_by_email(db, email)

        if existing_user is not None:
            raise HTTPException(status_code=400, detail='User is already registered!')
        return UserRepository.create_user(db, name, email)

    @staticmethod
    def get_user_by_email(db:Session, email:str):
        return UserRepository.get_user_by_email(db,email)

    @staticmethod
    def get_users(db:Session):
        return UserRepository.get_all_users(db)

