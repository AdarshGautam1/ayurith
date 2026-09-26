from fastapi import APIRouter, HTTPException
from typing import Optional, List
from app.models.database import SessionLocal, DocumentModel
from pydantic import BaseModel

router = APIRouter()

class SourceDetailResponse(BaseModel):
    id: str
    title: str
    authority: str
    jurisdiction: str
    document_type: str
    file_path: str
    source_url: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[str] = None

@router.get("/sources", response_model=List[SourceDetailResponse])
async def list_sources(jurisdiction: Optional[str] = None):
    db = SessionLocal()
    query = db.query(DocumentModel)
    if jurisdiction:
        query = query.filter(DocumentModel.jurisdiction == jurisdiction)
    docs = query.all()
    db.close()
    
    return [
        SourceDetailResponse(
            id=doc.id,
            title=doc.title,
            authority=doc.authority,
            jurisdiction=doc.jurisdiction,
            document_type=doc.document_type,
            file_path=doc.file_path,
            source_url=doc.source_url,
            version=doc.version,
            effective_date=doc.effective_date
        )
        for doc in docs
    ]

@router.get("/sources/{doc_id}", response_model=SourceDetailResponse)
async def get_source(doc_id: str):
    db = SessionLocal()
    doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    db.close()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Source not found")
        
    return SourceDetailResponse(
        id=doc.id,
        title=doc.title,
        authority=doc.authority,
        jurisdiction=doc.jurisdiction,
        document_type=doc.document_type,
        file_path=doc.file_path,
        source_url=doc.source_url,
        version=doc.version,
        effective_date=doc.effective_date
    )
