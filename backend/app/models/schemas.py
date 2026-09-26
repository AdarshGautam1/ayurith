from pydantic import BaseModel
from typing import Literal, Optional, List, Dict

# --- Requests ---
class ChatRequest(BaseModel):
    query: str
    jurisdiction: Literal["india", "international"]
    language: Literal["en", "hi"] = "en"
    conversation_id: Optional[str] = None

class ClassifyRequest(BaseModel):
    answers: Dict[str, str] # question_id → answer value
    jurisdiction: Literal["india", "international"]
    language: Literal["en", "hi"] = "en"

class IngestRequest(BaseModel):
    file_path: str
    jurisdiction: Literal["india", "international"]
    title: str
    authority: str
    document_type: str
    source_url: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[str] = None

# --- Responses ---
class SourceCard(BaseModel):
    id: str
    title: str
    authority: str
    jurisdiction: str
    document_type: str
    section: Optional[str] = None
    page: Optional[int] = None
    source_url: Optional[str] = None
    text_excerpt: str
    relevance_score: float

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCard]
    confidence: Literal["HIGH", "MEDIUM", "LOW", "INSUFFICIENT"]
    abstained: bool
    abstention_reason: Optional[str] = None
    conversation_id: str
    jurisdiction: str
    language: str

class ClassificationResult(BaseModel):
    category: str
    confidence: Literal["HIGH", "MEDIUM", "LOW", "INSUFFICIENT"]
    reasoning: str
    regulatory_implications: str
    ip_implications: str
    abs_relevance: str
    relevant_sources: List[SourceCard]
    jurisdiction: str
