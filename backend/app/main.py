from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.core.redis import redis_client
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.projects import router as projects_router
from app.api.agents import router as agents_router
from app.api.chat import router as chat_router
from app.api.sites import router as sites_router
from app.api.usage import router as usage_router
from app.api.files import router as files_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify DB and Redis connections
    async with engine.connect() as conn:
        await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
    await redis_client.ping()
    yield
    # Shutdown
    await engine.dispose()
    await redis_client.aclose()


app = FastAPI(
    title="AI Business Constructor",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(agents_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(sites_router, prefix="/api/v1")
app.include_router(usage_router, prefix="/api/v1")
app.include_router(files_router, prefix="/api/v1")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
