import os
import sys
import socket

# Restrict thread pools for PyTorch, OpenMP, and BLAS to prevent OOM in 512MB containers
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["ANONYMIZED_TELEMETRY"] = "False"

# Force IPv4 socket resolution only on Windows to avoid IPv6 routing blackholes/delays
if sys.platform == "win32":
    _orig_getaddrinfo = socket.getaddrinfo
    def _ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
    socket.getaddrinfo = _ipv4_getaddrinfo

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
    allow_origin_regex=r"https://.*\.onrender\.com",
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

@app.get("/")
async def root():
    return {"status": "ok", "service": "IP-SHAKTI Sahayak API", "version": "0.1.0"}

@app.get("/health")
async def root_health():
    return {"status": "ok"}

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
