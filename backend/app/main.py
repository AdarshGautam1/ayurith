from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.models.database import init_db
from app.api import health, chat, classify, ingest, sources

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database
    init_db()
    # Will initialize ChromaDB client here in next phases
    yield
    # Cleanup code if needed

app = FastAPI(
    title="IP-SHAKTI Sahayak API",
    description="Backend API for IP-SHAKTI Sahayak (AyuRith project)",
    version="0.1.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(classify.router, prefix="/api", tags=["classify"])
app.include_router(ingest.router, prefix="/api", tags=["ingest"])
app.include_router(sources.router, prefix="/api", tags=["sources"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
