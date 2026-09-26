import re
from typing import List, Dict, Any, Optional

def clean_text(text: str) -> str:
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    # Join hyphenated words
    text = re.sub(r'(\w+)-\s+(\w+)', r'\1\2', text)
    return text.strip()

def detect_structure(text: str) -> Optional[str]:
    # Very basic structure detection (e.g., Section 3, Article 15)
    match = re.search(r'^(Section|Article|Rule)\s+\d+[A-Z\(\)\w]*', text, re.IGNORECASE)
    if match:
        return match.group(0)
    return None

def chunk_text(text: str, metadata: Dict[str, Any], max_chunk_size: int = 3200, overlap: int = 200) -> List[Dict[str, Any]]:
    # A simple character-based chunker for the MVP
    # In a production system, this would be more sophisticated (e.g. LangChain RecursiveCharacterTextSplitter)
    chunks = []
    start = 0
    text_length = len(text)
    chunk_index = 0
    
    # Try to extract a section if the whole block starts with one
    current_section = detect_structure(text) or metadata.get("section", None)

    while start < text_length:
        end = start + max_chunk_size
        if end >= text_length:
            chunk_text = text[start:]
        else:
            # Try to find a good break point (paragraph or sentence end)
            break_point = max(
                text.rfind('\n\n', start, end),
                text.rfind('. ', start, end),
                text.rfind('\n', start, end)
            )
            if break_point != -1 and break_point > start + (max_chunk_size // 2):
                end = break_point + 1 # Include the period or newline
            
            chunk_text = text[start:end]
            
        chunk_metadata = metadata.copy()
        chunk_metadata["chunk_index"] = chunk_index
        if current_section:
            chunk_metadata["section"] = current_section
            
        chunks.append({
            "text": chunk_text.strip(),
            "metadata": chunk_metadata
        })
        
        start = end - overlap
        if start >= text_length:
            break
            
        chunk_index += 1
        
    return chunks
