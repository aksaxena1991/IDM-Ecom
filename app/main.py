from fastapi import FastAPI

from app.database.database_manager import db_manager
from app.database.kafka_strategy import KafkaStrategy
from app.database.postgres_strategy import PostgresStrategy
from app.database.redis_strategy import RedisStrategy
from app.database.mongodb_strategy import MongodbStrategy
from app.routes import user_routes, saml_routes
from contextlib import asynccontextmanager

# Import all models so SQLAlchemy knows about all tables and relationships
from app.models.user_model import User
from app.models.role_model import Role
from app.models.user_role_model import UserRole
from app.models.role_permission_model import RolePermission
from app.models.permission_model import Permission
from app.models.policy_model import Policy
from app.models.user_attribute_model import UserAttribute

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

    kafkaStrategy = KafkaStrategy(url="localhost:9092")
    db_manager.register_strategy("kafka", kafkaStrategy)
    await db_manager.connect("kafka")
    

    # Create tables using the strategy's engine
    from app.config.db import Base
    Base.metadata.create_all(bind=pgStrategy.engine)

    yield

    await db_manager.disconnect("redis")
    await db_manager.disconnect("postgres")
    await db_manager.disconnect("mongodb")
    await db_manager.disconnect("kafka")


app = FastAPI(lifespan=lifespan)

app.include_router(user_routes.router)
app.include_router(saml_routes.router)