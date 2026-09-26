import uuid
import json
from app.models.schemas import ChatRequest, ChatResponse
from app.services.translation import translator
from app.services.retrieval import retrieve_chunks, format_evidence_context
from app.services.source_validation import validate_sources
from app.services.llm import generate_rag_response
from app.services.citations import map_citations
from app.services.confidence import calculate_confidence
import re
import uuid
import json
from app.models.schemas import ChatRequest, ChatResponse, SourceCard
from app.services.translation import translator
from app.services.retrieval import retrieve_chunks, format_evidence_context
from app.services.source_validation import validate_sources
from app.services.llm import generate_rag_response
from app.services.citations import map_citations
from app.services.confidence import calculate_confidence
from app.services.abstention import check_abstention
from app.models.database import SessionLocal, ChatHistoryModel, DocumentModel

def process_chat(request: ChatRequest) -> ChatResponse:
    original_query = request.query.strip()
    
    # 1. Detect if the user wants Hindi (via dropdown, Devanagari script, or explicit keyword)
    has_devanagari = bool(re.search(r'[\u0900-\u097F]', original_query))
    has_hindi_keyword = bool(re.search(r'\b(in hindi|hindi me|hindi mein|translate to hindi|explain in hindi|hindi translation)\b', original_query.lower()))
    is_hindi_requested = (request.language == "hi") or has_devanagari or has_hindi_keyword
    effective_language = "hi" if is_hindi_requested else "en"
    
    conversation_id = request.conversation_id or str(uuid.uuid4())

    # 2. Check if this is a follow-up translation request like "Explain in hindi" or "translate to hindi"
    is_pure_translation_followup = bool(re.search(
        r'^(explain\s+in\s+hindi|translate\s+(this\s+)?to\s+hindi|in\s+hindi(\s+please)?|hindi\s+me(in)?(\s+batao)?|ise\s+hindi\s+me(in)?|हिंदी\s+में\s+बताएं?)$',
        original_query.lower()
    ))
    
    if is_pure_translation_followup:
        db = SessionLocal()
        last_msg = None
        if request.conversation_id:
            last_msg = db.query(ChatHistoryModel).filter(
                ChatHistoryModel.conversation_id == request.conversation_id,
                ChatHistoryModel.role == "assistant"
            ).order_by(ChatHistoryModel.id.desc()).first()
        if not last_msg:
            last_msg = db.query(ChatHistoryModel).filter(
                ChatHistoryModel.role == "assistant"
            ).order_by(ChatHistoryModel.id.desc()).first()
        db.close()
        
        if last_msg and last_msg.content:
            translated_answer = translator.translate(last_msg.content, "en", "hi")
            
            # Reconstruct previous sources if available
            previous_sources = []
            if last_msg.sources_json:
                try:
                    src_ids = json.loads(last_msg.sources_json)
                    db = SessionLocal()
                    for sid in src_ids:
                        doc = db.query(DocumentModel).filter(DocumentModel.id == sid.split("_")[0]).first()
                        if doc:
                            previous_sources.append(SourceCard(
                                id=sid,
                                title=doc.title,
                                authority=doc.authority,
                                jurisdiction=doc.jurisdiction,
                                document_type=doc.document_type,
                                section=None,
                                page=1,
                                source_url=doc.source_url,
                                text_excerpt="",
                                relevance_score=1.0
                            ))
                    db.close()
                except Exception:
                    pass

            response = ChatResponse(
                answer=translated_answer,
                sources=previous_sources,
                confidence="HIGH",
                abstained=False,
                abstention_reason=None,
                conversation_id=conversation_id,
                jurisdiction=request.jurisdiction,
                language="hi"
            )
            _save_history(conversation_id, "user", original_query, "[]")
            _save_history(conversation_id, "assistant", translated_answer, last_msg.sources_json or "[]")
            return response

    # 3. Clean search query for optimal statutory retrieval
    if has_devanagari:
        # Translate Devanagari query to English to match indexed gazettes
        normalized_query = translator.translate(original_query, "hi", "en")
    elif has_hindi_keyword:
        # Strip "explain in hindi" etc. to isolate the substantive legal query
        cleaned = re.sub(r'\b(in hindi|explain in hindi|translate to hindi|hindi mein|hindi me)\b', '', original_query, flags=re.IGNORECASE).strip()
        normalized_query = cleaned if len(cleaned) > 3 else original_query
    else:
        normalized_query = original_query

    # 4. Retrieve chunks
    raw_sources = retrieve_chunks(normalized_query, request.jurisdiction)
    
    # 5. Validate sources
    valid_sources = validate_sources(raw_sources, request.jurisdiction)
    
    # Check if we should abstain due to no sources early
    if not valid_sources:
        abstained, reason = check_abstention("INSUFFICIENT", False, False)
        if effective_language == "hi" and reason:
            reason = translator.translate(reason, "en", "hi")
        response = ChatResponse(
            answer=reason or ("पर्याप्त वैधानिक साक्ष्य उपलब्ध नहीं हैं।" if effective_language == "hi" else "I couldn't find sufficient authoritative evidence to answer this reliably."),
            sources=[],
            confidence="INSUFFICIENT",
            abstained=True,
            abstention_reason=reason,
            conversation_id=conversation_id,
            jurisdiction=request.jurisdiction,
            language=effective_language
        )
        _save_history(response.conversation_id, "user", original_query, "[]")
        _save_history(response.conversation_id, "assistant", response.answer, "[]")
        return response
        
    # 6. Format evidence context
    evidence_context = format_evidence_context(valid_sources)
    
    # 7. Call LLM with target language
    llm_output = generate_rag_response(normalized_query, evidence_context, target_language=effective_language)
    
    # 8. Map citations
    cited_sources = map_citations(llm_output.get("sources_used", []), valid_sources)
    
    # 9. Compute confidence
    confidence = calculate_confidence(
        cited_sources=cited_sources,
        has_conflict=llm_output.get("has_conflict", False),
        has_partial_coverage=llm_output.get("has_partial_coverage", False)
    )
    
    # 10. Check abstention conditions
    needs_escalation = llm_output.get("needs_escalation", False)
    query_is_out_of_scope = False
    
    should_abstain, abstention_reason = check_abstention(confidence, needs_escalation, query_is_out_of_scope)
    
    # 11. Prepare answer
    final_answer = llm_output.get("answer", "")
    if confidence == "INSUFFICIENT" or not final_answer:
        final_answer = abstention_reason or "I am abstaining from answering due to insufficient evidence."
        should_abstain = True

    # 12. Ensure output language is Hindi if requested
    if effective_language == "hi":
        # If output doesn't contain Devanagari characters, translate it
        if not re.search(r'[\u0900-\u097F]', final_answer):
            final_answer = translator.translate(final_answer, "en", "hi")
        if abstention_reason and not re.search(r'[\u0900-\u097F]', abstention_reason):
            abstention_reason = translator.translate(abstention_reason, "en", "hi")
        
    # Create final response object
    response = ChatResponse(
        answer=final_answer,
        sources=cited_sources,
        confidence=confidence,
        abstained=should_abstain,
        abstention_reason=abstention_reason,
        conversation_id=conversation_id,
        jurisdiction=request.jurisdiction,
        language=effective_language
    )
    
    # 13. Store history
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
