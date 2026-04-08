from fastapi import APIRouter , Depends
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.schemas.user_schema import UserCreate, UserResponse

from app.services.user_service import UserService

from typing import List

router = APIRouter(
    prefix="/users",
)
@router.post("/", response_model=UserResponse)
def create_user(user:UserCreate, db:Session = Depends(get_db)):
    return UserService.create_user(db,user.name,user.email)

@router.get("/", response_model=List[UserResponse])
def get_all_users(db:Session = Depends(get_db)):
    return UserService.get_users(db)

@router.get("/{email}", response_model=UserResponse)
def get_user_by_email(email:str, db:Session = Depends(get_db)):
    return UserService.get_user_by_email(db, email)

