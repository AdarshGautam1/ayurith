from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.config import settings
from app.models.database import SessionLocal, DocumentModel
from app.services.ingestion import get_chroma_client, get_or_create_collection

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    message: str
    sqlite_status: str
    chroma_status: str
    chroma_persist_dir: str
    collections: Dict[str, Any]
    gemini_configured: bool

@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request):
    # Verify SQLite DB
    sqlite_status = "ok"
    try:
        db = SessionLocal()
        _ = db.query(DocumentModel).count()
        db.close()
    except Exception as e:
        sqlite_status = f"error: {str(e)}"

    # Verify ChromaDB
    chroma_status = "ok"
    collections_info = {}
    try:
        # Check from app.state or singleton
        client = getattr(request.app.state, "chroma_client", None) or get_chroma_client()
        for jurisdiction in ["india", "international"]:
            coll = get_or_create_collection(client, jurisdiction)
            collections_info[f"{jurisdiction}_docs"] = {
                "count": coll.count(),
                "metric": settings.chroma_distance_metric,
            }
    except Exception as e:
        chroma_status = f"error: {str(e)}"

    overall_status = "ok" if (sqlite_status == "ok" and chroma_status == "ok") else "degraded"

    return HealthResponse(
        status=overall_status,
        message="IP-SHAKTI Sahayak backend is active",
        sqlite_status=sqlite_status,
        chroma_status=chroma_status,
        chroma_persist_dir=settings.chroma_persist_dir,
        collections=collections_info,
        gemini_configured=bool(settings.gemini_api_key and "your_gemini_api_key" not in settings.gemini_api_key),
    )
