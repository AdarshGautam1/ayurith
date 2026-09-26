from typing import List, Optional
from app.models.schemas import SourceCard

def map_citations(sources_used_ids: List[int], all_retrieved_sources: List[SourceCard]) -> List[SourceCard]:
    """
    Maps 1-based indices from LLM output (e.g. [1, 2]) to actual SourceCards.
    Ensures no fabricated sources are returned.
    """
    cited_sources = []
    
    for source_idx in sources_used_ids:
        # LLM output is 1-indexed (e.g., "Based on [1]")
        idx = source_idx - 1
        if 0 <= idx < len(all_retrieved_sources):
            cited_sources.append(all_retrieved_sources[idx])
            
    return cited_sources
