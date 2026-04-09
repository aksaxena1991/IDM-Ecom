from fastapi import FastAPI

from app.database.database_manager import db_manager
from app.database.postgres_strategy import PostgresStrategy
from app.database.redis_strategy import RedisStrategy
from app.database.mongodb_strategy import MongodbStrategy
from app.routes import user_routes
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    pgStrategy = PostgresStrategy(url="postgresql://postgres:Postgres@localhost:5432/idm")
    db_manager.register_strategy("postgres", pgStrategy)
    await db_manager.connect("postgres")

    redisStrategy = RedisStrategy(url="redis://localhost:6379/0")
    db_manager.register_strategy("redis", redisStrategy)
    await db_manager.connect("redis")

    mongodbStrategy = MongodbStrategy(url="mongodb://localhost:27017/idm")
    db_manager.register_strategy("mongodb", mongodbStrategy)
    await db_manager.connect("mongodb")
    

    # Create tables using the strategy's engine
    from app.config.db import Base
    Base.metadata.create_all(bind=pgStrategy.engine)

    yield

    await db_manager.disconnect("redis")
    await db_manager.disconnect("postgres")
    await db_manager.disconnect("mongodb")


app = FastAPI(lifespan=lifespan)

app.include_router(user_routes.router)