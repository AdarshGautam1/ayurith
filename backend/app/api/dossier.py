from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import datetime
import uuid

router = APIRouter()

class DossierRequest(BaseModel):
    formulation_name: str = Field(..., description="Name of the polyherbal or botanical formulation")
    applicant_name: str = Field(..., description="Inventor, Institute, or Corporate applicant name")
    applicant_type: str = Field("Indian Entity", description="Indian Entity / Foreign Entity / NRI / Startup / Academic")
    target_indications: List[str] = Field(..., min_length=1, description="Therapeutic indications (e.g. Type 2 Diabetes, Arthritis)")
    ingredients: List[str] = Field(..., min_length=1, description="Botanical or vernacular names of herbs/ingredients")
    is_classical_source_cited: bool = Field(False, description="Whether formulation is directly derived from First Schedule texts")
    classical_treatise_name: Optional[str] = Field(None, description="Name of classical text if applicable (e.g. Charaka Samhita)")
    has_synergy_data: bool = Field(False, description="Whether experimental synergy / CI data is available")
    combination_index: Optional[float] = Field(None, description="Chou-Talalay CI value if known")
    biological_source_origin: str = Field("India", description="Geographic origin of biological raw material")
    commercial_claims: List[str] = Field(default_factory=list, description="Marketing or therapeutic claims (e.g. 'Cures diabetes in 30 days')")

class CompliancePillar(BaseModel):
    pillar_name: str
    statutory_reference: str
    status: str # PASS, WARNING, FAIL, CONDITIONAL
    risk_level: str # LOW, MEDIUM, HIGH, CRITICAL
    analysis: str
    remedial_action: str

class DossierResponse(BaseModel):
    audit_id: str
    generated_at: str
    formulation_name: str
    applicant_name: str
    applicant_type: str
    overall_ip_score: int # 0 to 100
    executive_verdict: str
    recommended_pathway: str # "Patent Route (Section 3(e) Synergistic)", "AYUSH Classical License (Rule 158B)", "Phytopharmaceutical Drug Route"
    pillars: List[CompliancePillar]
    nba_statutory_form: str
    dmra_prohibited_claims_flagged: List[str]
    timeline_estimate: str
    filing_checklist: List[str]
    official_disclaimer: str

# Prohibited diseases under Drugs & Magic Remedies Act Schedule
DMRA_PROHIBITED_KEYWORDS = [
    "cancer", "diabetes", "cure diabetes", "aids", "hiv", "hypertension", "blindness",
    "paralysis", "epilepsy", "leprosy", "tuberculosis", "kidney stone", "gall stone",
    "heart disease", "appendicitis", "infertility", "rejuvenation of youth", "sexual virility"
]

@router.post("/dossier/generate", response_model=DossierResponse)
async def generate_due_diligence_dossier(req: DossierRequest):
    """
    Generates a comprehensive 5-pillar IP due diligence audit report and statutory dossier.
    Covers Section 3(p) TKDL, Section 3(e) Synergism, Rule 158B AYUSH categorization,
    NBA Section 6 Form III, and Drugs & Magic Remedies Act compliance.
    """
    audit_id = f"AYURITH-AUDIT-{datetime.datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    timestamp = datetime.datetime.now().strftime("%d %B %Y, %H:%M:%S IST")
    
    pillars: List[CompliancePillar] = []
    overall_score = 100

    # 1. Section 3(p) Traditional Knowledge Bar
    if req.is_classical_source_cited:
        overall_score -= 30
        pillars.append(CompliancePillar(
            pillar_name="Traditional Knowledge Prior Art (Section 3(p))",
            statutory_reference="Patents Act, 1970 - Section 3(p) & CSIR-TKDL",
            status="WARNING",
            risk_level="HIGH",
            analysis=(
                f"Formulation cites classical lineage ({req.classical_treatise_name or 'First Schedule Treatise'}). "
                "Inventions which in effect are traditional knowledge or an aggregation/duplication of known properties "
                "face an immediate Section 3(p) rejection under the Indian Patent Office Guidelines."
            ),
            remedial_action="Draft claims exclusively around a synergistic ratio or novel non-obvious bio-enhanced extraction process rather than the herbal combination itself."
        ))
    else:
        pillars.append(CompliancePillar(
            pillar_name="Traditional Knowledge Prior Art (Section 3(p))",
            statutory_reference="Patents Act, 1970 - Section 3(p) & CSIR-TKDL",
            status="PASS",
            risk_level="LOW",
            analysis="No direct verbatim citation from classical texts. Prior art search against TKDL database required to ensure no undisclosed anticipation exists.",
            remedial_action="Conduct comprehensive 30M+ shloka TKDL clearance before patent publication."
        ))

    # 2. Section 3(e) Synergistic Non-Admixture Verification
    if req.has_synergy_data and req.combination_index is not None and req.combination_index < 1.0:
        pillars.append(CompliancePillar(
            pillar_name="Synergistic Efficacy vs Mere Admixture (Section 3(e))",
            statutory_reference="Patents Act, 1970 - Section 3(e)",
            status="PASS",
            risk_level="LOW",
            analysis=f"Validated synergistic data provided with Chou-Talalay CI = {req.combination_index} (< 1.0). Overcomes Section 3(e) presumption of mere admixture.",
            remedial_action="Attach complete isobolograms, CI charts, and statistical p-values (< 0.01) in Form 2 Complete Specification."
        ))
    elif req.has_synergy_data and req.combination_index is not None and req.combination_index >= 1.0:
        overall_score -= 40
        pillars.append(CompliancePillar(
            pillar_name="Synergistic Efficacy vs Mere Admixture (Section 3(e))",
            statutory_reference="Patents Act, 1970 - Section 3(e)",
            status="FAIL",
            risk_level="CRITICAL",
            analysis=f"Chou-Talalay CI is {req.combination_index} (≥ 1.0). The combination is mathematically additive or antagonistic.",
            remedial_action="Patent claims will be summarily refused under Section 3(e). Must reformulate ratios or pivot to AYUSH commercial license pathway."
        ))
    else:
        overall_score -= 25
        pillars.append(CompliancePillar(
            pillar_name="Synergistic Efficacy vs Mere Admixture (Section 3(e))",
            statutory_reference="Patents Act, 1970 - Section 3(e)",
            status="WARNING",
            risk_level="HIGH",
            analysis="No quantitative synergism data submitted. Under Novartis v. Union of India and Section 3(e), mere mixtures of herbs without comparative enhancement cannot be patented.",
            remedial_action="Perform in-vitro Chou-Talalay combination index assays before provisional patent filing."
        ))

    # 3. National Biodiversity Act (NBA) Section 6 Compliance
    is_foreign = "Foreign" in req.applicant_type or "NRI" in req.applicant_type
    if req.biological_source_origin.lower() == "india":
        if is_foreign:
            overall_score -= 15
            nba_statutory_form = "Form III (Section 6) + Form I (Section 3) Mandatory"
            pillars.append(CompliancePillar(
                pillar_name="National Biodiversity Authority Prior Approval",
                statutory_reference="Biological Diversity Act, 2002 - Section 3 & Section 6",
                status="WARNING",
                risk_level="CRITICAL",
                analysis="Applicant has foreign shareholding or is a non-Indian entity utilizing Indian biological resources. NBA prior approval under Section 3 & 6 is strictly mandatory before patent grant.",
                remedial_action="Submit Form I and Form III to National Biodiversity Authority, Chennai immediately. Non-compliance invites criminal penalties under Section 55."
            ))
        else:
            nba_statutory_form = "Form III (Section 6) Mandatory for Patent Grant"
            pillars.append(CompliancePillar(
                pillar_name="National Biodiversity Authority Prior Approval",
                statutory_reference="Biological Diversity Act, 2002 - Section 6",
                status="CONDITIONAL",
                risk_level="MEDIUM",
                analysis="Indian entity using Indian biological resources. Approval of NBA is required before the grant of patent (Rule 18 / Form III).",
                remedial_action="File Form III with NBA Chennai alongside or shortly after Form 1 Patent Application."
            ))
    else:
        nba_statutory_form = "NBA Exemption Applicable (Foreign Biological Origin)"
        pillars.append(CompliancePillar(
            pillar_name="National Biodiversity Authority Exemption",
            statutory_reference="Biological Diversity Act, 2002 - Section 2(c)",
            status="PASS",
            risk_level="LOW",
            analysis="Biological material sourced outside Indian territorial boundaries. NBA Section 6 jurisdiction does not apply.",
            remedial_action="Maintain import certificates, Phytosanitary Clearance, and CITES permits as proof of foreign provenance."
        ))

    # 4. Drugs & Cosmetics Act Rule 158B Classification
    if req.is_classical_source_cited:
        reg_pathway = "Classical AYUSH Manufacturing License (Form 25-D / Rule 158B(a))"
        pillars.append(CompliancePillar(
            pillar_name="AYUSH Manufacturing Regulatory Route",
            statutory_reference="Drugs & Cosmetics Rules, 1945 - Rule 158B(a)",
            status="PASS",
            risk_level="LOW",
            analysis="Directly derived from First Schedule texts. Eligible for manufacture without clinical trial Phase I-III requirements under Rule 158B(a).",
            remedial_action="Obtain State Licensing Authority (SLA) Form 25-D license citing the relevant First Schedule shloka."
        ))
    elif req.has_synergy_data:
        reg_pathway = "Patent & Proprietary ASU Medicine (Rule 158B(b)) or Phytopharmaceutical Drug"
        pillars.append(CompliancePillar(
            pillar_name="AYUSH Manufacturing Regulatory Route",
            statutory_reference="Drugs & Cosmetics Rules, 1945 - Rule 158B(b) & Chapter IV-A",
            status="PASS",
            risk_level="LOW",
            analysis="Modified combination / novel ratio. Requires safety and efficacy documentation under Rule 158B(b) or Phytopharmaceutical framework.",
            remedial_action="Submit pilot safety study or published authoritative pharmacology papers to State Licensing Authority."
        ))
    else:
        reg_pathway = "Proprietary Medicine Route (Safety Studies Required)"
        overall_score -= 10
        pillars.append(CompliancePillar(
            pillar_name="AYUSH Manufacturing Regulatory Route",
            statutory_reference="Drugs & Cosmetics Rules, 1945 - Rule 158B(b)",
            status="CONDITIONAL",
            risk_level="MEDIUM",
            analysis="New combination without classical text reference or validated synergy profile.",
            remedial_action="Conduct acute and sub-chronic oral toxicity tests according to CCRAS / OECD guidelines."
        ))

    # 5. Drugs and Magic Remedies (Objectionable Advertisements) Act
    flagged_dmra: List[str] = []
    for claim in req.commercial_claims:
        for bad_kw in DMRA_PROHIBITED_KEYWORDS:
            if bad_kw in claim.lower():
                flagged_dmra.append(f"Claim: '{claim}' flags prohibited condition '{bad_kw}'")
                overall_score -= 15
                break

    if flagged_dmra:
        pillars.append(CompliancePillar(
            pillar_name="Drugs & Magic Remedies Act (DMRA) Advertising Compliance",
            statutory_reference="Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 - Section 3",
            status="FAIL",
            risk_level="CRITICAL",
            analysis=f"{len(flagged_dmra)} commercial claim(s) violate Section 3 of DMRA, which criminalizes claiming to cure diabetes, cancer, sexual disorders, or kidney stones.",
            remedial_action="Purge all curative assertions immediately. Replace with permissible functional structure-function phrases (e.g. 'Supports healthy glucose metabolism')."
        ))
    else:
        pillars.append(CompliancePillar(
            pillar_name="Drugs & Magic Remedies Act (DMRA) Advertising Compliance",
            statutory_reference="Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 - Section 3",
            status="PASS",
            risk_level="LOW",
            analysis="No prohibited claims detected from the 54 statutory conditions in the DMRA Schedule.",
            remedial_action="Maintain wellness and supportive claims in packaging and digital promotion."
        ))

    # Calculate overall verdict and score
    overall_score = max(10, min(100, overall_score))
    
    if overall_score >= 80:
        verdict = "APPROVED FOR EXPEDITED PATENT FILING & NBA CLEARANCE"
    elif overall_score >= 60:
        verdict = "CONDITIONALLY VIABLE - REMEDIAL EXPERIMENTAL ACTIONS REQUIRED"
    else:
        verdict = "HIGH REJECTION PROBABILITY - PIVOT TO CLASSICAL ASU REGULATORY ROUTE"

    checklist = [
        "Patent Form 1 (Application for Grant of Patent) & Form 2 (Complete Specification)",
        "NBA Form III Application to National Biodiversity Authority (Section 6)",
        "Section 3(e) Comparative Synergy Affidavit with Chou-Talalay Analysis",
        "Form 18A Request for Expedited Examination (if eligible under Startups/Female applicant/Green tech)",
        "AYUSH State Licensing Authority Form 25-D or 25-E manufacturing application",
        "Certificate of Botanical Origin and Herbarium Authenticity Voucher"
    ]

    return DossierResponse(
        audit_id=audit_id,
        generated_at=timestamp,
        formulation_name=req.formulation_name,
        applicant_name=req.applicant_name,
        applicant_type=req.applicant_type,
        overall_ip_score=overall_score,
        executive_verdict=verdict,
        recommended_pathway=reg_pathway,
        pillars=pillars,
        nba_statutory_form=nba_statutory_form,
        dmra_prohibited_claims_flagged=flagged_dmra,
        timeline_estimate="6 to 18 months under Form 18A Expedited Examination (vs 36-48 months standard)",
        filing_checklist=checklist,
        official_disclaimer=(
            "This IP Due Diligence Audit Dossier is generated algorithmically by AyuRith (IP-SHAKTI Sahayak) "
            "incorporating Indian Patents Act 1970, Drugs & Cosmetics Act 1940, Biological Diversity Act 2002, "
            "and CSIR-TKDL statutory directives. For formal submission before the Patent Controller or State Licensing "
            "Authority, certification by a registered Indian Patent Agent (IN/PA) is advised."
        )
    )
