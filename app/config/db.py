
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

async def get_db():
    from app.database.database_manager import db_manager
    client = db_manager.client()
    try:
        yield client
    finally:
        pass  # Session cleanup handled by strategy