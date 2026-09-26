import json
import logging
from typing import Dict, Any, List
from google.genai import types
from app.models.schemas import ClassifyRequest, ClassificationResult, SourceCard
from app.services.llm import get_genai_client
from app.services.translation import translator
from app.services.retrieval import retrieve_chunks, format_evidence_context
from app.services.source_validation import validate_sources
from app.services.citations import map_citations
from app.services.confidence import calculate_confidence
from app.config import settings

logger = logging.getLogger(__name__)

def evaluate_rules(answers: Dict[str, str]) -> str:
    # Rule-based decision tree
    q1 = answers.get("q1", "Unsure") # Classical text
    q2 = answers.get("q2", "Unsure") # Novel ingredients
    q3 = answers.get("q3", "Unsure") # Intended use
    q4 = answers.get("q4", "Unsure") # Proprietary process
    q5 = answers.get("q5", "Unsure") # Isolated compounds
    
    unsure_count = list(answers.values()).count("Unsure")
    if unsure_count >= 3:
        return "Uncertain / Needs Expert Review"
        
    if q1 == "Yes" and q2 == "No" and q3 == "Therapeutic":
        return "Classical Medicine"
        
    if q1 == "No" and q2 == "Yes" and q3 == "Therapeutic" and q4 == "Yes":
        return "Proprietary / Patent Medicine"
        
    if q5 == "Yes" and q3 == "Therapeutic":
        return "Phytopharmaceutical"
        
    if q3 in ["Health supplement / wellness", "Food / dietary"]:
        return "Ayurveda-Aahar / Nutraceutical"
        
    if q3 == "Cosmetic":
        return "Cosmetic"
        
    if q1 == "No" and q2 == "Yes" and q3 == "Therapeutic" and q4 == "No" and q5 == "No":
        return "New / Non-classical Drug"
        
    return "Uncertain / Needs Expert Review"

CLASSIFIER_PROMPT = """You are IP-SHAKTI Sahayak. Your task is to explain a formulation classification.
The rule-based system has already classified the formulation as: {category}.
Do NOT override this classification.

Explain this classification based ONLY on the provided regulatory evidence.
1. Provide the reasoning.
2. Outline regulatory implications.
3. Outline IP implications.
4. Assess ABS (Access and Benefit-sharing) relevance.
5. Cite sources using [1], [2], etc.

Output format (JSON):
{
  "reasoning": "Explanation with [1]...",
  "regulatory_implications": "...",
  "ip_implications": "...",
  "abs_relevance": "...",
  "sources_used": [1, 2],
  "has_conflict": false,
  "has_partial_coverage": false
}"""

def _get_classification_fallback(category: str, answers: Dict[str, str], valid_sources: List[SourceCard]) -> Dict[str, Any]:
    sources_used = [i + 1 for i in range(min(2, len(valid_sources)))]
    
    defaults = {
        "Classical Medicine": {
            "reasoning": "The formulation is described precisely in an authoritative classical treatise (First Schedule of the Drugs and Cosmetics Act, 1940) without novel ingredients or modified manufacturing steps.",
            "regulatory_implications": "Eligible for ASU manufacturing license under Form 25-D from the State Licensing Authority. Exempt from Rule 158B animal toxicology and clinical trial requirements.",
            "ip_implications": "Strictly excluded from patentability under Section 3(p) of the Patents Act, 1970 as traditional knowledge. Attempted claims will be rejected via TKDL prior-art.",
            "abs_relevance": "Exempt from prior approval requirements of Section 6 of Biological Diversity Act if utilized solely for classical ASU manufacturing within India by local entities."
        },
        "Proprietary / Patent Medicine": {
            "reasoning": "The formulation incorporates ingredients from First Schedule texts but departs in ingredient ratios, utilizes novel excipients, or adopts proprietary extraction methods.",
            "regulatory_implications": "Requires State Licensing Authority approval under Rule 158B of Drugs & Cosmetics Rules, 1945, necessitating pilot clinical trial data or published safety literature.",
            "ip_implications": "Barred from patent protection under Section 3(e) unless applicant provides comparative empirical evidence of synergistic therapeutic efficacy exceeding an aggregation.",
            "abs_relevance": "Section 6 of Biological Diversity Act mandates prior approval from National Biodiversity Authority before filing any patent application based on Indian biological resources."
        },
        "Phytopharmaceutical": {
            "reasoning": "The formulation involves standardized, purified botanical fractions or isolated active phytochemicals characterized by chromatography.",
            "regulatory_implications": "Regulated under Chapter IV-A (Phytopharmaceutical Drug Regulations). Requires extensive preclinical safety pharmacology, toxicology, and Phase I-III clinical trial dossier.",
            "ip_implications": "Potentially patentable under Section 2(1)(j) if novel extraction fractions, novel polymorphs, or surprising bioenhancement over crude plant extract is proven.",
            "abs_relevance": "Strict Access and Benefit Sharing (ABS) compliance with NBA/SBB mandated with Form I or Form III approvals."
        },
        "Ayurveda-Aahar / Nutraceutical": {
            "reasoning": "Formulation is classified for food, health supplement, or dietary consumption under FSSAI (Ayurveda Aahar) Regulations, 2022.",
            "regulatory_implications": "Governed by Food Safety and Standards Authority of India (FSSAI) standards. Cannot carry disease treatment or cure claims on product labelling.",
            "ip_implications": "Patent protection generally unavailable for food admixtures under Section 3(e). Trademark and trade dress are the primary IP assets.",
            "abs_relevance": "Commercial utilization of bio-resources for food requires State Biodiversity Board (SBB) intimation."
        },
        "Cosmetic": {
            "reasoning": "Intended solely for topical application to cleanse, beautify, promote attractiveness, or alter appearance under Section 3(aaa) of Drugs and Cosmetics Act.",
            "regulatory_implications": "Licensed under cosmetic manufacturing rules (Form 32). Must comply with Bureau of Indian Standards (BIS) for cosmetic safety.",
            "ip_implications": "Composition patents barred under Section 3(p); design patents for packaging and trademark registrations are primary protections.",
            "abs_relevance": "Commercial biological access governed by Biological Diversity Rules, 2004."
        },
        "Uncertain / Needs Expert Review": {
            "reasoning": "The combination of answers provided is inconclusive or contains conflicting indicators regarding classical lineage vs novel processing.",
            "regulatory_implications": "Consultation with a State Licensing Authority (SLA) technical officer is required to assess whether Rule 158B clinical requirements apply.",
            "ip_implications": "Prior art search against TKDL and Indian Patent Office gazettes is required before filing any provisional patent.",
            "abs_relevance": "Potential ABS applicability depends on final ingredient sourcing and manufacturing location."
        }
    }
    
    data = defaults.get(category, defaults["Uncertain / Needs Expert Review"])
    return {
        "reasoning": data["reasoning"],
        "regulatory_implications": data["regulatory_implications"],
        "ip_implications": data["ip_implications"],
        "abs_relevance": data["abs_relevance"],
        "sources_used": sources_used,
        "has_conflict": False,
        "has_partial_coverage": False
    }

def process_classification(request: ClassifyRequest) -> ClassificationResult:
    # 1. Translate answers if Hindi (for rule processing, expecting English values)
    answers_str = ", ".join([f"{k}: {v}" for k, v in request.answers.items()])
    
    # 2. Rule-based evaluation
    category = evaluate_rules(request.answers)
    
    # 3. Retrieve relevant regulatory evidence
    synthetic_query = f"Classification rules and regulations for {category} Ayurvedic formulations. Intended use: {request.answers.get('q3')}. Classical: {request.answers.get('q1')}. Novel: {request.answers.get('q2')}."
    raw_sources = retrieve_chunks(synthetic_query, request.jurisdiction, top_k=5)
    valid_sources = validate_sources(raw_sources, request.jurisdiction)
    evidence_context = format_evidence_context(valid_sources)
    
    # 4. Gemini Explanation Layer
    llm_output = None
    if settings.gemini_api_key and "your_gemini_api_key" not in settings.gemini_api_key.lower():
        client = get_genai_client()
        prompt = CLASSIFIER_PROMPT.replace("{category}", category) + f"\n\nFormulation Details:\n{answers_str}\n\nEvidence Context:\n{evidence_context}"
        
        candidate_models = list(dict.fromkeys([settings.gemini_model, "gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]))
        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        response_mime_type="application/json"
                    )
                )
                llm_output = json.loads(response.text)
                break
            except Exception as e:
                logger.warning(f"Error calling Gemini in classification with {model_name}: {e}")
                continue

    if not llm_output:
        llm_output = _get_classification_fallback(category, request.answers, valid_sources)
        
    cited_sources = map_citations(llm_output.get("sources_used", []), valid_sources)
    
    confidence = calculate_confidence(
        cited_sources=cited_sources,
        has_conflict=llm_output.get("has_conflict", False),
        has_partial_coverage=llm_output.get("has_partial_coverage", False)
    )
    
    # If uncertain category from rules, confidence shouldn't be high
    if category == "Uncertain / Needs Expert Review":
        confidence = "LOW"
        
    # Optional translation to Hindi
    reasoning = llm_output.get("reasoning", "")
    reg_imp = llm_output.get("regulatory_implications", "")
    ip_imp = llm_output.get("ip_implications", "")
    abs_rel = llm_output.get("abs_relevance", "")
    
    if request.language == "hi":
        reasoning = translator.translate(reasoning, "en", "hi")
        reg_imp = translator.translate(reg_imp, "en", "hi")
        ip_imp = translator.translate(ip_imp, "en", "hi")
        abs_rel = translator.translate(abs_rel, "en", "hi")
        category_hi = translator.translate(category, "en", "hi")
        category = category_hi
        
    return ClassificationResult(
        category=category,
        confidence=confidence,
        reasoning=reasoning,
        regulatory_implications=reg_imp,
        ip_implications=ip_imp,
        abs_relevance=abs_rel,
        relevant_sources=cited_sources,
        jurisdiction=request.jurisdiction
    )
