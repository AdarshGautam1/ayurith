from typing import List, Tuple
from app.config import settings
from app.services.ingestion import init_chroma_client, get_or_create_collection
from app.models.schemas import SourceCard
from sentence_transformers import SentenceTransformer

# Load model once globally for retrieval
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer(settings.embedding_model)
    return _embedding_model

def retrieve_chunks(query: str, jurisdiction: str, top_k: int = 5) -> List[SourceCard]:
    client = init_chroma_client()
    collection = get_or_create_collection(client, jurisdiction)
    
    model = get_embedding_model()
    query_embedding = model.encode([query]).tolist()[0]
    
    count = collection.count()
    if count == 0:
        return []
        
    actual_k = min(top_k, count)
    
    # Query Chroma
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=actual_k
    )
    
    source_cards = []
    
    if not results['documents'] or not results['documents'][0]:
        return source_cards
        
    for i in range(len(results['documents'][0])):
        text = results['documents'][0][i]
        metadata = results['metadatas'][0][i]
        distance = results['distances'][0][i]
        chunk_id = results['ids'][0][i]
        
        # Normalize raw distances -> relevance_score [0,1]
        # For cosine distance, distance is in [0, 2]
        # Convert to relevance_score in [0, 1] (higher = more relevant)
        relevance_score = 1.0 - distance
        relevance_score = max(0.0, min(1.0, relevance_score))
        
        # Apply RETRIEVAL_THRESHOLD — discard below
        if relevance_score < settings.retrieval_threshold:
            continue
            
        source_cards.append(
            SourceCard(
                id=chunk_id,
                title=metadata.get("title", ""),
                authority=metadata.get("authority", ""),
                jurisdiction=metadata.get("jurisdiction", ""),
                document_type=metadata.get("document_type", ""),
                section=metadata.get("section", None),
                page=metadata.get("page", None),
                source_url=metadata.get("source_url", None),
                text_excerpt=text,
                relevance_score=relevance_score
            )
        )
        
    # Sort by relevance_score descending
    source_cards.sort(key=lambda x: x.relevance_score, reverse=True)
    return source_cards

def format_evidence_context(sources: List[SourceCard]) -> str:
    if not sources:
        return "No relevant sources found."
        
    context = ""
    for i, source in enumerate(sources, 1):
        context += f"SOURCE {i}\n"
        context += f"Title: {source.title}\n"
        context += f"Authority: {source.authority}\n"
        if source.section:
            context += f"Section: {source.section}\n"
        if source.page:
            context += f"Page: {source.page}\n"
        if source.source_url:
            context += f"URL: {source.source_url}\n"
        context += f"Relevance: {source.relevance_score:.2f}\n"
        context += f"Text:\n{source.text_excerpt}\n\n"
        
    return context
