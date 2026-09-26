"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Check, 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Calculator, 
  Printer, 
  Building2, 
  MapPin, 
  Leaf, 
  ClipboardCheck,
  Plus,
  Trash2,
  Info
} from "lucide-react";

interface BiologicalResource {
  vernacular_name: string;
  botanical_name: string;
  part_used: string;
  sourcing_location: string;
  procurement_source: string;
  associated_traditional_knowledge: boolean;
}

interface ABSResult {
  calculation_id: string;
  applicant_category: string;
  is_section_3_2_entity: boolean;
  annual_turnover_inr: number;
  applicable_tier: string;
  abs_percentage: number;
  annual_abs_payable_inr: number;
  bmc_community_share_inr: number;
  nba_administrative_share_inr: number;
  statutory_basis: string;
  reporting_schedule: string;
  penalty_for_non_compliance: string;
}

interface FormIIIResult {
  dossier_id: string;
  generated_at: string;
  applicant_summary: any;
  invention_summary: any;
  biological_resources_manifest: any[];
  regulatory_classification: any;
  sbb_intimation_mandate: any;
  section_55_risk_assessment: any;
  document_checklist: string[];
  statutory_declaration_text: string;
  submission_instructions: string;
}

export default function NBAPage() {
  const [activeTab, setActiveTab] = useState<"calculator" | "form3">("calculator");
  const [benchmarks, setBenchmarks] = useState<any[]>([]);

  // Calculator State
  const [applicantCat, setApplicantCat] = useState("Indian Registered Company (No Foreign Equity)");
  const [turnover, setTurnover] = useState<number>(25000000); // 2.5 Crore INR
  const [commercialMode, setCommercialMode] = useState("Direct Product Sales");
  const [royalty, setRoyalty] = useState<number>(0);
  const [rawMaterialType, setRawMaterialType] = useState("Cultivated Agricultural");
  const [absLoading, setAbsLoading] = useState(false);
  const [absResult, setAbsResult] = useState<ABSResult | null>(null);

  // Form III State
  const [applicantName, setApplicantName] = useState("Siddha-Veda Phytolabs Pvt Ltd");
  const [form3Category, setForm3Category] = useState("Indian Registered Company (No Foreign Equity)");
  const [address, setAddress] = useState("Plot 42, Biotech Park, Sector 18, Gurugram, Haryana - 122015");
  const [panCin, setPanCin] = useState("U24233HR2020PTC085123");
  const [inventionTitle, setInventionTitle] = useState("Standardized aqueous-alcoholic extract of Withania somnifera with >5% Withanolides and process for preparation thereof");
  const [patentAppNo, setPatentAppNo] = useState("202311048912");
  const [filingDate, setFilingDate] = useState("2023-08-14");
  const [patentOffice, setPatentOffice] = useState("Indian Patent Office (IPO, New Delhi)");
  const [commercialSummary, setCommercialSummary] = useState("Manufacture and marketing of standardized nutraceutical tablets in Indian domestic market with planned export to ASEAN.");
  const [resources, setResources] = useState<BiologicalResource[]>([
    {
      vernacular_name: "Ashwagandha",
      botanical_name: "Withania somnifera",
      part_used: "Dried Roots",
      sourcing_location: "Mandsaur / Neemuch, Madhya Pradesh",
      procurement_source: "Direct Cultivation / Farmer Procurement",
      associated_traditional_knowledge: true
    }
  ]);
  const [form3Loading, setForm3Loading] = useState(false);
  const [form3Result, setForm3Result] = useState<FormIIIResult | null>(null);

  useEffect(() => {
    fetchBenchmarks();
    handleCalculateABS();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/nba/benchmarks");
      if (res.ok) {
        const data = await res.json();
        setBenchmarks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculateABS = async () => {
    setAbsLoading(true);
    try {
      const payload = {
        applicant_category: applicantCat,
        annual_ex_factory_sales_inr: turnover,
        royalty_received_inr: royalty,
        commercial_mode: commercialMode,
        raw_material_type: rawMaterialType
      };

      const res = await fetch("http://127.0.0.1:8000/api/nba/calculate-abs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setAbsResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAbsLoading(false);
    }
  };

  const handleGenerateForm3 = async () => {
    setForm3Loading(true);
    try {
      const payload = {
        applicant_name: applicantName,
        applicant_category: form3Category,
        registered_office_address: address,
        pan_or_cin: panCin,
        invention_title: inventionTitle,
        patent_application_number: patentAppNo,
        patent_filing_date: filingDate,
        patent_office_jurisdiction: patentOffice,
        biological_resources: resources,
        intended_commercialization_summary: commercialSummary,
        benefit_sharing_commitment_accepted: true
      };

      const res = await fetch("http://127.0.0.1:8000/api/nba/form-iii", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setForm3Result(data);
      } else {
        alert("Form III generation failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setForm3Loading(false);
    }
  };

  const loadBenchmark = (bm: any) => {
    setApplicantName(bm.applicant_name);
    setForm3Category(bm.applicant_category);
    setApplicantCat(bm.applicant_category);
    setAddress(bm.address);
    setTurnover(bm.turnover_inr);
    setPanCin(bm.pan_cin);
    setInventionTitle(bm.invention_title);
    setPatentAppNo(bm.patent_app_no);
    setFilingDate(bm.patent_filing_date);
    setPatentOffice(bm.patent_office);
    setResources(bm.resources);
    setCommercialSummary(bm.commercial_summary);
  };

  const addResource = () => {
    setResources([
      ...resources,
      {
        vernacular_name: "",
        botanical_name: "",
        part_used: "",
        sourcing_location: "",
        procurement_source: "Direct Cultivation / Farmer Procurement",
        associated_traditional_knowledge: false
      }
    ]);
  };

  const removeResource = (idx: number) => {
    setResources(resources.filter((_, i) => i !== idx));
  };

  const updateResource = (idx: number, field: keyof BiologicalResource, val: any) => {
    const updated = [...resources];
    updated[idx] = { ...updated[idx], [field]: val };
    setResources(updated);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-[#fcfbf9] border border-[#e5e0d5] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f2eee3] text-[#70531c] text-xs font-semibold tracking-wide border border-[#ded5c0]">
              <Scale className="w-3.5 h-3.5" />
              <span>Biological Diversity Act, 2002 & 2023 Amendment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#14281c]">
              National Biodiversity Authority (NBA) Section 6 Assistant
            </h1>
            <p className="text-sm text-[#4d5f52] max-w-3xl leading-relaxed">
              Statutory intelligence engine for Access and Benefit Sharing (ABS Regulation 9), mandatory Form III
              prior patent approval dossiers, SBB intimation audits, and Section 55 civil penalty risk assessments.
            </p>
          </div>
        </div>

        {/* Preset Benchmarks */}
        {benchmarks.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#ede8de]">
            <p className="text-xs font-semibold text-[#5a6c5f] uppercase tracking-wider mb-2.5">
              Load Preset Statutory Compliance Profiles:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {benchmarks.map((bm) => (
                <button
                  key={bm.id}
                  onClick={() => loadBenchmark(bm)}
                  className="text-left p-3 rounded-lg border border-[#ded7c8] bg-[#f9f7f1] hover:bg-[#ede7da] text-[#1c3022] transition-colors"
                >
                  <p className="text-xs font-bold line-clamp-1">{bm.title}</p>
                  <p className="text-[11px] text-[#637567] mt-0.5">{bm.applicant_name} ({bm.applicant_category})</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-6 pt-5 border-t border-[#ede8de]">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-[#144226] text-white"
                : "bg-[#f4efe4] text-[#4d5f52] hover:bg-[#eae2cf]"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>ABS Regulation 9 Fee Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab("form3")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              activeTab === "form3"
                ? "bg-[#144226] text-white"
                : "bg-[#f4efe4] text-[#4d5f52] hover:bg-[#eae2cf]"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Section 6 Form III Dossier Generator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ABS FEE CALCULATOR */}
      {activeTab === "calculator" && (
        <div className="space-y-6">
          <div className="bg-[#fdfcf9] border border-[#e5e0d5] rounded-xl p-6 sm:p-7 shadow-xs space-y-6">
            <h2 className="text-lg font-bold font-heading text-[#14281c] border-b border-[#eeeae0] pb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#144226]" />
              <span>Access & Benefit Sharing (ABS) Quantitative Calculator</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Applicant Statutory Category
                </label>
                <select
                  value={applicantCat}
                  onChange={(e) => setApplicantCat(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                >
                  <option value="Indian Registered Company (No Foreign Equity)">Indian Registered Company (No Foreign Equity)</option>
                  <option value="Foreign Entity / NRI / Indian Co with Foreign Shareholding (Section 3(2))">Foreign Entity / NRI / Co with Foreign Equity (Section 3(2))</option>
                  <option value="Indian Individual / Proprietorship / Academic">Indian Individual / Proprietorship / Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Commercialization Mechanism
                </label>
                <select
                  value={commercialMode}
                  onChange={(e) => setCommercialMode(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                >
                  <option value="Direct Product Sales">Direct Product Sales (Ex-Factory Gross Turnover)</option>
                  <option value="IP Licensing / Commercial Transfer">IP Licensing / Commercial Patent Royalty</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Annual Gross Ex-Factory Turnover (INR)
                </label>
                <input
                  type="number"
                  value={turnover}
                  onChange={(e) => setTurnover(Number(e.target.value))}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d] font-mono"
                />
                <div className="flex gap-2 mt-2">
                  {[5000000, 15000000, 35000000, 100000000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTurnover(v)}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#f3eee1] border border-[#e0d6c1] text-[#7a5a19] hover:bg-[#ede2cb]"
                    >
                      {v >= 10000000 ? `${v / 10000000} Cr` : `${v / 100000} L`}
                    </button>
                  ))}
                </div>
              </div>

              {commercialMode === "IP Licensing / Commercial Transfer" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                    Gross Royalty / Assignment Consideration (INR)
                  </label>
                  <input
                    type="number"
                    value={royalty}
                    onChange={(e) => setRoyalty(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d] font-mono"
                    placeholder="e.g. 1000000"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Bio-Resource Sourcing Origin
                </label>
                <select
                  value={rawMaterialType}
                  onChange={(e) => setRawMaterialType(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                >
                  <option value="Cultivated Agricultural">Cultivated Agricultural / Farm-grown produce</option>
                  <option value="Wild / Forest Harvest">Wild Harvest / Forest Produce / Tribal collection</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleCalculateABS}
                disabled={absLoading}
                className="px-6 py-2.5 rounded-lg bg-[#144226] hover:bg-[#0e311c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
              >
                {absLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Calculating ABS Rate...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>Re-Calculate ABS Fee</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ABS Calculation Output */}
          {absResult && (
            <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eeeae0]">
                <div>
                  <span className="text-xs font-mono text-[#637567] tracking-wider uppercase">
                    Calc Reference: {absResult.calculation_id}
                  </span>
                  <h3 className="text-xl font-heading font-bold text-[#14281c] mt-0.5">
                    Equitable Benefit-Sharing Liability Assessment
                  </h3>
                  <p className="text-xs text-[#526356] mt-0.5">
                    {absResult.applicable_tier}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#faf7ef] border border-[#dfd7c3] text-center min-w-[220px]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#637567]">
                    Annual ABS Fee Payable
                  </span>
                  <div className="text-3xl font-heading font-black text-[#144226] my-1">
                    {formatINR(absResult.annual_abs_payable_inr)}
                  </div>
                  <span className="text-[11px] font-mono text-[#7a5a19]">
                    Rate: {absResult.abs_percentage}% of gross turnover
                  </span>
                </div>
              </div>

              {/* Fund Distribution Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#f9f7f1] border border-[#e5dfd2] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2a3c30]">Local Biodiversity Management Committee (95%)</span>
                    <span className="font-mono font-bold text-[#144226]">
                      {formatINR(absResult.bmc_community_share_inr)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#556759]">
                    Channelled directly to grassroots Panchayats and tribal conservers who protect the natural bio-resource habitats.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#f9f7f1] border border-[#e5dfd2] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2a3c30]">NBA National Biodiversity Fund (5%)</span>
                    <span className="font-mono font-bold text-[#144226]">
                      {formatINR(absResult.nba_administrative_share_inr)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#556759]">
                    Statutory administrative and conservation monitoring charges retained by NBA under Section 21.
                  </p>
                </div>
              </div>

              {/* Statutory Note & Penal Assessment */}
              <div className="p-4 rounded-lg bg-[#fbf9f4] border border-[#ded5c2] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#802f1a]">
                  <AlertTriangle className="w-4 h-4 text-[#802f1a]" />
                  <span>Section 55 Penal Liability & Revocation Clause:</span>
                </div>
                <p className="text-xs text-[#4b5b4e] leading-relaxed">
                  {absResult.penalty_for_non_compliance}
                </p>
                <div className="text-[11px] font-mono text-[#665522] pt-1">
                  Mandatory Reporting: {absResult.reporting_schedule}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORM III STATUTORY DOSSIER GENERATOR */}
      {activeTab === "form3" && (
        <div className="space-y-6">
          <div className="bg-[#fdfcf9] border border-[#e5e0d5] rounded-xl p-6 sm:p-7 shadow-xs space-y-6">
            <h2 className="text-lg font-bold font-heading text-[#14281c] border-b border-[#eeeae0] pb-3 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#144226]" />
              <span>Section 6 Form III Application Dossier Builder</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Applicant Legal Entity Name
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Entity Category
                </label>
                <select
                  value={form3Category}
                  onChange={(e) => setForm3Category(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                >
                  <option value="Indian Registered Company (No Foreign Equity)">Indian Registered Company (No Foreign Equity)</option>
                  <option value="Foreign Entity / NRI / Indian Co with Foreign Shareholding (Section 3(2))">Section 3(2) Foreign / NRI Entity</option>
                  <option value="Individual Indian Citizen / Inventor">Individual Indian Citizen / Inventor</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Registered Postal Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Exact Title of Invention (As in Patent Specification)
                </label>
                <input
                  type="text"
                  value={inventionTitle}
                  onChange={(e) => setInventionTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Patent Application Number (If Filed)
                </label>
                <input
                  type="text"
                  value={patentAppNo}
                  onChange={(e) => setPatentAppNo(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d] font-mono"
                  placeholder="e.g. 202311048912"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
                  Filing Date & Patent Jurisdiction
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filingDate}
                    onChange={(e) => setFilingDate(e.target.value)}
                    className="w-1/2 text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                  />
                  <input
                    type="text"
                    value={patentOffice}
                    onChange={(e) => setPatentOffice(e.target.value)}
                    className="w-1/2 text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white text-[#17261d]"
                  />
                </div>
              </div>
            </div>

            {/* Biological Resources Manifest */}
            <div className="pt-4 border-t border-[#ede8de] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#384a3e]">
                    Biological Resources Manifest (Section 6 Table)
                  </h3>
                  <p className="text-[11px] text-[#637567]">Specify Indian biological resources, plant parts, and geographic origin.</p>
                </div>
                <button
                  type="button"
                  onClick={addResource}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f0ece2] hover:bg-[#e4ddce] text-[#144226] text-xs font-semibold border border-[#ded5c0]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Herb</span>
                </button>
              </div>

              <div className="space-y-3">
                {resources.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-[#ded7c8] bg-[#faf8f2] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#144226]">
                        Item #{idx + 1}
                      </span>
                      {resources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResource(idx)}
                          className="text-[#802f1a] hover:text-[#5a1b0b] text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4d5f52] mb-1">
                          Vernacular / Ayurvedic Name
                        </label>
                        <input
                          type="text"
                          value={item.vernacular_name}
                          onChange={(e) => updateResource(idx, "vernacular_name", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d8d1c2] bg-white"
                          placeholder="e.g. Ashwagandha"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4d5f52] mb-1">
                          Botanical Binomial
                        </label>
                        <input
                          type="text"
                          value={item.botanical_name}
                          onChange={(e) => updateResource(idx, "botanical_name", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d8d1c2] bg-white italic"
                          placeholder="e.g. Withania somnifera"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4d5f52] mb-1">
                          Part Used
                        </label>
                        <input
                          type="text"
                          value={item.part_used}
                          onChange={(e) => updateResource(idx, "part_used", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d8d1c2] bg-white"
                          placeholder="e.g. Dried Roots"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4d5f52] mb-1">
                          Sourcing District & State
                        </label>
                        <input
                          type="text"
                          value={item.sourcing_location}
                          onChange={(e) => updateResource(idx, "sourcing_location", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d8d1c2] bg-white"
                          placeholder="e.g. Neemuch, Madhya Pradesh"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4d5f52] mb-1">
                          Procurement Mode
                        </label>
                        <select
                          value={item.procurement_source}
                          onChange={(e) => updateResource(idx, "procurement_source", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d8d1c2] bg-white"
                        >
                          <option value="Direct Cultivation / Farmer Procurement">Direct Cultivation / Farmer Procurement</option>
                          <option value="Registered Trader / Mandi">Registered Trader / Mandi</option>
                          <option value="Wild Harvest / Forest Produce">Wild Harvest / Forest Produce</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#3a4c3e]">
                          <input
                            type="checkbox"
                            checked={item.associated_traditional_knowledge}
                            onChange={(e) => updateResource(idx, "associated_traditional_knowledge", e.target.checked)}
                            className="rounded border-[#b8ae9c] text-[#144226]"
                          />
                          <span>Traditional Knowledge Associated</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleGenerateForm3}
                disabled={form3Loading}
                className="px-6 py-3 rounded-lg bg-[#144226] hover:bg-[#0e311c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
              >
                {form3Loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Compiling Form III Dossier...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate NBA Form III Statutory Dossier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form III Output Dossier */}
          {form3Result && (
            <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eeeae0]">
                <div>
                  <span className="text-xs font-mono text-[#637567] tracking-wider uppercase">
                    Dossier ID: {form3Result.dossier_id} • Generated: {form3Result.generated_at}
                  </span>
                  <h3 className="text-xl font-heading font-bold text-[#14281c] mt-0.5">
                    Form III (Rule 18) Statutory Application for Approval to Apply for IPR
                  </h3>
                  <p className="text-xs text-[#526356] mt-0.5">
                    Before The National Biodiversity Authority, TICEL Bio Park, Taramani, Chennai
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg border border-[#c9c1b0] bg-[#f7f4ed] hover:bg-[#ede7db] text-[#1e3023] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Form III</span>
                </button>
              </div>

              {/* Regulatory Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#f9f7f1] border border-[#e5dfd2] space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#637567]">
                    NBA Section 6 Mandate:
                  </span>
                  <p className="text-xs font-semibold text-[#182c1e]">
                    {form3Result.regulatory_classification.nba_section_6_status}
                  </p>
                  <div className="text-[11px] text-[#556758]">
                    Statutory Fee: <strong>₹{form3Result.regulatory_classification.application_fee_inr}</strong> • Hearing Risk: {form3Result.regulatory_classification.hearing_risk_level}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#f9f7f1] border border-[#e5dfd2] space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#637567]">
                    State Biodiversity Board (SBB) Intimation:
                  </span>
                  <p className="text-xs font-semibold text-[#182c1e]">
                    {form3Result.sbb_intimation_mandate.legal_note}
                  </p>
                </div>
              </div>

              {/* Biological Resources Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#384a3e]">
                  Declared Biological Resources Schedule:
                </h4>
                <div className="border border-[#e2dbce] rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f0ece1] text-[#334438] font-bold border-b border-[#e2dbce]">
                      <tr>
                        <th className="p-2.5">Vernacular Name</th>
                        <th className="p-2.5">Botanical Binomial</th>
                        <th className="p-2.5">Part Used</th>
                        <th className="p-2.5">Sourcing Location</th>
                        <th className="p-2.5">Procurement Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee8dc]">
                      {form3Result.biological_resources_manifest.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#fbf9f5]">
                          <td className="p-2.5 font-bold text-[#14281c]">{item.vernacular_name}</td>
                          <td className="p-2.5 italic text-[#2c3d31]">{item.botanical_name}</td>
                          <td className="p-2.5 text-[#4a5c4e]">{item.part_used}</td>
                          <td className="p-2.5 text-[#4a5c4e]">{item.sourcing_location}</td>
                          <td className="p-2.5 font-mono text-[11px] text-[#63511c]">{item.procurement_mode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mandatory Checklist */}
              <div className="p-4 rounded-lg bg-[#f6f4ed] border border-[#ded5c2] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14281c]">
                  Mandatory Submission Documents Checklist:
                </span>
                <ul className="space-y-1.5 pt-1">
                  {form3Result.document_checklist.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#3a4c3e]">
                      <Check className="w-3.5 h-3.5 text-[#144226] shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formal Declaration */}
              <div className="p-4 rounded-lg bg-white border border-[#ded6c3] space-y-2">
                <span className="text-xs font-mono font-bold text-[#144226]">
                  FORMAL STATUTORY DECLARATION (UNDER OATH)
                </span>
                <p className="text-xs font-mono text-[#243528] bg-[#f9f7f3] p-3 rounded border border-[#eae3d5] leading-relaxed">
                  {form3Result.statutory_declaration_text}
                </p>
              </div>

              {/* Filing Instructions */}
              <div className="p-4 rounded-lg bg-[#f9f7f2] border border-[#e0d8ca] space-y-1 text-xs text-[#4b5b4e]">
                <span className="font-bold text-[#14281c] block">Submission Instructions:</span>
                <pre className="font-mono text-[11px] text-[#2c3d31] whitespace-pre-wrap leading-relaxed">
                  {form3Result.submission_instructions}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
