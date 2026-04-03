from fastapi import APIRouter

from app.api.routes import health, memory
from app.api.routes import courses, videos, logs

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(memory.router, tags=["memory"])
api_router.include_router(courses.router)
api_router.include_router(videos.router)
api_router.include_router(logs.router)
