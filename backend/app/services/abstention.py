from typing import Tuple, Optional, List
from app.models.schemas import SourceCard

def check_abstention(confidence: str, needs_escalation: bool, query_is_out_of_scope: bool) -> Tuple[bool, Optional[str]]:
    """
    Evaluates conditions to determine if the system should abstain from answering.
    Returns (should_abstain, abstention_reason).
    """
    if query_is_out_of_scope:
        return True, "Query is outside the supported scope of Ayurvedic IP and regulatory guidance."
        
    if confidence == "INSUFFICIENT":
        return True, "I couldn't find sufficient authoritative evidence to answer this reliably. Please consult a qualified IP facilitator for case-specific guidance."
        
    if needs_escalation:
        return True, "The available evidence is contradictory or requires expert legal interpretation. Please consult a qualified IP facilitator."
        
    return False, None
