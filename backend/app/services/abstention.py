from typing import Tuple, Optional, List
from app.models.schemas import SourceCard

def check_abstention(confidence: str, needs_escalation: bool, query_is_out_of_scope: bool) -> Tuple[bool, Optional[str]]:
    """
    Evaluates conditions to determine if the system should flag an abstention / advisory banner.
    Returns (should_abstain, abstention_reason).
    """
    if query_is_out_of_scope:
        return True, "Query is outside the supported scope of Ayurvedic IP and regulatory guidance."
        
    if confidence == "INSUFFICIENT":
        return True, "I couldn't find sufficient authoritative evidence in the indexed statutory records to answer this reliably. Please consult a qualified IP facilitator."
        
    if needs_escalation:
        return True, "Complex statutory analysis: Professional consultation with a registered Patent Agent is recommended before filing."
        
    return False, None
