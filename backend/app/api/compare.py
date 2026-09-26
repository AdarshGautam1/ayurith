from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import datetime
import uuid

router = APIRouter()

class FormulationIngredient(BaseModel):
    name: str = Field(..., description="Common or Sanskrit name of herb/substance")
    botanical_name: Optional[str] = Field(None, description="Binomial botanical name")
    part_used: Optional[str] = Field(None, description="Part of plant (e.g. Root, Fruit, Bark)")
    percentage_or_parts: float = Field(..., description="Percentage (%) or relative parts in formulation")
    standardized_marker: Optional[str] = Field(None, description="Active chemical biomarker (e.g. 5% Withanolides, 95% Curcuminoids)")

class FormulationProfile(BaseModel):
    formulation_id: str = Field(..., description="Unique slug or identifier (e.g. A, B, C)")
    formulation_name: str = Field(..., description="Name of the formulation")
    formulation_type: str = Field(..., description="'Classical Ayurvedic (First Schedule)', 'Proprietary ASU Product', 'Patented / NDDS Formulation'")
    dosage_form: str = Field(..., description="Churna, Kwatha, Vati/Tablet, Capsule, Liquid Extract, Nano-emulsion")
    reference_source: Optional[str] = Field(None, description="Treatise (e.g. Charaka Samhita) or Patent No / Brand name")
    ingredients: List[FormulationIngredient] = Field(..., min_items=1)

class CompareRequest(BaseModel):
    title: str = Field("Polyherbal Formulation Comparative Audit", description="Audit or project title")
    formulations: List[FormulationProfile] = Field(..., min_items=2, max_items=3, description="2 or 3 formulations to compare")

class IngredientDiffRow(BaseModel):
    ingredient_name: str
    botanical_name: str
    part_used: str
    presence_matrix: Dict[str, bool]  # formulation_id -> bool
    proportions: Dict[str, Optional[float]]  # formulation_id -> percentage or parts
    standardized_markers: Dict[str, Optional[str]]  # formulation_id -> marker info
    concordance_type: str  # "Universal (Common to all)", "Partial Overlap", "Unique Substitution"

class RegulatoryDivergenceItem(BaseModel):
    formulation_id: str
    formulation_name: str
    formulation_type: str
    ayush_licensing_pathway: str  # Rule 158B Classical vs Rule 158B(iv) Proprietary vs New Drug
    clinical_trial_requirement: str  # Exempt, Safety/Efficacy Study, Full Phase I-III
    patentability_status: str  # Barred by Sec 3(p), Requires Sec 3(e) proof, Patentable NDDS
    tkdl_status: str  # Direct match in TKDL, Modified from TKDL, Non-traditional
    infringement_or_objection_risk: str  # Low, Moderate, High

class CompareResponse(BaseModel):
    comparison_id: str
    generated_at: str
    title: str
    formulations_overview: List[Dict[str, Any]]
    ingredient_concordance_matrix: List[IngredientDiffRow]
    total_unique_ingredients: int
    common_core_ingredients: List[str]
    dosage_and_bioavailability_diff: Dict[str, Any]
    regulatory_divergence_matrix: List[RegulatoryDivergenceItem]
    statutory_verdict_summary: str
    disclaimer: str

# Curated Presets for Rapid Comparison
PRESET_COMPARISONS = [
    {
        "id": "triphala-three-way",
        "title": "Triphala: Classical Churna vs Commercial Extract vs Patented Nano-Phospholipid Formulation",
        "formulations": [
            {
                "formulation_id": "form-a",
                "formulation_name": "Classical Triphala Churna (Charaka Samhita)",
                "formulation_type": "Classical Ayurvedic (First Schedule)",
                "dosage_form": "Churna (Pulverized Crude Herb Powder)",
                "reference_source": "Charaka Samhita Chikitsasthana 1:2 & AFI Part-I",
                "ingredients": [
                    {
                        "name": "Haritaki",
                        "botanical_name": "Terminalia chebula",
                        "part_used": "Dried Fruit Pericarp",
                        "percentage_or_parts": 33.33,
                        "standardized_marker": "Unstandardized (Crude Tannins ~25-30%)"
                    },
                    {
                        "name": "Bibhitaki",
                        "botanical_name": "Terminalia bellirica",
                        "part_used": "Dried Fruit Pericarp",
                        "percentage_or_parts": 33.33,
                        "standardized_marker": "Unstandardized (Crude Tannins ~20-25%)"
                    },
                    {
                        "name": "Amalaki",
                        "botanical_name": "Phyllanthus emblica",
                        "part_used": "Dried Fruit Pericarp",
                        "percentage_or_parts": 33.34,
                        "standardized_marker": "Natural Vitamin C & Gallic Acid"
                    }
                ]
            },
            {
                "formulation_id": "form-b",
                "formulation_name": "Commercial Triphala Standardized Tablet",
                "formulation_type": "Proprietary ASU Product",
                "dosage_form": "Compressed Tablet (Hydro-alcoholic Extract)",
                "reference_source": "ASU Proprietary Brand (Market Sample)",
                "ingredients": [
                    {
                        "name": "Haritaki Extract",
                        "botanical_name": "Terminalia chebula",
                        "part_used": "Fruit Extract",
                        "percentage_or_parts": 30.0,
                        "standardized_marker": "50% Total Tannins (HPLC)"
                    },
                    {
                        "name": "Bibhitaki Extract",
                        "botanical_name": "Terminalia bellirica",
                        "part_used": "Fruit Extract",
                        "percentage_or_parts": 30.0,
                        "standardized_marker": "40% Gallic & Chebulic Acid"
                    },
                    {
                        "name": "Amalaki Extract",
                        "botanical_name": "Phyllanthus emblica",
                        "part_used": "Fruit Extract",
                        "percentage_or_parts": 30.0,
                        "standardized_marker": "45% Tannins & Polyphenols"
                    },
                    {
                        "name": "Piperine (Bio-enhancer)",
                        "botanical_name": "Piper nigrum",
                        "part_used": "Fruit Isolate",
                        "percentage_or_parts": 10.0,
                        "standardized_marker": "95% Pure Piperine"
                    }
                ]
            },
            {
                "formulation_id": "form-c",
                "formulation_name": "Nano-Liposomal Triphala Polyphenolic Complex",
                "formulation_type": "Patented / NDDS Formulation",
                "dosage_form": "Sub-80nm Liposomal Liquid Dispersion",
                "reference_source": "Patent Application IN 2022/410582",
                "ingredients": [
                    {
                        "name": "Purified Triphala Polyphenols",
                        "botanical_name": "Terminalia chebula + T. bellirica + P. emblica",
                        "part_used": "Chromatographic Fraction",
                        "percentage_or_parts": 40.0,
                        "standardized_marker": ">85% Chebulinic & Ellagic Acid"
                    },
                    {
                        "name": "Phosphatidylcholine Carrier",
                        "botanical_name": "Glycine max (Soy lecithin)",
                        "part_used": "Phospholipid Fraction",
                        "percentage_or_parts": 50.0,
                        "standardized_marker": "90% Pure Phosphatidylcholine"
                    },
                    {
                        "name": "Tocopherol Excipient",
                        "botanical_name": "Synthetic / Botanical D-Alpha-Tocopherol",
                        "part_used": "Lipid Antioxidant",
                        "percentage_or_parts": 10.0,
                        "standardized_marker": "USP Grade Vitamin E"
                    }
                ]
            }
        ]
    },
    {
        "id": "trikatu-classical-vs-bioenhancer",
        "title": "Trikatu: Classical Digestant vs Modern Bio-Availability Enhancer Formulation",
        "formulations": [
            {
                "formulation_id": "form-a",
                "formulation_name": "Classical Trikatu Churna",
                "formulation_type": "Classical Ayurvedic (First Schedule)",
                "dosage_form": "Crude Churna (Powder)",
                "reference_source": "Sharangadhara Samhita Madhyama Khanda & AFI",
                "ingredients": [
                    {
                        "name": "Maricha (Black Pepper)",
                        "botanical_name": "Piper nigrum",
                        "part_used": "Dried Fruit",
                        "percentage_or_parts": 33.33,
                        "standardized_marker": "Unstandardized (Crude Piperine 3-5%)"
                    },
                    {
                        "name": "Pippali (Long Pepper)",
                        "botanical_name": "Piper longum",
                        "part_used": "Dried Fruit Spike",
                        "percentage_or_parts": 33.33,
                        "standardized_marker": "Unstandardized (Crude Piperlongumine)"
                    },
                    {
                        "name": "Shunthi (Dry Ginger)",
                        "botanical_name": "Zingiber officinale",
                        "part_used": "Rhizome",
                        "percentage_or_parts": 33.34,
                        "standardized_marker": "Unstandardized (Crude Gingerols 1-2%)"
                    }
                ]
            },
            {
                "formulation_id": "form-b",
                "formulation_name": "BioShield-P: Standardized Thermogenic Bioenhancer",
                "formulation_type": "Proprietary ASU Product",
                "dosage_form": "Veggie Capsule",
                "reference_source": "Proprietary Nutraceutical Specification",
                "ingredients": [
                    {
                        "name": "Purified Piperine Extract",
                        "botanical_name": "Piper nigrum",
                        "part_used": "Oleoresin Isolate",
                        "percentage_or_parts": 70.0,
                        "standardized_marker": "98% Pure Piperine HPLC"
                    },
                    {
                        "name": "Standardized Ginger Extract",
                        "botanical_name": "Zingiber officinale",
                        "part_used": "Supercritical CO2 Extract",
                        "percentage_or_parts": 30.0,
                        "standardized_marker": "20% Total Gingerols & Shogaols"
                    }
                ]
            }
        ]
    }
]

@router.get("/compare/presets")
async def get_compare_presets():
    """Returns curated preset formulations for polyherbal comparison diffs."""
    return PRESET_COMPARISONS

@router.post("/compare/formulations", response_model=CompareResponse)
async def compare_polyherbal_formulations(req: CompareRequest):
    """
    Executes a multi-parameter formulation diff:
    1. Cross-formulation ingredient concordance matrix (Universal vs Unique).
    2. Standardized marker concentration variance.
    3. Regulatory divergence (Rule 158B Safe Harbor vs Proprietary ASU vs Patent Section 3).
    """
    comp_id = f"DIFF-{datetime.datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

    form_ids = [f.formulation_id for f in req.formulations]
    form_map = {f.formulation_id: f for f in req.formulations}

    # Build unique ingredient dictionary across all formulations
    # Key = simplified lowercase name / botanical name
    ingredient_dict: Dict[str, Dict[str, Any]] = {}

    def normalize_name(ing_name: str, bot_name: Optional[str]) -> str:
        # Simplify common names like "Haritaki Extract" -> "Haritaki"
        n = ing_name.lower()
        for suffix in [" extract", " powder", " pericarp", " dried", " purified", " standardized"]:
            n = n.replace(suffix, "")
        return n.strip()

    for form in req.formulations:
        for ing in form.ingredients:
            norm_key = normalize_name(ing.name, ing.botanical_name)
            if norm_key not in ingredient_dict:
                ingredient_dict[norm_key] = {
                    "primary_name": ing.name,
                    "botanical_name": ing.botanical_name or "Not Specified",
                    "part_used": ing.part_used or "Plant part",
                    "form_data": {}
                }
            # Record presence in this formulation
            ingredient_dict[norm_key]["form_data"][form.formulation_id] = {
                "percentage": ing.percentage_or_parts,
                "marker": ing.standardized_marker or "Unstandardized",
                "raw_name": ing.name
            }

    # Build concordance rows
    concordance_rows: List[IngredientDiffRow] = []
    common_core_ingredients = []

    for key, data in ingredient_dict.items():
        presence_matrix = {}
        proportions = {}
        markers = {}

        present_count = 0
        for fid in form_ids:
            if fid in data["form_data"]:
                presence_matrix[fid] = True
                proportions[fid] = data["form_data"][fid]["percentage"]
                markers[fid] = data["form_data"][fid]["marker"]
                present_count += 1
            else:
                presence_matrix[fid] = False
                proportions[fid] = None
                markers[fid] = None

        if present_count == len(form_ids):
            concordance_type = "Universal Core Ingredient"
            common_core_ingredients.append(data["primary_name"])
        elif present_count > 1:
            concordance_type = "Shared / Partial Overlap"
        else:
            concordance_type = "Unique Novel Component"

        concordance_rows.append(IngredientDiffRow(
            ingredient_name=data["primary_name"],
            botanical_name=data["botanical_name"],
            part_used=data["part_used"],
            presence_matrix=presence_matrix,
            proportions=proportions,
            standardized_markers=markers,
            concordance_type=concordance_type
        ))

    # Sort concordance rows so universal ingredients appear first
    concordance_rows.sort(key=lambda x: (x.concordance_type != "Universal Core Ingredient", x.ingredient_name))

    # Regulatory Divergence Matrix
    reg_divergence: List[RegulatoryDivergenceItem] = []
    for form in req.formulations:
        is_classical = "Classical" in form.formulation_type or "First Schedule" in form.formulation_type
        is_ndds = "Patented" in form.formulation_type or "NDDS" in form.formulation_type or "Nano" in form.dosage_form

        if is_classical:
            pathway = "AYUSH Classical Drug License (Drugs & Cosmetics Rules, 1945, Rule 158B)"
            clinical = "EXEMPT from safety and efficacy clinical trials (statutory safe harbor under First Schedule authoritative texts)"
            patent_status = "BARRED under Section 3(p) of Patents Act 1970 (Direct traditional knowledge public anticipation)"
            tkdl_status = "Direct verbatim citation in TKDL; public domain classical formulation"
            risk = "LOW (for manufacturing under AYUSH); ABSOLUTE BARRIER (for patent claims)"
        elif is_ndds:
            pathway = "Patent Route (IPO/USPTO/EPO) or Phytopharmaceutical Drug Approval (Schedule Y / New Drugs Rules 2019)"
            clinical = "MANDATORY preclinical toxicology & Phase I-III clinical evaluation if marketed as Phytopharmaceutical"
            patent_status = "HIGH PATENTABILITY (Novel physical delivery carrier overcomes Section 3(p) and 3(d) Novartis hurdle)"
            tkdl_status = "Non-traditional technological advancement; bioactives known but delivery matrix novel"
            risk = "HIGH PATENT OFFICE SCRUTINY under Section 3(d) & 3(e); Requires NBA Section 6 Form III clearance"
        else: # Proprietary ASU
            pathway = "Ayurvedic Proprietary Medicine (Rule 158B(iv) of Drugs & Cosmetics Rules)"
            clinical = "Requires published safety literature or pilot clinical safety study as per Rule 158B guidelines"
            patent_status = "HIGH RISK under Section 3(e) (Admixture objection) unless synergistic Chou-Talalay CI < 1.0 is proven"
            tkdl_status = "Modified traditional formulation; components in TKDL but specific ratio altered"
            risk = "MODERATE TO HIGH; vulnerable to Section 3(e) / 3(p) objections without experimental synergy data"

        reg_divergence.append(RegulatoryDivergenceItem(
            formulation_id=form.formulation_id,
            formulation_name=form.formulation_name,
            formulation_type=form.formulation_type,
            ayush_licensing_pathway=pathway,
            clinical_trial_requirement=clinical,
            patentability_status=patent_status,
            tkdl_status=tkdl_status,
            infringement_or_objection_risk=risk
        ))

    # Dosage and Bioavailability Summary
    dosage_diff = {
        "summary": "Comparison illustrates transition from whole crude plant matrices (unstandardized) to concentrated extracts and phospholipid nano-carriers.",
        "bioavailability_gradient": [
            {"formulation_id": f.formulation_id, "formulation_name": f.formulation_name, "dosage_form": f.dosage_form}
            for f in req.formulations
        ],
        "analytical_observation": (
            f"Comparison contains {len(req.formulations)} formulations across {len(ingredient_dict)} unique botanical entities. "
            f"{len(common_core_ingredients)} core botanical(s) are shared across all formulations: {', '.join(common_core_ingredients) if common_core_ingredients else 'None'}."
        )
    }

    statutory_verdict = (
        "Statutory Analysis: Moving from Classical to Proprietary or NDDS introduces a trade-off between regulatory speed and IP exclusivity. "
        "Classical formulations enjoy complete clinical trial exemption under Rule 158B but zero patent protection (Section 3(p)). "
        "Proprietary and NDDS formulations unlock patent monopolies and brand exclusivity, but trigger mandatory Section 3(e) synergy requirements, "
        "NBA Section 6 Form III statutory filings, and clinical safety substantiation."
    )

    disclaimer = (
        "This comparative diff report is generated for intellectual property, phytochemistry, and regulatory strategy analysis. "
        "Licensing authorities (State AYUSH Licensing Authority / CDSCO) and the Indian Patent Office may require additional chemical markers "
        "and stability data pursuant to the Ayurvedic Pharmacopoeia of India (API)."
    )

    return CompareResponse(
        comparison_id=comp_id,
        generated_at=now_str,
        title=req.title,
        formulations_overview=[
            {
                "id": f.formulation_id,
                "name": f.formulation_name,
                "type": f.formulation_type,
                "dosage_form": f.dosage_form,
                "source": f.reference_source or "Not specified",
                "ingredient_count": len(f.ingredients)
            }
            for f in req.formulations
        ],
        ingredient_concordance_matrix=concordance_rows,
        total_unique_ingredients=len(ingredient_dict),
        common_core_ingredients=common_core_ingredients,
        dosage_and_bioavailability_diff=dosage_diff,
        regulatory_divergence_matrix=reg_divergence,
        statutory_verdict_summary=statutory_verdict,
        disclaimer=disclaimer
    )
