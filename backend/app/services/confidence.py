from typing import List, Literal
from app.models.schemas import SourceCard
from app.config import settings

def calculate_confidence(cited_sources: List[SourceCard], has_conflict: bool, has_partial_coverage: bool) -> Literal["HIGH", "MEDIUM", "LOW", "INSUFFICIENT"]:
    """
    Calculates confidence based on retrieval relevance, authority, agreement, and coverage.
    """
    if not cited_sources:
        return "INSUFFICIENT"
        
    avg_relevance = sum(s.relevance_score for s in cited_sources) / len(cited_sources)
    top_relevance = max(s.relevance_score for s in cited_sources)
    
    # Check authority (Acts, Rules, Treaties, Protocols, Gazettes, Regulations)
    authoritative_sources = [
        s for s in cited_sources 
        if any(k in (s.document_type + " " + s.title + " " + s.authority).lower() for k in ["act", "treaty", "protocol", "convention", "rule", "fssai", "schedule", "patents", "biodiversity", "drugs"])
    ]
    num_authoritative = len(authoritative_sources)
    
    if top_relevance >= 0.35 and num_authoritative >= 1 and not has_conflict and not has_partial_coverage:
        return "HIGH"
    
    if top_relevance >= 0.25:
        if has_conflict:
            return "LOW"
        if has_partial_coverage:
            return "MEDIUM"
        return "HIGH" if num_authoritative >= 1 else "MEDIUM"
        
    return "LOW"
