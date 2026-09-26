from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

import logging
from app.config import settings
from app.models.database import init_db
from app.services.ingestion import get_chroma_client, init_chroma_collections
from app.api import health, chat, classify, ingest, sources, treatises, synergy, dossier, patentability, nba, compare

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database
    logger.info("Initializing SQLite database...")
    init_db()
    
    # Initialize persistent ChromaDB vector storage and collections
    logger.info("Initializing persistent ChromaDB vector storage...")
    chroma_client = get_chroma_client()
    chroma_stats = init_chroma_collections(chroma_client)
    app.state.chroma_client = chroma_client
    app.state.chroma_stats = chroma_stats
    logger.info("ChromaDB initialization complete.")
    
    yield
    # Cleanup code if needed
    logger.info("Shutting down application...")

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
app.include_router(treatises.router, prefix="/api", tags=["treatises"])
app.include_router(synergy.router, prefix="/api", tags=["synergy"])
app.include_router(dossier.router, prefix="/api", tags=["dossier"])
app.include_router(patentability.router, prefix="/api", tags=["patentability"])
app.include_router(nba.router, prefix="/api", tags=["nba"])
app.include_router(compare.router, prefix="/api", tags=["compare"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
