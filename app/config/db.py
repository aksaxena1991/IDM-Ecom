from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import  load_dotenv

from app.database.database_manager import db_manager

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    return db_manager.client()
    # db = SessionLocal()
    # try:
    #     yield db
    # finally:
    #     db.close()