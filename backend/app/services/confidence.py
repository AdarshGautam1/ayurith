from typing import List, Literal
from app.models.schemas import SourceCard
from app.config import settings

def calculate_confidence(cited_sources: List[SourceCard], has_conflict: bool, has_partial_coverage: bool) -> Literal["HIGH", "MEDIUM", "LOW", "INSUFFICIENT"]:
    """
    Calculates confidence based on retrieval relevance, authority, agreement, and coverage.
    """
    if not cited_sources:
        return "INSUFFICIENT"
        
    # Calculate average relevance score of cited sources
    avg_relevance = sum(s.relevance_score for s in cited_sources) / len(cited_sources)
    top_relevance = max(s.relevance_score for s in cited_sources)
    
    # Check authority (simple heuristic for MVP: Acts and Treaties are high authority)
    authoritative_sources = [s for s in cited_sources if s.document_type.lower() in ["act", "treaty", "protocol", "convention"]]
    num_authoritative = len(authoritative_sources)
    
    if top_relevance > 0.70 and num_authoritative >= 2 and not has_conflict and not has_partial_coverage:
        return "HIGH"
    
    if top_relevance >= 0.50 and top_relevance <= 0.70:
        return "MEDIUM"
        
    if has_partial_coverage or (top_relevance > 0.70 and has_conflict == False and num_authoritative < 2):
        return "MEDIUM"
        
    if top_relevance < 0.50 or has_conflict or num_authoritative == 0:
        return "LOW"
        
    return "LOW"
