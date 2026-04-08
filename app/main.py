from fastapi import FastAPI

from app.database.database_manager import db_manager
from app.database.postgres_strategy import PostgresStrategy
from app.database.redis_strategy import RedisStrategy
from app.routes import user_routes
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    pgStrategy = PostgresStrategy(url="postgresql://postgres:Postgres@localhost:5432/idm")
    db_manager.set_strategy(pgStrategy)
    await db_manager.connect()

    redisStrategy = RedisStrategy(url="redis://localhost:6379/0")
    # Redis strategy is separate, don't overwrite db_manager
    await redisStrategy.connect()

    # Create tables using the strategy's engine
    from app.config.db import Base
    Base.metadata.create_all(bind=pgStrategy.engine)

    yield

    await redisStrategy.disconnect()
    await db_manager.disconnect()


app = FastAPI(lifespan=lifespan)

app.include_router(user_routes.router)