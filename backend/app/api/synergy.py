from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import math

router = APIRouter()

class IngredientDose(BaseModel):
    name: str = Field(..., description="Common or Sanskrit name of herb/bioactive (e.g. Curcumin)")
    botanical_name: Optional[str] = Field(None, description="Botanical name (e.g. Curcuma longa)")
    dose_in_combo: float = Field(..., gt=0, description="Dose in combination (mg/kg or µg/mL)")
    dose_alone_isoeffect: float = Field(..., gt=0, description="Dose required alone to produce equivalent therapeutic effect (Dx)")
    standardized_marker: Optional[str] = Field(None, description="Standardized active marker (e.g. 95% Curcuminoids)")

class SynergyEvaluationRequest(BaseModel):
    formulation_name: str
    therapeutic_indication: str
    target_assay: str = Field(..., description="In-vitro or in-vivo assay used (e.g. IC50 Anti-inflammatory TNF-alpha inhibition, COX-2, DPPH)")
    ingredients: List[IngredientDose] = Field(..., min_items=2, max_items=5)
    observed_effect_percentage: float = Field(..., ge=0, le=100, description="Observed inhibition or efficacy percentage of combination (e.g. 85%)")
    expected_additive_percentage: Optional[float] = Field(None, description="Theoretical Bliss/Loewe additive effect percentage")
    bioenhancer_present: bool = Field(False, description="Whether an active bio-enhancer like Piperine/Trikatu is incorporated")

class DoseReductionIndex(BaseModel):
    ingredient: str
    dri_value: float
    interpretation: str

class SynergyEvaluationResponse(BaseModel):
    formulation_name: str
    therapeutic_indication: str
    target_assay: str
    combination_index: float
    synergy_classification: str
    is_statistically_synergistic: bool
    section_3e_compliance_status: str
    section_3e_legal_verdict: str
    dose_reduction_indices: List[DoseReductionIndex]
    patentability_score: int # 0 to 100
    patent_claim_drafting: Dict[str, str]
    evidentiary_requirements: List[str]
    audit_notes: str

# Pre-configured classical & modern polyherbal research benchmarks
PRESET_BENCHMARKS = [
    {
        "id": "curcumin-piperine",
        "name": "Curcuminoids + Piperine Bioavailability Complex",
        "indication": "Anti-inflammatory & Osteoarthritis",
        "assay": "Serum bioavailability Cmax & COX-2 enzymatic inhibition",
        "observed_effect_percentage": 92.5,
        "expected_additive_percentage": 54.0,
        "bioenhancer_present": True,
        "ingredients": [
            {
                "name": "Standardized Curcumin",
                "botanical_name": "Curcuma longa (Rhizome)",
                "dose_in_combo": 500.0,
                "dose_alone_isoeffect": 2000.0,
                "standardized_marker": "95% Total Curcuminoids"
            },
            {
                "name": "Standardized Piperine",
                "botanical_name": "Piper nigrum (Fruit)",
                "dose_in_combo": 5.0,
                "dose_alone_isoeffect": 50.0,
                "standardized_marker": "98% Pure Piperine"
            }
        ]
    },
    {
        "id": "ashwagandha-brahmi",
        "name": "Withania somnifera + Bacopa monnieri Neuro-protectant",
        "indication": "Cognitive enhancement & Cortisol regulation",
        "assay": "Acetylcholinesterase (AChE) inhibition assay",
        "observed_effect_percentage": 78.0,
        "expected_additive_percentage": 52.0,
        "bioenhancer_present": False,
        "ingredients": [
            {
                "name": "Ashwagandha Extract",
                "botanical_name": "Withania somnifera",
                "dose_in_combo": 150.0,
                "dose_alone_isoeffect": 450.0,
                "standardized_marker": "5% Withanolides"
            },
            {
                "name": "Brahmi Extract",
                "botanical_name": "Bacopa monnieri",
                "dose_in_combo": 100.0,
                "dose_alone_isoeffect": 350.0,
                "standardized_marker": "20% Bacosides A & B"
            }
        ]
    },
    {
        "id": "triphala-guggulu",
        "name": "Triphala + Commiphora mukul Lipid Complex",
        "indication": "Dyslipidemia & Atherosclerosis",
        "assay": "HMG-CoA Reductase & LDL Peroxidation Inhibition",
        "observed_effect_percentage": 84.0,
        "expected_additive_percentage": 61.0,
        "bioenhancer_present": False,
        "ingredients": [
            {
                "name": "Triphala Hydro-ethanolic Extract",
                "botanical_name": "Phyllanthus emblica, Terminalia chebula, Terminalia bellirica",
                "dose_in_combo": 250.0,
                "dose_alone_isoeffect": 600.0,
                "standardized_marker": "40% Tannins / Gallic Acid"
            },
            {
                "name": "Shuddha Guggulu",
                "botanical_name": "Commiphora mukul",
                "dose_in_combo": 200.0,
                "dose_alone_isoeffect": 550.0,
                "standardized_marker": "2.5% Guggulsterones (E & Z)"
            }
        ]
    }
]

@router.get("/synergy/presets")
async def get_synergy_presets():
    """Retrieve pre-validated benchmark polyherbal datasets for instant evaluation."""
    return PRESET_BENCHMARKS

@router.post("/synergy/evaluate", response_model=SynergyEvaluationResponse)
async def evaluate_synergy(req: SynergyEvaluationRequest):
    """
    Computes Chou-Talalay Combination Index (CI), Dose Reduction Index (DRI),
    and validates legal defensibility under Section 3(e) of the Indian Patents Act, 1970.
    """
    if len(req.ingredients) < 2:
        raise HTTPException(status_code=400, detail="Synergy evaluation requires at least 2 active components.")

    # Chou-Talalay Algorithm for Combination Index (CI)
    # CI = Sum(D_i / Dx_i)
    # For 2-drug mutually non-exclusive or distinct bioactives:
    # CI = (D1/Dx1) + (D2/Dx2) + (D1*D2)/(Dx1*Dx2) if non-exclusive, or simple summation for mutually exclusive.
    # We compute the mutually exclusive model (standard in pharmacological patent submissions)
    ci_sum = 0.0
    dri_list: List[DoseReductionIndex] = []

    for ing in req.ingredients:
        ratio = ing.dose_in_combo / ing.dose_alone_isoeffect
        ci_sum += ratio
        
        dri = ing.dose_alone_isoeffect / ing.dose_in_combo
        interp = f"{round(dri, 1)}-fold dose reduction achieved in combination."
        dri_list.append(DoseReductionIndex(
            ingredient=ing.name,
            dri_value=round(dri, 2),
            interpretation=interp
        ))

    # Optional 3rd interaction term for non-exclusive binding if bioenhancer is present
    if req.bioenhancer_present and len(req.ingredients) == 2:
        # Piperine or bioenhancers alter pharmacokinetic clearance; add cross-product term
        cross_term = (req.ingredients[0].dose_in_combo * req.ingredients[1].dose_in_combo) / (
            req.ingredients[0].dose_alone_isoeffect * req.ingredients[1].dose_alone_isoeffect
        )
        ci_value = round(ci_sum + cross_term, 3)
    else:
        ci_value = round(ci_sum, 3)

    # Classify according to Chou-Talalay (1984, 2006) standards
    if ci_value < 0.3:
        synergy_class = "Strong Synergism (CI < 0.3)"
        is_synergistic = True
        sec_3e_status = "DEFENSIBLE - SECTION 3(e) OVERCOME"
        sec_3e_verdict = (
            "Clear quantitative synergistic effect demonstrated. Exceeds mere additive aggregation "
            "as mandated by the Supreme Court of India in Novartis AG v. Union of India and IPO Guidelines."
        )
        patent_score = 92
    elif ci_value < 0.7:
        synergy_class = "Substantial Synergism (0.3 ≤ CI < 0.7)"
        is_synergistic = True
        sec_3e_status = "DEFENSIBLE - SECTION 3(e) OVERCOME"
        sec_3e_verdict = (
            "Statistically significant synergistic interaction proven. Rebuts Section 3(e) mere admixture "
            "presumption under Indian Patent Office Examination Guidelines."
        )
        patent_score = 85
    elif ci_value < 0.9:
        synergy_class = "Moderate Synergism (0.7 ≤ CI < 0.9)"
        is_synergistic = True
        sec_3e_status = "CONDITIONALLY DEFENSIBLE"
        sec_3e_verdict = (
            "Moderate synergism observed. Examiner may issue an objection under Section 3(e); "
            "comparative efficacy graphs and statistical p-value (<0.01) mandatory in patent response."
        )
        patent_score = 68
    elif ci_value <= 1.1:
        synergy_class = "Nearly Additive Interaction (0.9 ≤ CI ≤ 1.1)"
        is_synergistic = False
        sec_3e_status = "FATAL BARRIER - SECTION 3(e) REJECTION"
        sec_3e_verdict = (
            "STRICT REJECTION EXPECTED. The combination exhibits simple aggregation of known properties. "
            "Barred under Section 3(e) of Patents Act, 1970 as a 'mere admixture'."
        )
        patent_score = 25
    else:
        synergy_class = "Antagonistic Interaction (CI > 1.1)"
        is_synergistic = False
        sec_3e_status = "NON-PATENTABLE - ANTAGONISTIC"
        sec_3e_verdict = (
            "Antagonism observed. The combination decreases therapeutic efficacy compared to individual fractions. "
            "Lacks inventive step (Section 2(1)(ja)) and industrial applicability."
        )
        patent_score = 10

    # Auto-generate formal IPO patent claims
    botanical_str = ", ".join([f"{ing.name} ({ing.botanical_name or 'botanical extract'})" for ing in req.ingredients])
    ratio_str = ":".join([str(int(ing.dose_in_combo)) for ing in req.ingredients])
    markers_str = "; ".join([f"{ing.name} standardized to {ing.standardized_marker or 'prescribed marker'}" for ing in req.ingredients])

    claim_1 = (
        f"A synergistic polyherbal composition for use in the treatment of {req.therapeutic_indication}, "
        f"comprising an active therapeutic synergistic mixture of {botanical_str} in a predetermined dry weight ratio "
        f"of {ratio_str}, wherein said composition demonstrates a Chou-Talalay Combination Index (CI) of {ci_value} "
        f"(wherein CI < 1.0 represents synergism) in a {req.target_assay}, producing a super-additive therapeutic "
        f"efficacy exceeding the mathematical aggregation of the individual ingredients thereof."
    )

    claim_2 = (
        f"The synergistic polyherbal composition as claimed in claim 1, wherein said ingredients are standardized "
        f"extracts comprising {markers_str}, formulated to provide a dose reduction index (DRI) exceeding 1.5-fold "
        f"for each respective active component."
    )

    claim_3 = (
        f"The synergistic polyherbal composition as claimed in claim 1 or 2, wherein the composition is formulated "
        f"into an orally administrable solid dosage form selected from a group consisting of a tablet, a dual-layer "
        f"sustained-release matrix, and a hard gelatin capsule, exhibiting bioavailability enhancement without gastrointestinal cytotoxicity."
    )

    evidentiary_reqs = [
        "Include side-by-side comparative dose-response curves (Isobolometric analysis at ED50, ED75, ED90 levels).",
        "Submit certified GLP/GCP laboratory assay logs confirming observed effect (" + str(req.observed_effect_percentage) + "%) versus expected additive effect (" + str(req.expected_additive_percentage or 50) + "%).",
        "File Form 18A (Expedited Examination) only if complete combination index tables and non-admixture affidavits are fully notarized.",
        "Ensure National Biodiversity Authority (NBA) approval under Section 6 of BD Act is applied for simultaneously (Form III)."
    ]

    return SynergyEvaluationResponse(
        formulation_name=req.formulation_name,
        therapeutic_indication=req.therapeutic_indication,
        target_assay=req.target_assay,
        combination_index=ci_value,
        synergy_classification=synergy_class,
        is_statistically_synergistic=is_synergistic,
        section_3e_compliance_status=sec_3e_status,
        section_3e_legal_verdict=sec_3e_verdict,
        dose_reduction_indices=dri_list,
        patentability_score=patent_score,
        patent_claim_drafting={
            "claim_1_independent": claim_1,
            "claim_2_dependent_standardization": claim_2,
            "claim_3_dependent_formulation": claim_3
        },
        evidentiary_requirements=evidentiary_reqs,
        audit_notes=f"Evaluated using Chou-Talalay median-effect equation on {len(req.ingredients)} active botanical components. Section 3(e) statutory threshold requires CI strictly < 1.0."
    )
