from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.models.database import SessionLocal, DocumentModel
from app.services.ingestion import get_chroma_client, get_or_create_collection
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

class SourceStatsResponse(BaseModel):
    total_documents: int
    india_documents: int
    international_documents: int
    india_chunks: int
    international_chunks: int
    document_types: Dict[str, int]

class ChunkItem(BaseModel):
    id: str
    text: str
    metadata: Dict[str, Any]

@router.get("/sources", response_model=List[SourceDetailResponse])
async def list_sources(
    jurisdiction: Optional[str] = None,
    document_type: Optional[str] = None,
    search: Optional[str] = None
):
    db = SessionLocal()
    query = db.query(DocumentModel)
    
    if jurisdiction and jurisdiction.lower() != "all":
        query = query.filter(DocumentModel.jurisdiction == jurisdiction.lower())
        
    if document_type and document_type.lower() != "all":
        query = query.filter(DocumentModel.document_type.ilike(f"%{document_type}%"))
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (DocumentModel.title.ilike(search_filter)) |
            (DocumentModel.authority.ilike(search_filter)) |
            (DocumentModel.document_type.ilike(search_filter))
        )
        
    docs = query.order_by(DocumentModel.title.asc()).all()
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

@router.get("/sources/stats", response_model=SourceStatsResponse)
async def get_source_stats():
    db = SessionLocal()
    all_docs = db.query(DocumentModel).all()
    db.close()
    
    india_docs_count = sum(1 for d in all_docs if d.jurisdiction == "india")
    intl_docs_count = sum(1 for d in all_docs if d.jurisdiction == "international")
    
    doc_types: Dict[str, int] = {}
    for d in all_docs:
        dtype = d.document_type or "Document"
        doc_types[dtype] = doc_types.get(dtype, 0) + 1
        
    # Get chunk counts from ChromaDB
    india_chunks = 0
    intl_chunks = 0
    try:
        client = get_chroma_client()
        india_coll = get_or_create_collection(client, "india")
        india_chunks = india_coll.count()
        intl_coll = get_or_create_collection(client, "international")
        intl_chunks = intl_coll.count()
    except Exception:
        pass
        
    return SourceStatsResponse(
        total_documents=len(all_docs),
        india_documents=india_docs_count,
        international_documents=intl_docs_count,
        india_chunks=india_chunks,
        international_chunks=intl_chunks,
        document_types=doc_types
    )

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

@router.get("/sources/{doc_id}/chunks", response_model=List[ChunkItem])
async def get_source_chunks(doc_id: str):
    db = SessionLocal()
    doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    db.close()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Source not found")
        
    client = get_chroma_client()
    collection = get_or_create_collection(client, doc.jurisdiction)
    
    # Query Chroma for chunks belonging to this doc_id
    try:
        result = collection.get(where={"doc_id": doc_id})
        items = []
        if result and result.get("documents"):
            for i in range(len(result["documents"])):
                items.append(ChunkItem(
                    id=result["ids"][i],
                    text=result["documents"][i],
                    metadata=result["metadatas"][i] if result.get("metadatas") else {}
                ))
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve chunks: {str(e)}")
