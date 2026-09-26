import fitz # PyMuPDF
import os
import uuid
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings
from app.utils.text_processing import clean_text, detect_structure, chunk_text
from datetime import datetime
from app.models.database import SessionLocal, DocumentModel
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

_chroma_client: Optional[chromadb.PersistentClient] = None

def get_chroma_client() -> chromadb.PersistentClient:
    """Returns a singleton ChromaDB PersistentClient."""
    global _chroma_client
    if _chroma_client is None:
        os.makedirs(settings.chroma_persist_dir, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
    return _chroma_client

def init_chroma_client() -> chromadb.PersistentClient:
    """Backward-compatible helper returning the persistent Chroma client."""
    return get_chroma_client()

def get_or_create_collection(client, jurisdiction: str):
    collection_name = f"{jurisdiction}_docs"
    # Both collections must be created with distance_fn="cosine" explicitly
    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": settings.chroma_distance_metric}
    )
    return collection

def init_chroma_collections(client: Optional[chromadb.PersistentClient] = None) -> Dict[str, Any]:
    """Pre-warms and verifies persistent collections for both jurisdictions."""
    if client is None:
        client = get_chroma_client()

    jurisdictions = ["india", "international"]
    collection_stats = {}

    for jurisdiction in jurisdictions:
        coll = get_or_create_collection(client, jurisdiction)
        count = coll.count()
        collection_stats[f"{jurisdiction}_docs"] = {
            "name": f"{jurisdiction}_docs",
            "jurisdiction": jurisdiction,
            "count": count,
            "distance_metric": settings.chroma_distance_metric,
        }
        logger.info(
            f"ChromaDB persistent collection '{jurisdiction}_docs' initialized: {count} chunks, metric='{settings.chroma_distance_metric}'"
        )

    return collection_stats

def process_pdf(
    file_path: str,
    jurisdiction: str,
    title: str,
    authority: str,
    document_type: str,
    source_url: Optional[str] = None,
    version: Optional[str] = None,
    effective_date: Optional[str] = None,
    is_demo: bool = False
):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    doc_id = str(uuid.uuid4())
    
    # Track document in SQLite
    db = SessionLocal()
    db_doc = DocumentModel(
        id=doc_id,
        title=title,
        authority=authority,
        jurisdiction=jurisdiction,
        document_type=document_type,
        file_path=file_path,
        source_url=source_url,
        version=version,
        effective_date=effective_date
    )
    db.add(db_doc)
    db.commit()
    db.close()
    
    # Process PDF and extract text per page
    all_chunks = []
    
    try:
        pdf_doc = fitz.open(file_path)
    except Exception as e:
        # If it's a text file (demo), read it directly
        if file_path.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            metadata = {
                "doc_id": doc_id,
                "title": title,
                "authority": authority,
                "jurisdiction": jurisdiction,
                "document_type": document_type,
                "page": 1,
                "is_demo": is_demo
            }
            if source_url: metadata["source_url"] = source_url
            if version: metadata["version"] = version
            if effective_date: metadata["effective_date"] = effective_date
            cleaned = clean_text(content)
            chunks = chunk_text(cleaned, metadata)
            all_chunks.extend(chunks)
        else:
            raise e
    else:
        for page_num in range(len(pdf_doc)):
            page = pdf_doc.load_page(page_num)
            text = page.get_text("text")
            
            cleaned_text = clean_text(text)
            if not cleaned_text:
                continue
                
            metadata = {
                "doc_id": doc_id,
                "title": title,
                "authority": authority,
                "jurisdiction": jurisdiction,
                "document_type": document_type,
                "page": page_num + 1,
                "is_demo": is_demo
            }
            if source_url: metadata["source_url"] = source_url
            if version: metadata["version"] = version
            if effective_date: metadata["effective_date"] = effective_date
                
            chunks = chunk_text(cleaned_text, metadata)
            all_chunks.extend(chunks)
            
    # Embed and store in ChromaDB
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(settings.embedding_model)
    
    chroma_client = init_chroma_client()
    collection = get_or_create_collection(chroma_client, jurisdiction)
    
    texts = [c["text"] for c in all_chunks]
    metadatas = [c["metadata"] for c in all_chunks]
    ids = [f"{doc_id}_{i}" for i in range(len(all_chunks))]
    
    # Generate embeddings
    embeddings = model.encode(texts).tolist()
    
    # Upsert to ChromaDB
    collection.upsert(
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )
    
    return len(all_chunks)
