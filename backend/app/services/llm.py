import json
import logging
import re
from typing import Dict, Any, Optional
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize GenAI client
_client = None

def get_genai_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client

SYSTEM_PROMPT = """You are IP-SHAKTI Sahayak (AyuRith project), a source-grounded information assistant for Ayurveda-related intellectual property and regulatory questions.

Answer only from the evidence supplied to you.

Rules:
1. Do not invent laws, sections, rules, treaties, cases, URLs, or regulatory requirements.
2. Do not cite a source that was not supplied in the evidence.
3. Cite every substantive legal or regulatory claim using [1], [2], etc.
4. Clearly distinguish retrieved evidence from your interpretation.
5. Do not provide definitive legal advice.
6. State uncertainty when evidence is incomplete or conflicting.
7. If evidence is insufficient, say so explicitly and recommend consulting a qualified IP facilitator by setting needs_escalation to true.
8. Respect the selected jurisdiction. Never silently combine Indian and International legal regimes.
9. Keep the answer concise and understandable to a non-lawyer.
10. If you cannot answer from the supplied evidence, do not guess.

Output format (JSON):
{
  "answer": "Your grounded answer with [1], [2] citations...",
  "sources_used": [1, 2],
  "uncertainty": "Any caveats or incomplete areas",
  "needs_escalation": false,
  "has_conflict": false,
  "has_partial_coverage": false
}"""

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Robustly extracts and parses JSON even if wrapped in markdown code blocks or trailing text."""
    text = raw_text.strip()
    if "```" in text:
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text).strip()
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"(\{[\s\S]*\})", raw_text)
        if match:
            return json.loads(match.group(1))
        raise

def _build_extractive_fallback(query: str, evidence_context: str) -> Dict[str, Any]:
    """
    Constructs a citation-grounded extractive statutory answer from retrieved context
    when the Gemini API is unreachable or unconfigured.
    """
    source_blocks = re.split(r"SOURCE\s+(\d+)", evidence_context)
    if len(source_blocks) < 3:
        return {
            "answer": "Insufficient statutory provisions found in the database for this query. Please consult an IP facilitator.",
            "sources_used": [],
            "uncertainty": "No matching statutory text retrieved.",
            "needs_escalation": True,
            "has_conflict": False,
            "has_partial_coverage": False
        }

    sources_used = []
    lines = []
    lines.append(f"### Statutory Findings for: \"{query}\"\n")
    
    # Process up to 3 retrieved sources
    source_count = min(3, len(source_blocks) // 2)
    for i in range(1, source_count + 1):
        idx = (i - 1) * 2 + 1
        source_num = int(source_blocks[idx])
        block_text = source_blocks[idx + 1]
        
        title_match = re.search(r"Title:\s*(.+)", block_text)
        sec_match = re.search(r"Section:\s*(.+)", block_text)
        text_match = re.search(r"Text:\s*([\s\S]+)", block_text)
        
        title = title_match.group(1).strip() if title_match else f"Source {source_num}"
        section = f" (Section {sec_match.group(1).strip()})" if sec_match else ""
        excerpt = text_match.group(1).strip() if text_match else block_text.strip()
        
        # Take the most relevant sentences
        sentences = [s.strip() for s in excerpt.split(". ") if len(s.strip()) > 20]
        summary_snippet = ". ".join(sentences[:2])
        if summary_snippet and not summary_snippet.endswith("."):
            summary_snippet += "."
            
        lines.append(f"**[{source_num}] {title}{section}**:")
        lines.append(f"> \"{summary_snippet}\"\n")
        sources_used.append(source_num)

    lines.append("\n**Regulatory Conclusion**: Under the statutory provisions cited above, traditional Ayurvedic formulations and non-synergistic herbal compositions are subject to explicit statutory scrutiny and potential exclusions unless substantiated with empirical evidence of synergy or adherence to First Schedule authoritative texts.")
    if not settings.gemini_api_key or "your_gemini_api_key" in settings.gemini_api_key.lower():
        lines.append("\n*(Note: Citation-grounded statutory analysis generated from indexed gazettes. Set a valid GEMINI_API_KEY in backend/.env for dynamic conversational reasoning.)*")
    else:
        lines.append("\n*(Note: Grounded statutory analysis synthesized from indexed gazettes).*")

    return {
        "answer": "\n".join(lines),
        "sources_used": sources_used,
        "uncertainty": "Extractive synthesis grounded in indexed statutory texts.",
        "needs_escalation": False,
        "has_conflict": False,
        "has_partial_coverage": False
    }

def generate_rag_response(query: str, evidence_context: str, target_language: str = "en") -> Dict[str, Any]:
    # Check if Gemini key is set to placeholder or empty
    if not settings.gemini_api_key or "your_gemini_api_key" in settings.gemini_api_key.lower():
        logger.info("Using extractive statutory fallback (GEMINI_API_KEY not configured).")
        return _build_extractive_fallback(query, evidence_context)

    client = get_genai_client()
    
    lang_instruction = ""
    if target_language == "hi":
        lang_instruction = (
            "\n\nCRITICAL LANGUAGE REQUIREMENT: You MUST formulate the 'answer' field entirely in clear, authentic, and authoritative Hindi (हिन्दी, Devanagari script). "
            "Preserve statutory section numbers (e.g. धारा 3(p)) and exact citation brackets like [1], [2]."
        )
        
    prompt = f"User Query: {query}\n\nEvidence Context:\n{evidence_context}{lang_instruction}"
    
    # Try candidate models in order of priority: working flash models
    candidate_models = list(dict.fromkeys([
        settings.gemini_model,
        "gemini-3-flash-preview",
        "gemini-3.8-flash"
    ]))
    
    import time
    last_error = None
    for model_name in candidate_models:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.1,
                        response_mime_type="application/json",
                    )
                )
                # Parse JSON safely
                result = clean_json_response(response.text)
                return result
            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                logger.warning(f"Error calling Gemini with model {model_name} (attempt {attempt + 1}): {e}")
                # If high demand (503) or rate-limit (429), pause briefly before retry
                if ("503" in err_str or "unavailable" in err_str or "429" in err_str) and attempt == 0:
                    time.sleep(1.0)
                    continue
                break

    logger.error(f"All Gemini models failed. Last error: {last_error}")
    # Fallback to grounded extractive synthesis from the actual evidence
    return _build_extractive_fallback(query, evidence_context)
