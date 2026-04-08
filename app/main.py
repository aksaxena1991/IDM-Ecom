from fastapi import FastAPI

from app.database.database_manager import db_manager
from app.database.postgres_strategy import PostgresStrategy
from app.routes import user_routes
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    strategy = PostgresStrategy(url="postgresql://postgres:Postgres@localhost:5432/idm")
    db_manager.set_strategy(strategy)
    await db_manager.connect()
    
    # Create tables using the strategy's engine
    from app.config.db import Base
    Base.metadata.create_all(bind=strategy.engine)
    
    yield
    await db_manager.disconnect()


app = FastAPI(lifespan=lifespan)

app.include_router(user_routes.router)