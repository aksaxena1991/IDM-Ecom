from fastapi import FastAPI

from app.config.db import engine,Base
from app.database.database_manager import db_manager
from app.database.postgres_strategy import PostgresStrategy
from app.routes import user_routes
from contextlib import async_contextmanager

@async_contextmanager
async def lifespan(app:FastAPI):
    strategy = PostgresStrategy(url="postgresql://postgres:Postgres@localhost:5432/idm")
    db_manager = db_manager(strategy)

    await db_manager.connect()
    yield
    await db_manager.disconnect()


app = FastAPI(lifespan=lifespan)

Base.metadata.create_all(bind=engine)
app.include_router(user_routes.router)