from app.database.kafka_strategy import KafkaStrategy
from app.database.database_manager import db_manager
from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.schemas.user_schema import UserResponse

from app.services.user_service import UserService

from typing import List

router = APIRouter(
    prefix="/users",
)
@router.get("/db")
async def read_data(db=Depends(get_db)):
    return {"database": db}

@router.post("/kafka/{topic}")
async def send_message(topic:str, message:dict):
    producer = db_manager.client("kafka")
    import json
    payload = json.dumps(message).encode("utf-8")
    await producer.send_and_wait(topic, payload)
    return {"Status":"Message sent to kafka topic"} 
    

@router.post("", response_model=UserResponse)
async def create_user(name: str = Form(...), email: str = Form(...), db: Session = Depends(get_db)):
    return UserService.create_user(db, name, email)

@router.get("", response_model=List[UserResponse])
async def get_all_users(db:Session = Depends(get_db)):
    return UserService.get_users(db)

@router.get("/{email}", response_model=UserResponse)
async def get_user_by_email(email:str, db:Session = Depends(get_db)):
    return UserService.get_user_by_email(db, email)

