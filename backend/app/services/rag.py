import uuid
import json
from app.models.schemas import ChatRequest, ChatResponse
from app.services.translation import translator
from app.services.retrieval import retrieve_chunks, format_evidence_context
from app.services.source_validation import validate_sources
from app.services.llm import generate_rag_response
from app.services.citations import map_citations
from app.services.confidence import calculate_confidence
from app.services.abstention import check_abstention
from app.models.database import SessionLocal, ChatHistoryModel

def process_chat(request: ChatRequest) -> ChatResponse:
    # 1. Preserve original query
    original_query = request.query
    
    # 2. Translate if Hindi
    if request.language == "hi":
        normalized_query = translator.translate(original_query, "hi", "en")
    else:
        normalized_query = original_query
        
    # 3. Retrieve chunks
    raw_sources = retrieve_chunks(normalized_query, request.jurisdiction)
    
    # 4. Validate sources
    valid_sources = validate_sources(raw_sources, request.jurisdiction)
    
    # Check if we should abstain due to no sources early
    if not valid_sources:
        abstained, reason = check_abstention("INSUFFICIENT", False, False)
        response = ChatResponse(
            answer=reason or "I couldn't find sufficient authoritative evidence to answer this reliably.",
            sources=[],
            confidence="INSUFFICIENT",
            abstained=True,
            abstention_reason=reason,
            conversation_id=request.conversation_id or str(uuid.uuid4()),
            jurisdiction=request.jurisdiction,
            language=request.language
        )
        _save_history(response.conversation_id, "user", original_query, "[]")
        _save_history(response.conversation_id, "assistant", response.answer, "[]")
        return response
        
    # 5. Format evidence context
    evidence_context = format_evidence_context(valid_sources)
    
    # 6. Call LLM
    llm_output = generate_rag_response(normalized_query, evidence_context)
    
    # 7. Map citations
    cited_sources = map_citations(llm_output.get("sources_used", []), valid_sources)
    
    # 8. Compute confidence
    confidence = calculate_confidence(
        cited_sources=cited_sources,
        has_conflict=llm_output.get("has_conflict", False),
        has_partial_coverage=llm_output.get("has_partial_coverage", False)
    )
    
    # 9. Check abstention conditions
    needs_escalation = llm_output.get("needs_escalation", False)
    query_is_out_of_scope = False # Could be added as LLM output field later if needed
    
    should_abstain, abstention_reason = check_abstention(confidence, needs_escalation, query_is_out_of_scope)
    
    # 10. Prepare answer
    final_answer = llm_output.get("answer", "")
    if should_abstain:
        final_answer = abstention_reason or "I am abstaining from answering due to insufficient evidence."
        
    # 11. Translate answer if Hindi
    if request.language == "hi":
        final_answer = translator.translate(final_answer, "en", "hi")
        
    # Create final response object
    response = ChatResponse(
        answer=final_answer,
        sources=cited_sources,
        confidence=confidence,
        abstained=should_abstain,
        abstention_reason=abstention_reason,
        conversation_id=request.conversation_id or str(uuid.uuid4()),
        jurisdiction=request.jurisdiction,
        language=request.language
    )
    
    # 12. Store history
    sources_json = json.dumps([s.id for s in cited_sources])
    _save_history(response.conversation_id, "user", original_query, sources_json)
    _save_history(response.conversation_id, "assistant", response.answer, sources_json)
    
    return response

def _save_history(conversation_id: str, role: str, content: str, sources_json: str):
    db = SessionLocal()
    history = ChatHistoryModel(
        conversation_id=conversation_id,
        role=role,
        content=content,
        sources_json=sources_json
    )
    db.add(history)
    db.commit()
    db.close()
