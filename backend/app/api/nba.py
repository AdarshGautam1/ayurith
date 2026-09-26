from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import datetime
import uuid

router = APIRouter()

class BiologicalResourceItem(BaseModel):
    vernacular_name: str = Field(..., description="Vernacular / Ayurvedic name (e.g. Ashwagandha, Turmeric)")
    botanical_name: str = Field(..., description="Botanical binomial nomenclature (e.g. Withania somnifera, Curcuma longa)")
    part_used: str = Field(..., description="Plant part used (e.g. Root, Rhizome, Whole plant, Fruit)")
    sourcing_location: str = Field(..., description="District and State where raw material is procured (e.g. Neemuch, Madhya Pradesh)")
    procurement_source: str = Field(..., description="Mode: 'Direct Cultivation / Farmer Procurement', 'Wild Harvest / Forest Produce', 'Registered Trader / Mandi'")
    associated_traditional_knowledge: bool = Field(False, description="Whether traditional knowledge of local tribal/rural community is utilized")

class ABSCalculationRequest(BaseModel):
    applicant_category: str = Field(
        ...,
        description="'Indian Individual / Proprietorship', 'Indian Registered Company (No Foreign Equity)', 'Foreign Entity / NRI / Indian Co with Foreign Shareholding (Section 3(2))'"
    )
    annual_ex_factory_sales_inr: float = Field(0.0, ge=0, description="Annual gross ex-factory sales value in INR")
    royalty_received_inr: Optional[float] = Field(0.0, ge=0, description="Royalty or upfront assignment consideration if IP is licensed/transferred")
    commercial_mode: str = Field("Direct Product Sales", description="'Direct Product Sales' or 'IP Licensing / Commercial Transfer'")
    raw_material_type: str = Field("Cultivated Agricultural", description="'Cultivated Agricultural' or 'Wild / Forest Harvest'")

class ABSCalculationResponse(BaseModel):
    calculation_id: str
    applicant_category: str
    is_section_3_2_entity: bool
    annual_turnover_inr: float
    applicable_tier: str
    abs_percentage: float
    annual_abs_payable_inr: float
    bmc_community_share_inr: float  # 95% to local Biodiversity Management Committee
    nba_administrative_share_inr: float  # 5% to NBA National Biodiversity Fund
    statutory_basis: str
    reporting_schedule: str
    penalty_for_non_compliance: str

class FormIIIApplicationRequest(BaseModel):
    applicant_name: str = Field(..., description="Full legal name of the applicant or institution")
    applicant_category: str = Field("Indian Registered Company", description="Category: Indian Company, Section 3(2) Foreign Entity, Individual Inventor, Academic/CSIR")
    registered_office_address: str = Field(..., description="Full postal address with pincode and state")
    pan_or_cin: Optional[str] = Field(None, description="PAN or Corporate Identification Number (CIN)")
    invention_title: str = Field(..., description="Exact title of invention as filed/to be filed with Patent Office")
    patent_application_number: Optional[str] = Field(None, description="Indian or PCT Patent Application Number (if already filed)")
    patent_filing_date: Optional[str] = Field(None, description="Date of patent application (YYYY-MM-DD)")
    patent_office_jurisdiction: str = Field("Indian Patent Office (IPO)", description="Patent Office (IPO, USPTO, EPO, WIPO)")
    biological_resources: List[BiologicalResourceItem] = Field(..., min_items=1, description="List of Indian biological resources used")
    intended_commercialization_summary: str = Field(..., description="Summary of how the invention will be manufactured or licensed")
    benefit_sharing_commitment_accepted: bool = Field(True, description="Commitment to execute ABS agreement with NBA under Regulation 9")

class FormIIIApplicationResponse(BaseModel):
    dossier_id: str
    generated_at: str
    applicant_summary: Dict[str, Any]
    invention_summary: Dict[str, Any]
    biological_resources_manifest: List[Dict[str, Any]]
    regulatory_classification: Dict[str, Any]
    sbb_intimation_mandate: Dict[str, Any]
    section_55_risk_assessment: Dict[str, Any]
    document_checklist: List[str]
    statutory_declaration_text: str
    submission_instructions: str

# Curated NBA test benchmarks
PRESET_NBA_BENCHMARKS = [
    {
        "id": "ashwagandha-msme",
        "title": "Standardized Ashwagandha Extract Formulation by Indian Herbal MSME",
        "applicant_name": "Siddha-Veda Phytolabs Pvt Ltd",
        "applicant_category": "Indian Registered Company (No Foreign Equity)",
        "address": "Plot 42, Biotech Park, Sector 18, Gurugram, Haryana - 122015",
        "turnover_inr": 25000000.0, # 2.5 Crore INR
        "pan_cin": "U24233HR2020PTC085123",
        "invention_title": "Standardized aqueous-alcoholic extract of Withania somnifera with >5% Withanolides and process for preparation thereof",
        "patent_app_no": "202311048912",
        "patent_filing_date": "2023-08-14",
        "patent_office": "Indian Patent Office (IPO, New Delhi)",
        "resources": [
            {
                "vernacular_name": "Ashwagandha",
                "botanical_name": "Withania somnifera",
                "part_used": "Dried Roots",
                "sourcing_location": "Mandsaur / Neemuch, Madhya Pradesh",
                "procurement_source": "Direct Cultivation / Farmer Procurement",
                "associated_traditional_knowledge": True
            }
        ],
        "commercial_summary": "Manufacture and marketing of standardized nutraceutical tablets in Indian domestic market with planned export to ASEAN."
    },
    {
        "id": "curcumin-multinational",
        "title": "Liposomal Curcumin NDDS by Multinational Pharmaceutical Corporation",
        "applicant_name": "VedaBio Innovations Pte Ltd / BioHealth India Corp",
        "applicant_category": "Foreign Entity / NRI / Indian Co with Foreign Shareholding (Section 3(2))",
        "address": "Level 14, Marina Bay Financial Centre, Singapore / BKC Mumbai 400051",
        "turnover_inr": 85000000.0, # 8.5 Crore INR
        "pan_cin": "U74999MH2021FTC345678",
        "invention_title": "Nanostructured phospholipid complex of Curcuminoids with enhanced bioavailability and methods of synthesis",
        "patent_app_no": "PCT/IB2024/050123",
        "patent_filing_date": "2024-02-10",
        "patent_office": "WIPO / IPO / USPTO",
        "resources": [
            {
                "vernacular_name": "Haridra / Turmeric",
                "botanical_name": "Curcuma longa",
                "part_used": "Rhizome",
                "sourcing_location": "Erode, Tamil Nadu & Lakadong, Meghalaya",
                "procurement_source": "Registered Trader / Mandi",
                "associated_traditional_knowledge": True
            },
            {
                "vernacular_name": "Maricha / Black Pepper",
                "botanical_name": "Piper nigrum",
                "part_used": "Dried Berries",
                "sourcing_location": "Wayanad, Kerala",
                "procurement_source": "Wild Harvest / Forest Produce",
                "associated_traditional_knowledge": False
            }
        ],
        "commercial_summary": "Global licensing of patent to pharmaceutical manufacturers with estimated 4% net royalty pass-through."
    }
]

@router.get("/nba/regulations")
async def get_nba_regulations_overview():
    """Returns statutory overview of Biological Diversity Act 2002, 2023 Amendment, and ABS forms."""
    return {
        "act_title": "The Biological Diversity Act, 2002 (as amended by The Biological Diversity (Amendment) Act, 2023)",
        "statutory_authority": "National Biodiversity Authority (NBA), TICEL Bio Park, Taramani, Chennai, Tamil Nadu",
        "key_statutory_sections": [
            {
                "section": "Section 3",
                "description": "Approval required by persons not citizens of India, NRI, or body corporate with foreign participation before accessing Indian bio-resources for research or commercial utilization."
            },
            {
                "section": "Section 6",
                "description": "Mandatory prior approval of NBA before applying for any Intellectual Property Right (Patent) in or outside India based on research on Indian biological resources."
            },
            {
                "section": "Section 7",
                "description": "Prior intimation to State Biodiversity Board (SBB) by Indian citizens/entities before obtaining biological resources for commercial utilization (with 2023 exemptions for AYUSH practitioners and cultivated resources)."
            },
            {
                "section": "Section 21 & Regulation 9",
                "description": "Determination of equitable Access and Benefit Sharing (ABS) payable to National Biodiversity Fund and local Biodiversity Management Committees (BMCs)."
            },
            {
                "section": "Section 55 (Penalties)",
                "description": "Decriminalized under 2023 amendment into stringent civil monetary adjudications ranging from ₹1,00,000 to ₹1,00,00,000 for contravention of Section 3, 4, or 6."
            }
        ],
        "statutory_forms": [
            {"form": "Form I", "purpose": "Application for access to biological resources for commercial utilization (Foreign / Sec 3(2) entities)"},
            {"form": "Form II", "purpose": "Application for transferring results of research on Indian biological resources to non-Indian entities"},
            {"form": "Form III", "purpose": "Application for prior approval of NBA before applying for Patent / IPR (MANDATORY FOR ALL PATENT APPLICANTS)"},
            {"form": "Form IV", "purpose": "Application for third-party transfer of accessed biological resources"}
        ]
    }

@router.get("/nba/benchmarks")
async def get_nba_benchmarks():
    """Returns preset test cases for NBA compliance and ABS calculations."""
    return PRESET_NBA_BENCHMARKS

@router.post("/nba/calculate-abs", response_model=ABSCalculationResponse)
async def calculate_abs(req: ABSCalculationRequest):
    """
    Computes Access and Benefit Sharing (ABS) liability under Regulation 9 of Guidelines on Access to
    Biological Resources and Associated Knowledge and Benefits Sharing Regulations, 2014.
    """
    calc_id = f"ABS-CALC-{datetime.datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    is_foreign_or_sec3 = "Foreign" in req.applicant_category or "Section 3(2)" in req.applicant_category or "NRI" in req.applicant_category

    turnover = req.annual_ex_factory_sales_inr
    abs_percentage = 0.0
    tier_desc = ""
    annual_fee = 0.0

    if req.commercial_mode == "IP Licensing / Commercial Transfer":
        # Royalty based ABS (typically 3% to 5% of royalty received)
        royalty = req.royalty_received_inr or (turnover * 0.05)
        abs_percentage = 3.0 if is_foreign_or_sec3 else 2.0
        annual_fee = royalty * (abs_percentage / 100.0)
        tier_desc = f"IP Royalty Commercialization Tier ({abs_percentage}% of gross royalty consideration)"
        statutory_basis = "Regulation 9(2) - Benefit sharing on transfer of IP rights or licensing of patent"
    else:
        # Product sales tiered calculation
        if turnover <= 10000000: # Up to 1 Crore
            abs_percentage = 0.1
            annual_fee = turnover * 0.001
            tier_desc = "Tier 1: Annual ex-factory gross sales up to ₹1,00,00,000 (0.1% rate)"
        elif turnover <= 30000000: # 1 to 3 Crore
            abs_percentage = 0.2
            # 0.1% on first 1 Cr + 0.2% on remaining
            annual_fee = (10000000 * 0.001) + ((turnover - 10000000) * 0.002)
            tier_desc = "Tier 2: Annual ex-factory gross sales ₹1,00,00,001 to ₹3,00,00,000 (0.2% marginal rate)"
        else: # Above 3 Crore
            abs_percentage = 0.5
            # 0.1% on first 1 Cr + 0.2% on next 2 Cr + 0.5% on balance
            annual_fee = (10000000 * 0.001) + (20000000 * 0.002) + ((turnover - 30000000) * 0.005)
            tier_desc = "Tier 3: Annual ex-factory gross sales exceeding ₹3,00,00,000 (0.5% marginal rate)"

        statutory_basis = "Regulation 9(1) - Benefit sharing on purchase of biological resources for commercial utilization"

    # Distribution of ABS funds (95% to local BMC, 5% retained by NBA for administrative expenses)
    bmc_share = annual_fee * 0.95
    nba_share = annual_fee * 0.05

    reporting_schedule = "Annual statement of ex-factory gross sales certified by Chartered Accountant submitted to NBA before 30th June."
    penalty = (
        "Non-payment of ABS constitutes violation under Section 55 of Biological Diversity Act, liable to civil penalty up to "
        "₹50,00,000 and potential revocation of NBA patent grant approval (which invalidates the patent under Patents Act Section 64(1)(p))."
    )

    return ABSCalculationResponse(
        calculation_id=calc_id,
        applicant_category=req.applicant_category,
        is_section_3_2_entity=is_foreign_or_sec3,
        annual_turnover_inr=turnover,
        applicable_tier=tier_desc,
        abs_percentage=abs_percentage,
        annual_abs_payable_inr=round(annual_fee, 2),
        bmc_community_share_inr=round(bmc_share, 2),
        nba_administrative_share_inr=round(nba_share, 2),
        statutory_basis=statutory_basis,
        reporting_schedule=reporting_schedule,
        penalty_for_non_compliance=penalty
    )

@router.post("/nba/form-iii", response_model=FormIIIApplicationResponse)
async def generate_nba_form_iii_dossier(req: FormIIIApplicationRequest):
    """
    Generates a statutory Form III application dossier for prior approval of National Biodiversity Authority (NBA)
    under Section 6 of Biological Diversity Act, 2002 before patent grant.
    """
    dossier_id = f"NBA-FORM3-{datetime.datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

    is_foreign_entity = "Foreign" in req.applicant_category or "Section 3(2)" in req.applicant_category or "NRI" in req.applicant_category

    # Manifest processing
    manifest = []
    has_forest_produce = False
    states_involved = set()

    for item in req.biological_resources:
        is_wild = "Wild" in item.procurement_source or "Forest" in item.procurement_source
        if is_wild:
            has_forest_produce = True
        manifest.append({
            "vernacular_name": item.vernacular_name,
            "botanical_name": item.botanical_name,
            "part_used": item.part_used,
            "sourcing_location": item.sourcing_location,
            "procurement_mode": item.procurement_source,
            "tk_associated": item.associated_traditional_knowledge,
            "bmc_clearance_required": is_wild
        })
        # Extract state if present in sourcing string
        parts = [p.strip() for p in item.sourcing_location.split(",")]
        if len(parts) > 1:
            states_involved.add(parts[-1])

    # Regulatory Classification
    reg_class = {
        "statutory_category": "Section 3(2) Entity (Foreign Participation)" if is_foreign_entity else "Section 7 Domestic Indian Entity",
        "nba_section_6_status": "MANDATORY - Form III prior approval must be granted before IPO issues Letters Patent.",
        "application_fee_inr": 10000 if not is_foreign_entity else 50000,
        "hearing_risk_level": "HIGH (requires detailed ABS agreement)" if is_foreign_entity or has_forest_produce else "LOW TO MODERATE"
    }

    # State Biodiversity Board (SBB) Intimation Mandate
    sbb_status = {
        "sbb_intimation_required": not is_foreign_entity,
        "affected_states": list(states_involved) if states_involved else ["State of sourcing"],
        "amendment_2023_exemption_applicable": not has_forest_produce and not is_foreign_entity,
        "legal_note": (
            "Under Section 7 of the amended Act, cultivated bio-resources by registered AYUSH units are exempt from SBB intimation "
            "for commercial manufacture. HOWEVER, for patent filing, Section 6(1) NBA Form III approval remains mandatory regardless of cultivation status."
        )
    }

    # Section 55 Penal Assessment
    sec55_risk = {
        "status": "COMPLIANT INITIATION" if req.benefit_sharing_commitment_accepted else "HIGH RISK - BENEFIT SHARING DISPUTE",
        "statutory_warning": (
            "Applying for a patent outside or inside India without Section 6 NBA approval attracts penalty up to ₹50,00,000 under amended Section 55. "
            "Furthermore, under Section 64(1)(p) of the Patents Act, 1970, failure to disclose geographic origin or obtain NBA approval is an absolute ground for revocation of patent."
        ),
        "mitigation": "Submit Form III immediately to NBA Chennai and file receipt copy at the Indian Patent Office (IPO) with Form 18A (Request for Examination)."
    }

    document_checklist = [
        "Certified copy of complete patent specification as filed with Patent Office (including abstract, claims, and drawing)",
        "Proof of payment of statutory application fee (Demand Draft / Bharatkosh e-payment to National Biodiversity Authority)",
        "Identity & corporate proof (Certificate of Incorporation, PAN card, Memorandum & Articles of Association)",
        "Procurement vouchers / Mandi purchase receipts / Farmer purchase agreements verifying origin of biological resources",
        "Authorisation letter / Power of Attorney in favor of patent agent or authorized representative",
        "Affidavit confirming acceptance of Regulation 9 Access and Benefit Sharing (ABS) terms"
    ]

    declaration_text = (
        f"I/We, {req.applicant_name}, having registered office at {req.registered_office_address}, "
        f"hereby solemnly declare that the information provided in this Form III application regarding the biological resources "
        f"utilized in the invention titled '{req.invention_title}' is true, correct, and complete to the best of my knowledge. "
        f"I/We undertake to abide by the provisions of the Biological Diversity Act, 2002, the Biological Diversity (Amendment) Act, 2023, "
        f"and execute the equitable Access and Benefit Sharing (ABS) agreement as determined by the Authority."
    )

    submission_instructions = (
        "1. Complete online submission via NBA ABS portal (absefiling.nic.in).\n"
        "2. Submit two physical hard-bound copies signed by the authorized signatory along with Bharatkosh payment receipt to:\n"
        "   The Secretary, National Biodiversity Authority (NBA), TICEL Bio Park, 5th Floor, CSIR Road, Taramani, Chennai - 600113, Tamil Nadu.\n"
        "3. File a copy of the NBA Form III acknowledgment receipt before the Controller of Patents under Rule 13(7) of Patent Rules."
    )

    return FormIIIApplicationResponse(
        dossier_id=dossier_id,
        generated_at=now_str,
        applicant_summary={
            "name": req.applicant_name,
            "category": req.applicant_category,
            "address": req.registered_office_address,
            "pan_or_cin": req.pan_or_cin,
            "is_foreign": is_foreign_entity
        },
        invention_summary={
            "title": req.invention_title,
            "patent_app_no": req.patent_application_number or "To be filed post-provisional",
            "filing_date": req.patent_filing_date or "Pending",
            "jurisdiction": req.patent_office_jurisdiction,
            "commercialization_summary": req.intended_commercialization_summary
        },
        biological_resources_manifest=manifest,
        regulatory_classification=reg_class,
        sbb_intimation_mandate=sbb_status,
        section_55_risk_assessment=sec55_risk,
        document_checklist=document_checklist,
        statutory_declaration_text=declaration_text,
        submission_instructions=submission_instructions
    )
