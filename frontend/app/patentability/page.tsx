"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";
import { 
  FileText, 
  Check, 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Search, 
  Printer, 
  ArrowRight,
  BookOpen,
  Info
} from "lucide-react";

interface DimensionScore {
  score: number;
  max_score: number;
  verdict: string;
  rationale: string;
}

interface Section3Hurdle {
  statutory_clause: string;
  risk_level: string;
  analysis: string;
  statutory_defense: string;
}

interface PriorArtItem {
  office_or_database: string;
  reference_id: string;
  title: string;
  similarity_score: number;
  relevance_type: string;
  risk_summary: string;
}

interface PatentabilityResponse {
  evaluation_id: string;
  evaluated_at: string;
  invention_title: string;
  patentability_probability_index: number;
  probability_tier: string;
  dimension_scores: Record<string, DimensionScore>;
  section_3_audit: Section3Hurdle[];
  prior_art_landscape: PriorArtItem[];
  claim_restructuring_strategy: {
    recommended_claim_type: string;
    jurisdictional_adaptation: string;
    sample_independent_claim: string;
    sample_dependent_claim: string;
  };
  prosecution_recommendations: string[];
  disclaimer: string;
}

export default function PatentabilityPage() {
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("Nano-Liposomal Formulation of Standardized Curcuminoids with Phosphatidylcholine Matrix");
  const [formulationType, setFormulationType] = useState("Novel Drug Delivery System (NDDS / Nanotechnology)");
  const [indication, setIndication] = useState("Rheumatoid Arthritis and Systemic Chronic Inflammation");
  const [ingredientsText, setIngredientsText] = useState("Curcuma longa (95% Curcuminoids), Phosphatidylcholine, Piper nigrum (98% Piperine)");
  const [noveltyFeatures, setNoveltyFeatures] = useState("Sub-80nm liposomal entrapment with 24-month stability at 25°C; non-aggregating lipid bilayer matrix overcoming hydrophobic insolubility.");
  const [inventiveEvidence, setInventiveEvidence] = useState("18.4-fold enhancement in oral AUC bioavailability compared to unformulated curcumin; 68% reduction in synovial TNF-alpha at 1/5th classical human dosage.");
  const [isMethodClaimed, setIsMethodClaimed] = useState(false);
  const [hasClassicalMention, setHasClassicalMention] = useState(true);
  const [hasSynergyData, setHasSynergyData] = useState(true);
  const [synergyValue, setSynergyValue] = useState<string>("18.4");
  const [jurisdictions, setJurisdictions] = useState<string[]>(["IPO (India)", "USPTO (United States)", "EPO (Europe)"]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PatentabilityResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patentability/benchmarks`);
      if (res.ok) {
        const data = await res.json();
        setBenchmarks(data);
      }
    } catch (err) {
      console.error("Failed to load benchmarks", err);
    }
  };

  const loadBenchmark = (bm: any) => {
    setTitle(bm.title);
    setFormulationType(bm.formulation_type);
    setIndication(bm.indication);
    setIngredientsText(bm.botanical_ingredients.join(", "));
    setNoveltyFeatures(bm.novelty_features);
    setInventiveEvidence(bm.inventive_step_evidence);
    setIsMethodClaimed(bm.is_method_of_treatment_claimed);
    setHasClassicalMention(bm.has_classical_text_mention);
    setHasSynergyData(bm.has_synergy_or_efficacy_data);
    setSynergyValue(bm.synergy_ci_or_fold_increase !== null ? String(bm.synergy_ci_or_fold_increase) : "");
    if (bm.target_jurisdictions) {
      setJurisdictions(bm.target_jurisdictions);
    }
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const ingredientsList = ingredientsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        invention_title: title,
        formulation_type: formulationType,
        target_indication: indication,
        botanical_ingredients: ingredientsList.length > 0 ? ingredientsList : ["Polyherbal active composition"],
        novelty_features: noveltyFeatures,
        inventive_step_evidence: inventiveEvidence,
        is_method_of_treatment_claimed: isMethodClaimed,
        has_classical_text_mention: hasClassicalMention,
        has_synergy_or_efficacy_data: hasSynergyData,
        synergy_ci_or_fold_increase: synergyValue ? parseFloat(synergyValue) : null,
        target_jurisdictions: jurisdictions
      };

      const res = await fetch(`${API_BASE_URL}/api/patentability/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        alert("Evaluation failed. Please verify API connection.");
      }
    } catch (err) {
      console.error(err);
      alert("Error evaluating patentability.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleJurisdiction = (j: string) => {
    if (jurisdictions.includes(j)) {
      setJurisdictions(jurisdictions.filter((x) => x !== j));
    } else {
      setJurisdictions([...jurisdictions, j]);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-[#fcfbf9] border border-[#e5e0d5] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f2eee3] text-[#70531c] text-xs font-semibold tracking-wide border border-[#ded5c0]">
              <Scale className="w-3.5 h-3.5" />
              <span>Section 2 & 3 Statutory Patentability Scorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#14281c]">
              Prior-Art Patent Landscape & Patentability Probability Scorer
            </h1>
            <p className="text-sm text-[#4d5f52] max-w-3xl leading-relaxed">
              Calculates the quantitative Patentability Probability Index (PPI) evaluating Novelty (§ 2(1)(j)),
              Inventive Step (§ 2(1)(ja)), Industrial Applicability, and Section 3 exclusions (§ 3(d), § 3(e), § 3(p), § 3(i)).
              Compares anticipated claim scope against IPO, USPTO, EPO, and TKDL prior art.
            </p>
          </div>
        </div>

        {/* Preset Benchmarks */}
        {benchmarks.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#ede8de]">
            <p className="text-xs font-semibold text-[#5a6c5f] uppercase tracking-wider mb-2.5">
              Load Prior-Art Case Studies & Statutory Test Presets:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {benchmarks.map((bm) => (
                <button
                  key={bm.id}
                  onClick={() => loadBenchmark(bm)}
                  className="text-left p-2.5 rounded-lg border border-[#ded7c8] bg-[#f9f7f1] hover:bg-[#ede7da] text-[#1c3022] transition-colors"
                >
                  <p className="text-xs font-bold line-clamp-1">{bm.title}</p>
                  <p className="text-[11px] text-[#637567] mt-0.5">{bm.formulation_type}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Input Form */}
      <div className="bg-[#fdfcf9] border border-[#e5e0d5] rounded-xl p-6 sm:p-7 shadow-xs space-y-6">
        <h2 className="text-lg font-bold font-heading text-[#14281c] border-b border-[#eeeae0] pb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#144226]" />
          <span>Invention Specification & Statutory Claim Parameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
              Invention Title / Proposed Patent Caption
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white focus:outline-none focus:ring-1 focus:ring-[#144226] text-[#17261d]"
              placeholder="e.g. Standardized Synergistic Botanical Fraction..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
              Formulation / Technical Domain
            </label>
            <select
              value={formulationType}
              onChange={(e) => setFormulationType(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white focus:outline-none focus:ring-1 focus:ring-[#144226] text-[#17261d]"
            >
              <option value="Novel Drug Delivery System (NDDS / Nanotechnology)">Novel Drug Delivery System (NDDS / Nanotechnology)</option>
              <option value="Synergistic Polyherbal Combination">Synergistic Polyherbal Combination</option>
              <option value="Standardized Phytopharmaceutical / Purified Fraction">Standardized Phytopharmaceutical / Purified Fraction</option>
              <option value="Modified Classical Formulation">Modified Classical Formulation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
              Target Therapeutic Indication
            </label>
            <input
              type="text"
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white focus:outline-none focus:ring-1 focus:ring-[#144226] text-[#17261d]"
              placeholder="e.g. Osteoarthritis, Alzheimer's, Dyslipidemia"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
              Botanical Ingredients & Biomarkers (Comma Separated)
            </label>
            <input
              type="text"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#d8d1c2] bg-white focus:outline-none focus:ring-1 focus:ring-[#144226] text-[#17261d]"
              placeholder="e.g. Curcuma longa (95% Curcuminoids), Piper nigrum (98% Piperine)"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
              Novelty Features (§ 2(1)(j) - Distinction Over Prior Art & TKDL)
            </label>
            <textarea
              rows={2}
              value={noveltyFeatures}
              onChange={(e) => setNoveltyFeatures(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-lg border border-[#d8d1c2] bg-white focus:outline-none focus:ring-1 focus:ring-[#144226] text-[#17261d]"
              placeholder="Explain physical-chemical distinction, novel carrier matrix, or selective fractionation..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-1.5">
              Inventive Step / Surprising Technical Effect (§ 2(1)(ja) - Non-Obviousness)
            </label>
            <textarea
              rows={2}
              value={inventiveEvidence}
              onChange={(e) => setInventiveEvidence(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-lg border border-[#d8d1c2] bg-white focus:outline-none focus:ring-1 focus:ring-[#144226] text-[#17261d]"
              placeholder="Describe quantitative bio-enhancement, synergistic CI value, or reduced toxicity..."
            />
          </div>
        </div>

        {/* Section 3 Checkbox Audits */}
        <div className="pt-4 border-t border-[#ede8de] space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#384a3e]">
            Section 3 Statutory Exclusion Risk Flags:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#ded7c8] bg-[#faf8f2] cursor-pointer hover:bg-[#f3ede0] transition-colors">
              <input
                type="checkbox"
                checked={hasClassicalMention}
                onChange={(e) => setHasClassicalMention(e.target.checked)}
                className="mt-0.5 rounded border-[#b8ae9c] text-[#144226] focus:ring-[#144226]"
              />
              <div className="text-xs text-[#2b3a30]">
                <span className="font-semibold block text-[#14281c]">Section 3(p) TKDL Overlap</span>
                Any ingredient or indication is mentioned in Ayurvedic treatises or classical shlokas.
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#ded7c8] bg-[#faf8f2] cursor-pointer hover:bg-[#f3ede0] transition-colors">
              <input
                type="checkbox"
                checked={isMethodClaimed}
                onChange={(e) => setIsMethodClaimed(e.target.checked)}
                className="mt-0.5 rounded border-[#b8ae9c] text-[#144226] focus:ring-[#144226]"
              />
              <div className="text-xs text-[#2b3a30]">
                <span className="font-semibold block text-[#802f1a]">Section 3(i) Method of Treatment</span>
                Draft includes claims for "treating", "curing", or "administering" to human subjects.
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#ded7c8] bg-[#faf8f2] cursor-pointer hover:bg-[#f3ede0] transition-colors">
              <input
                type="checkbox"
                checked={hasSynergyData}
                onChange={(e) => setHasSynergyData(e.target.checked)}
                className="mt-0.5 rounded border-[#b8ae9c] text-[#144226] focus:ring-[#144226]"
              />
              <div className="text-xs text-[#2b3a30]">
                <span className="font-semibold block text-[#144226]">Section 3(e) Synergism Proof Available</span>
                Possesses comparative bioassay / Combination Index (CI) data proving more than mere admixture.
              </div>
            </label>

            <div className="p-3 rounded-lg border border-[#ded7c8] bg-[#faf8f2] flex items-center justify-between gap-2">
              <div className="text-xs text-[#2b3a30]">
                <span className="font-semibold block text-[#14281c]">Quantitative Metric (CI or Fold):</span>
                Enter Chou-Talalay CI (&lt;1.0) or fold bioavailability increase.
              </div>
              <input
                type="number"
                step="0.1"
                value={synergyValue}
                onChange={(e) => setSynergyValue(e.target.value)}
                placeholder="18.4"
                className="w-20 text-xs px-2 py-1.5 rounded border border-[#d8d1c2] bg-white text-right font-mono"
              />
            </div>
          </div>
        </div>

        {/* Target Jurisdictions */}
        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#384a3e] mb-2">
            Target Patent Jurisdictions:
          </p>
          <div className="flex flex-wrap gap-2">
            {["IPO (India)", "USPTO (United States)", "EPO (Europe)", "WIPO (PCT)"].map((jur) => {
              const active = jurisdictions.includes(jur);
              return (
                <button
                  type="button"
                  key={jur}
                  onClick={() => toggleJurisdiction(jur)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    active
                      ? "bg-[#144226] text-white border-[#144226]"
                      : "bg-[#f4efe4] text-[#4d5f52] border-[#ded5c0] hover:bg-[#eae2cf]"
                  }`}
                >
                  {jur}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-[#144226] hover:bg-[#0e311c] text-white text-sm font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Computing Statutory Probability...</span>
              </>
            ) : (
              <>
                <Scale className="w-4 h-4" />
                <span>Evaluate Patentability Probability (PPI)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Summary Card */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#eeeae0]">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#637567] tracking-wider uppercase">
                  Audit ID: {result.evaluation_id} • Evaluated: {result.evaluated_at}
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#14281c]">
                  {result.invention_title}
                </h2>
                <p className="text-xs text-[#526356]">
                  Evaluated under The Patents Act, 1970 (Section 2, 3(d), 3(e), 3(p), 3(i)) & MPPOP Guidelines.
                </p>
              </div>

              {/* Score Indicator */}
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-[#faf7ef] border border-[#dfd7c3] min-w-[200px] text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#637567]">
                  Patentability Index (PPI)
                </span>
                <div className="text-4xl font-heading font-black text-[#144226] my-1">
                  {result.patentability_probability_index}
                  <span className="text-lg font-normal text-[#637567]">/100</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    result.patentability_probability_index >= 75
                      ? "bg-[#e2ede4] text-[#144226]"
                      : result.patentability_probability_index >= 50
                      ? "bg-[#fbf2da] text-[#7a5a19]"
                      : "bg-[#fae4e1] text-[#852a1b]"
                  }`}
                >
                  {result.probability_tier}
                </span>
              </div>
            </div>

            {/* 4 Dimension Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {Object.entries(result.dimension_scores).map(([key, dim]) => (
                <div key={key} className="p-4 rounded-lg bg-[#f9f7f1] border border-[#e5dfd2] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2a3c30] capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono font-bold text-[#144226]">
                      {dim.score}/{dim.max_score}
                    </span>
                  </div>
                  <div className="w-full bg-[#e3ded2] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#144226] h-full rounded-full transition-all"
                      style={{ width: `${(dim.score / dim.max_score) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-semibold text-[#6a531f] uppercase tracking-wide">
                    {dim.verdict}
                  </div>
                  <p className="text-[11px] text-[#556759] leading-relaxed">
                    {dim.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 Statutory Clearance Deep-Dive */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#eeeae0] pb-3">
              <h3 className="text-base font-bold font-heading text-[#14281c] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#144226]" />
                <span>Section 3 Statutory Exclusion Analysis & Defense Protocols</span>
              </h3>
              <span className="text-xs text-[#637567]">Mandatory Indian Patent Office (IPO) Hurdles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.section_3_audit.map((hurdle, idx) => {
                const isCritical = hurdle.risk_level === "CRITICAL" || hurdle.risk_level === "HIGH";
                const isMedium = hurdle.risk_level === "MEDIUM";
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border space-y-2.5 ${
                      isCritical
                        ? "bg-[#fdf7f6] border-[#eed1cd]"
                        : isMedium
                        ? "bg-[#fdfaf2] border-[#ebdcc2]"
                        : "bg-[#f9fbf9] border-[#d8e7dc]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold font-heading text-[#182a1e]">
                        {hurdle.statutory_clause}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isCritical
                            ? "bg-[#fadcd8] text-[#852a1b]"
                            : isMedium
                            ? "bg-[#faedd0] text-[#7a5a19]"
                            : "bg-[#e0ece2] text-[#144226]"
                        }`}
                      >
                        {hurdle.risk_level} Risk
                      </span>
                    </div>

                    <p className="text-xs text-[#4a5c4e] leading-relaxed">
                      {hurdle.analysis}
                    </p>

                    <div className="pt-2 border-t border-[#eee7d8] text-[11px] text-[#2c3d31]">
                      <span className="font-semibold text-[#144226] block mb-0.5">Statutory Defense Strategy:</span>
                      {hurdle.statutory_defense}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Anticipated Prior Art Landscape */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#eeeae0] pb-3">
              <h3 className="text-base font-bold font-heading text-[#14281c] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#144226]" />
                <span>Anticipated Prior-Art Citations Across Patent Offices</span>
              </h3>
              <span className="text-xs text-[#637567]">IPO • USPTO • EPO • TKDL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.prior_art_landscape.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-[#e2dbce] bg-[#f9f7f2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#144226] bg-[#eef4ef] px-2 py-0.5 rounded border border-[#d6e5d8]">
                      {item.office_or_database}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#66501c]">
                      Ref: {item.reference_id}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1c2e22] line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#637567] pt-1">
                    <span>Relevance: <strong>{item.relevance_type}</strong></span>
                    <span className="font-mono font-semibold text-[#802f1a]">{item.similarity_score}% Match</span>
                  </div>
                  <p className="text-[11px] text-[#556758] pt-1 border-t border-[#eae3d5]">
                    {item.risk_summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Claim Restructuring Strategy */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#eeeae0] pb-3">
              <h3 className="text-base font-bold font-heading text-[#14281c] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#144226]" />
                <span>Statutory Claim Restructuring Protocol</span>
              </h3>
              <span className="text-xs text-[#637567]">Drafted to avoid Section 3(i) & 3(p) rejections</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#f6f3eb] border border-[#ded6c3] space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#637567]">
                  Recommended Claim Architecture:
                </span>
                <p className="text-xs font-bold text-[#182c1f]">
                  {result.claim_restructuring_strategy.recommended_claim_type}
                </p>
                <p className="text-xs text-[#526356] pt-1">
                  {result.claim_restructuring_strategy.jurisdictional_adaptation}
                </p>
              </div>

              {/* Sample Independent Claim */}
              <div className="p-4 rounded-lg bg-white border border-[#ded6c3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#144226]">
                    INDEPENDENT CLAIM 1 (IPO & PCT COMPLIANT)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.claim_restructuring_strategy.sample_independent_claim, "claim1")}
                    className="inline-flex items-center gap-1 text-xs text-[#144226] font-semibold hover:underline"
                  >
                    {copiedKey === "claim1" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#144226]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Copy Claim</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono text-[#243528] bg-[#f9f7f3] p-3 rounded border border-[#eae3d5] leading-relaxed select-all">
                  {result.claim_restructuring_strategy.sample_independent_claim}
                </p>
              </div>

              {/* Sample Dependent Claim */}
              <div className="p-4 rounded-lg bg-white border border-[#ded6c3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#144226]">
                    DEPENDENT CLAIM 2 (STANDARDIZATION & HPLC TOLERANCE)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.claim_restructuring_strategy.sample_dependent_claim, "claim2")}
                    className="inline-flex items-center gap-1 text-xs text-[#144226] font-semibold hover:underline"
                  >
                    {copiedKey === "claim2" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#144226]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Copy Claim</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono text-[#243528] bg-[#f9f7f3] p-3 rounded border border-[#eae3d5] leading-relaxed select-all">
                  {result.claim_restructuring_strategy.sample_dependent_claim}
                </p>
              </div>
            </div>
          </div>

          {/* Prosecution Recommendations & Disclaimer */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-heading text-[#14281c] uppercase tracking-wider">
              Pre-Filing Prosecution Roadmap:
            </h3>
            <ul className="space-y-2">
              {result.prosecution_recommendations.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#3a4c3e]">
                  <span className="w-4 h-4 rounded-full bg-[#144226] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-[#eee7d8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[11px] text-[#6e7f72] max-w-2xl leading-relaxed">
                {result.disclaimer}
              </p>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg border border-[#c9c1b0] bg-[#f7f4ed] hover:bg-[#ede7db] text-[#1e3023] text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Audit Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
