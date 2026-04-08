from fastapi import FastAPI

from app.config.db import engine,Base
from app.routes import user_routes

app = FastAPI(title="CRUD API")

Base.metadata.create_all(bind=engine)
app.include_router(user_routes.router)