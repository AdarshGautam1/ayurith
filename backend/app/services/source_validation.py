from typing import List, Dict, Any
from app.models.schemas import SourceCard

def validate_sources(sources: List[SourceCard], expected_jurisdiction: str) -> List[SourceCard]:
    valid_sources = []
    
    for source in sources:
        # Validate jurisdiction matches
        if source.jurisdiction.lower() != expected_jurisdiction.lower():
            # In a real system we might log an error here
            continue
            
        # Ensure ID exists
        if not source.id:
            continue
            
        # Optional fields check - ensure None if missing instead of empty string or 'null' string
        if source.section == "" or source.section == "null" or source.section == "None":
            source.section = None
            
        if source.page == 0:
            source.page = None
            
        valid_sources.append(source)
        
    return valid_sources
