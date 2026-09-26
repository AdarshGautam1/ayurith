"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";
import { FileText, Check } from "lucide-react";

interface IngredientDose {
  name: string;
  botanical_name?: string;
  dose_in_combo: number;
  dose_alone_isoeffect: number;
  standardized_marker?: string;
}

interface DoseReductionIndex {
  ingredient: string;
  dri_value: number;
  interpretation: string;
}

interface SynergyResponse {
  formulation_name: string;
  therapeutic_indication: string;
  target_assay: string;
  combination_index: number;
  synergy_classification: string;
  is_statistically_synergistic: boolean;
  section_3e_compliance_status: string;
  section_3e_legal_verdict: string;
  dose_reduction_indices: DoseReductionIndex[];
  patentability_score: number;
  patent_claim_drafting: {
    claim_1_independent: string;
    claim_2_dependent_standardization: string;
    claim_3_dependent_formulation: string;
  };
  evidentiary_requirements: string[];
  audit_notes: string;
}

export default function SynergyPage() {
  const [presets, setPresets] = useState<any[]>([]);
  const [formulationName, setFormulationName] = useState("Curcuminoids + Piperine Bioavailability Complex");
  const [indication, setIndication] = useState("Anti-inflammatory & Osteoarthritis");
  const [assay, setAssay] = useState("Serum bioavailability Cmax & COX-2 enzymatic inhibition");
  const [observedEffect, setObservedEffect] = useState<number>(92.5);
  const [additiveEffect, setAdditiveEffect] = useState<number>(54.0);
  const [bioenhancer, setBioenhancer] = useState(true);

  const [ingredients, setIngredients] = useState<IngredientDose[]>([
    {
      name: "Standardized Curcumin",
      botanical_name: "Curcuma longa (Rhizome)",
      dose_in_combo: 500,
      dose_alone_isoeffect: 2000,
      standardized_marker: "95% Total Curcuminoids"
    },
    {
      name: "Standardized Piperine",
      botanical_name: "Piper nigrum (Fruit)",
      dose_in_combo: 5,
      dose_alone_isoeffect: 50,
      standardized_marker: "98% Pure Piperine"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SynergyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/synergy/presets`);
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
      }
    } catch (e) {
      console.error("Failed to load presets", e);
    }
  };

  const loadPreset = (p: any) => {
    setFormulationName(p.name);
    setIndication(p.indication);
    setAssay(p.assay);
    setObservedEffect(p.observed_effect_percentage);
    setAdditiveEffect(p.expected_additive_percentage);
    setBioenhancer(p.bioenhancer_present);
    setIngredients(p.ingredients);
    setResult(null);
  };

  const updateIngredient = (index: number, field: keyof IngredientDose, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addIngredient = () => {
    if (ingredients.length >= 5) return;
    setIngredients([
      ...ingredients,
      {
        name: `Herb ${ingredients.length + 1}`,
        botanical_name: "",
        dose_in_combo: 100,
        dose_alone_isoeffect: 300,
        standardized_marker: ""
      }
    ]);
  };

  const removeIngredient = (idx: number) => {
    if (ingredients.length <= 2) return;
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/synergy/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulation_name: formulationName,
          therapeutic_indication: indication,
          target_assay: assay,
          ingredients: ingredients,
          observed_effect_percentage: Number(observedEffect),
          expected_additive_percentage: Number(additiveEffect),
          bioenhancer_present: bioenhancer
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1b3d2b] via-[#144226] to-[#0d2616] text-white p-6 sm:p-8 shadow-md border border-[#235836] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf9f4]/10 border border-[#fbf9f4]/20 text-[#eddcd2] text-xs font-mono uppercase tracking-wider">
            <span>The Patents Act, 1970</span>
            <span>•</span>
            <span>Section 3(e) Non-Admixture Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading tracking-tight text-[#fbf9f4]">
            Section 3(e) Synergistic Polyherbal Evaluator
          </h1>
          <p className="text-sm sm:text-base text-[#d1ddcf] leading-relaxed">
            Section 3(e) bars combinations that are "mere admixtures resulting only in the aggregation of properties". 
            Prove quantitative super-additivity using the <span className="text-amber-300 font-semibold">Chou-Talalay Combination Index (CI)</span> method to defeat Section 3(e) objections and automatically draft compliant IPO patent claims.
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      {presets.length > 0 && (
        <div className="bg-[#fcfaf5] border border-[#e2dcd0] rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5c6e61] uppercase tracking-wider">
              Load Validated Research Benchmark:
            </span>
            <span className="text-[11px] text-[#8c9c90]">Chou-Talalay Reference Datasets</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => loadPreset(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  formulationName === p.name
                    ? "bg-[#144226] text-white border-[#144226] shadow-2xs"
                    : "bg-white text-[#384a3f] border-[#d8d0c0] hover:bg-[#f2ece0]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Input Form */}
      <form onSubmit={handleEvaluate} className="bg-[#faf8f2] border border-[#dcd4c3] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
        <div className="border-b border-[#e8e2d4] pb-3 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#10291a] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#144226]" />
            Polyherbal Formulation & Pharmacological Assay Inputs
          </h2>
          <span className="text-xs text-[#708075]">Isoeffect Ratio Model</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">
              Formulation Name
            </label>
            <input 
              type="text" 
              value={formulationName}
              onChange={(e) => setFormulationName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#144226]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">
              Therapeutic Indication
            </label>
            <input 
              type="text" 
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#144226]"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-[#46574c] mb-1">
              Target Pharmacological Assay
            </label>
            <input 
              type="text" 
              value={assay}
              onChange={(e) => setAssay(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#144226]"
            />
          </div>
        </div>

        {/* Ingredients Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#384a3f] uppercase tracking-wider">
              Active Botanical Components & Dose Matrix:
            </label>
            {ingredients.length < 5 && (
              <button
                type="button"
                onClick={addIngredient}
                className="text-xs font-semibold text-[#144226] hover:text-[#0e311c] bg-white border border-[#b8cbbd] px-2.5 py-1 rounded-md shadow-2xs"
              >
                + Add Component ({ingredients.length}/5)
              </button>
            )}
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="bg-white border border-[#d8d1c1] rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-[#5c6e61] mb-0.5">Component / Vernacular</label>
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                    required
                    placeholder="e.g. Curcumin"
                    className="w-full px-2.5 py-1.5 text-xs border border-[#d0c8b6] rounded-md"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-[#5c6e61] mb-0.5">Botanical Name (Optional)</label>
                  <input
                    type="text"
                    value={ing.botanical_name || ""}
                    onChange={(e) => updateIngredient(idx, "botanical_name", e.target.value)}
                    placeholder="e.g. Curcuma longa"
                    className="w-full px-2.5 py-1.5 text-xs border border-[#d0c8b6] rounded-md"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#5c6e61] mb-0.5">Dose in Combo (D₁)</label>
                  <input
                    type="number"
                    step="any"
                    value={ing.dose_in_combo}
                    onChange={(e) => updateIngredient(idx, "dose_in_combo", parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs border border-[#d0c8b6] rounded-md font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#5c6e61] mb-0.5">Isoeffect Alone (Dx₁)</label>
                  <input
                    type="number"
                    step="any"
                    value={ing.dose_alone_isoeffect}
                    onChange={(e) => updateIngredient(idx, "dose_alone_isoeffect", parseFloat(e.target.value) || 1)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs border border-[#d0c8b6] rounded-md font-mono"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between gap-1 pt-4 sm:pt-0">
                  <div className="text-[11px] font-mono text-[#7a5a19] bg-[#fbf5e6] px-2 py-1 rounded border border-[#edd7a6] w-full text-center">
                    DRI: {ing.dose_in_combo > 0 ? (ing.dose_alone_isoeffect / ing.dose_in_combo).toFixed(1) : 0}x
                  </div>
                  {ingredients.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="text-stone-400 hover:text-red-600 px-1 font-bold text-base"
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observed vs Additive and Bioenhancer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">
              Observed Combination Effect (%)
            </label>
            <input 
              type="number"
              step="0.1"
              value={observedEffect}
              onChange={(e) => setObservedEffect(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">
              Expected Mathematical Additive Effect (%)
            </label>
            <input 
              type="number"
              step="0.1"
              value={additiveEffect}
              onChange={(e) => setAdditiveEffect(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            />
          </div>
          <div className="flex items-center gap-3 pt-4 sm:pt-5">
            <input
              type="checkbox"
              id="bioenhancer"
              checked={bioenhancer}
              onChange={(e) => setBioenhancer(e.target.checked)}
              className="w-4 h-4 rounded text-[#144226] focus:ring-[#144226]"
            />
            <label htmlFor="bioenhancer" className="text-xs font-semibold text-[#25392d]">
              Contains Pharmacokinetic Bio-enhancer (e.g. Piperine / Trikatu)
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#144226] text-white font-semibold text-sm hover:bg-[#0e311c] disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Computing Chou-Talalay Combination Index..." : "Calculate Synergy & Generate Defensible Claims"}
        </button>
      </form>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Top Verdict Card */}
          <div className={`p-6 rounded-2xl border shadow-sm ${
            result.combination_index < 0.7 
              ? "bg-[#f4f8f5] border-[#b4d4bd]" 
              : result.combination_index < 1.0 
              ? "bg-[#fef9ee] border-[#eed5a1]" 
              : "bg-[#fdf3f2] border-[#f3beb8]"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
                    Chou-Talalay Equation Result
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    result.combination_index < 0.7 
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300" 
                      : result.combination_index < 1.0 
                      ? "bg-amber-100 text-amber-900 border border-amber-300" 
                      : "bg-red-100 text-red-900 border border-red-300"
                  }`}>
                    {result.section_3e_compliance_status}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-stone-900 mt-1">
                  CI = {result.combination_index} • {result.synergy_classification}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/80 border border-stone-200 rounded-xl p-3 text-center min-w-[110px]">
                  <div className="text-2xl font-black font-heading text-[#144226]">{result.patentability_score}/100</div>
                  <div className="text-[10px] uppercase font-semibold text-stone-500">Sec 3(e) Defensibility</div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed mt-4 bg-white/60 p-3 rounded-xl border border-black/5">
              <strong>Statutory Legal Assessment:</strong> {result.section_3e_legal_verdict}
            </p>

            {/* Dose Reduction Index (DRI) */}
            <div className="mt-4 pt-3 border-t border-black/10">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                Dose Reduction Index (DRI) Summary:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {result.dose_reduction_indices.map((dri, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs">
                    <div className="font-semibold text-stone-900">{dri.ingredient}</div>
                    <div className="text-amber-800 font-mono font-bold text-sm">DRI = {dri.dri_value}x</div>
                    <div className="text-[11px] text-stone-500">{dri.interpretation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patent Claims Drafting Box */}
          <div className="bg-[#faf8f2] border border-[#dcd4c3] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e2d4] pb-3">
              <div>
                <h3 className="text-base font-bold font-heading text-[#10291a] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#144226]" /> Defensible Indian Patent Office (IPO) Form 2 Patent Claims
                </h3>
                <p className="text-xs text-[#637568]">
                  Drafted strictly adhering to Section 3(e) non-admixture jurisprudence and Chou-Talalay quantitative thresholds.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#ece5d5] text-[#554625]">
                IPO Form 2
              </span>
            </div>

            <div className="space-y-4">
              {/* Claim 1 */}
              <div className="bg-white p-4 rounded-xl border border-[#d8d0c0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#144226] uppercase font-mono">
                    Claim 1 (Independent Synergistic Composition Claim)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.patent_claim_drafting.claim_1_independent, "claim1")}
                    className="text-xs bg-[#f4efe4] hover:bg-[#e7dfcf] text-[#334238] font-semibold px-2.5 py-1 rounded transition-colors"
                  >
                    {copiedKey === "claim1" ? "Copied!" : "Copy Claim"}
                  </button>
                </div>
                <p className="text-xs font-mono text-stone-800 leading-relaxed bg-[#fdfcf9] p-3 rounded border border-stone-200">
                  {result.patent_claim_drafting.claim_1_independent}
                </p>
              </div>

              {/* Claim 2 */}
              <div className="bg-white p-4 rounded-xl border border-[#d8d0c0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#144226] uppercase font-mono">
                    Claim 2 (Dependent Standardization & Active Markers Claim)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.patent_claim_drafting.claim_2_dependent_standardization, "claim2")}
                    className="text-xs bg-[#f4efe4] hover:bg-[#e7dfcf] text-[#334238] font-semibold px-2.5 py-1 rounded transition-colors"
                  >
                    {copiedKey === "claim2" ? "Copied!" : "Copy Claim"}
                  </button>
                </div>
                <p className="text-xs font-mono text-stone-800 leading-relaxed bg-[#fdfcf9] p-3 rounded border border-stone-200">
                  {result.patent_claim_drafting.claim_2_dependent_standardization}
                </p>
              </div>

              {/* Claim 3 */}
              <div className="bg-white p-4 rounded-xl border border-[#d8d0c0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#144226] uppercase font-mono">
                    Claim 3 (Dependent Dosage Form & Bioavailability Matrix)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.patent_claim_drafting.claim_3_dependent_formulation, "claim3")}
                    className="text-xs bg-[#f4efe4] hover:bg-[#e7dfcf] text-[#334238] font-semibold px-2.5 py-1 rounded transition-colors"
                  >
                    {copiedKey === "claim3" ? "Copied!" : "Copy Claim"}
                  </button>
                </div>
                <p className="text-xs font-mono text-stone-800 leading-relaxed bg-[#fdfcf9] p-3 rounded border border-stone-200">
                  {result.patent_claim_drafting.claim_3_dependent_formulation}
                </p>
              </div>
            </div>

            {/* Evidentiary Checklist */}
            <div className="mt-4 pt-4 border-t border-[#e5dfd2] space-y-2">
              <span className="text-xs font-bold text-[#44564a] uppercase tracking-wider block">
                Section 3(e) Patent Examination Evidentiary Submission Checklist:
              </span>
              <ul className="space-y-1.5 text-xs text-[#304135]">
                {result.evidentiary_requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
