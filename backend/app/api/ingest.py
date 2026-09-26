import os
import shutil
import time
import re
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import IngestRequest
from app.services.ingestion import process_pdf
from pydantic import BaseModel

router = APIRouter()

class IngestResponse(BaseModel):
    status: str
    message: str
    chunks_embedded: int
    file_path: Optional[str] = None

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
        return IngestResponse(
            status="success",
            message=f"Successfully ingested and embedded {chunks_count} chunks.",
            chunks_embedded=chunks_count,
            file_path=request.file_path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/upload", response_model=IngestResponse)
async def upload_and_ingest(
    file: UploadFile = File(...),
    jurisdiction: str = Form(...),
    title: str = Form(...),
    authority: str = Form(...),
    document_type: str = Form(...),
    source_url: Optional[str] = Form(None),
    version: Optional[str] = Form(None),
    effective_date: Optional[str] = Form(None)
):
    upload_dir = os.path.join(".", "data", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Sanitize filename
    clean_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename or "document.pdf")
    timestamp_prefix = int(time.time())
    dest_filename = f"{timestamp_prefix}_{clean_filename}"
    dest_path = os.path.join(upload_dir, dest_filename)
    
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        chunks_count = process_pdf(
            file_path=dest_path,
            jurisdiction=jurisdiction.lower(),
            title=title.strip(),
            authority=authority.strip(),
            document_type=document_type.strip(),
            source_url=source_url.strip() if source_url else None,
            version=version.strip() if version else None,
            effective_date=effective_date.strip() if effective_date else None,
            is_demo=False
        )
        
        return IngestResponse(
            status="success",
            message=f"Uploaded '{file.filename}' and successfully embedded {chunks_count} chunks into {jurisdiction} knowledge base.",
            chunks_embedded=chunks_count,
            file_path=dest_path
        )
    except Exception as e:
        if os.path.exists(dest_path):
            try:
                os.remove(dest_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {str(e)}")
