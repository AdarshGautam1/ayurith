from fastapi import APIRouter, HTTPException
from app.models.schemas import IngestRequest
from app.services.ingestion import process_pdf
from pydantic import BaseModel

router = APIRouter()

class IngestResponse(BaseModel):
    status: str
    chunks_embedded: int

@router.post("/ingest", response_model=IngestResponse)
async def ingest_endpoint(request: IngestRequest):
    try:
        chunks_count = process_pdf(
            file_path=request.file_path,
            jurisdiction=request.jurisdiction,
            title=request.title,
            authority=request.authority,
            document_type=request.document_type,
            source_url=request.source_url,
            version=request.version,
            effective_date=request.effective_date,
            is_demo=False
        )
        return IngestResponse(status="success", chunks_embedded=chunks_count)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
