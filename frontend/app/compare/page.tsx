"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";
import { 
  FileText, 
  Check, 
  Scale, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Printer, 
  GitCompare, 
  ShieldCheck, 
  Plus, 
  Trash2,
  BookOpen,
  Info
} from "lucide-react";

interface FormulationIngredient {
  name: string;
  botanical_name?: string;
  part_used?: string;
  percentage_or_parts: number;
  standardized_marker?: string;
}

interface FormulationProfile {
  formulation_id: string;
  formulation_name: string;
  formulation_type: string;
  dosage_form: string;
  reference_source?: string;
  ingredients: FormulationIngredient[];
}

interface IngredientDiffRow {
  ingredient_name: string;
  botanical_name: string;
  part_used: string;
  presence_matrix: Record<string, boolean>;
  proportions: Record<string, number | null>;
  standardized_markers: Record<string, string | null>;
  concordance_type: string;
}

interface RegulatoryDivergenceItem {
  formulation_id: string;
  formulation_name: string;
  formulation_type: string;
  ayush_licensing_pathway: string;
  clinical_trial_requirement: string;
  patentability_status: string;
  tkdl_status: string;
  infringement_or_objection_risk: string;
}

interface CompareResponse {
  comparison_id: string;
  generated_at: string;
  title: string;
  formulations_overview: any[];
  ingredient_concordance_matrix: IngredientDiffRow[];
  total_unique_ingredients: number;
  common_core_ingredients: string[];
  dosage_and_bioavailability_diff: any;
  regulatory_divergence_matrix: RegulatoryDivergenceItem[];
  statutory_verdict_summary: string;
  disclaimer: string;
}

export default function ComparePage() {
  const [presets, setPresets] = useState<any[]>([]);
  const [auditTitle, setAuditTitle] = useState("Polyherbal Formulation Comparative Audit");
  const [formulations, setFormulations] = useState<FormulationProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResponse | null>(null);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/compare/presets`);
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
        if (data.length > 0) {
          loadPreset(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPreset = (preset: any) => {
    setAuditTitle(preset.title);
    setFormulations(preset.formulations);
    runCompareWithData(preset.title, preset.formulations);
  };

  const runCompareWithData = async (title: string, forms: FormulationProfile[]) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/compare/formulations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          formulations: forms
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCompare = () => {
    runCompareWithData(auditTitle, formulations);
  };

  const updateFormulationMeta = (idx: number, field: keyof FormulationProfile, val: any) => {
    const updated = [...formulations];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormulations(updated);
  };

  const addIngredient = (formIdx: number) => {
    const updated = [...formulations];
    updated[formIdx].ingredients.push({
      name: "",
      botanical_name: "",
      part_used: "",
      percentage_or_parts: 10,
      standardized_marker: "Unstandardized"
    });
    setFormulations(updated);
  };

  const removeIngredient = (formIdx: number, ingIdx: number) => {
    const updated = [...formulations];
    updated[formIdx].ingredients = updated[formIdx].ingredients.filter((_, i) => i !== ingIdx);
    setFormulations(updated);
  };

  const updateIngredient = (formIdx: number, ingIdx: number, field: keyof FormulationIngredient, val: any) => {
    const updated = [...formulations];
    updated[formIdx].ingredients[ingIdx] = {
      ...updated[formIdx].ingredients[ingIdx],
      [field]: val
    };
    setFormulations(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-[#fcfbf9] border border-[#e5e0d5] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f2eee3] text-[#70531c] text-xs font-semibold tracking-wide border border-[#ded5c0]">
              <GitCompare className="w-3.5 h-3.5" />
              <span>Polyherbal Stoichiometry & Regulatory Diff</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#14281c]">
              Polyherbal Formulation Comparative Diff Engine
            </h1>
            <p className="text-sm text-[#4d5f52] max-w-3xl leading-relaxed">
              Multi-dimensional side-by-side analysis of botanical recipes (Classical First Schedule vs Proprietary ASU vs Patented NDDS).
              Audits ingredient concordance, biomarker concentration variances, and regulatory divergence under Rule 158B vs Patent Section 3.
            </p>
          </div>
        </div>

        {/* Presets */}
        {presets.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#ede8de]">
            <p className="text-xs font-semibold text-[#5a6c5f] uppercase tracking-wider mb-2.5">
              Load Preset Multi-Formulation Diff Benchmarks:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPreset(p)}
                  className="text-left p-3 rounded-lg border border-[#ded7c8] bg-[#f9f7f1] hover:bg-[#ede7da] text-[#1c3022] transition-colors"
                >
                  <p className="text-xs font-bold line-clamp-1">{p.title}</p>
                  <p className="text-[11px] text-[#637567] mt-0.5">{p.formulations.length} Formulations in Matrix</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Formulation Editor Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-heading text-[#14281c] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#144226]" />
            <span>Formulation Parameters Under Comparison ({formulations.length})</span>
          </h2>
          <button
            onClick={handleRunCompare}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-[#144226] hover:bg-[#0e311c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Running Diff Engine...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-3.5 h-3.5" />
                <span>Execute Comparative Diff</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formulations.map((form, fIdx) => (
            <div key={form.formulation_id} className="p-4 rounded-xl border border-[#ded7c8] bg-[#fdfcf9] space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#eee8dc]">
                <span className="text-xs font-mono font-bold text-[#144226] px-2 py-0.5 rounded bg-[#f0f4f0] border border-[#d6e3d8]">
                  Formulation {String.fromCharCode(65 + fIdx)}
                </span>
                <span className="text-[11px] text-[#647669] font-medium truncate max-w-[120px]">
                  {form.dosage_form}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4d5f52] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.formulation_name}
                  onChange={(e) => updateFormulationMeta(fIdx, "formulation_name", e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d8d1c2] bg-white text-[#14281c]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4d5f52] mb-1">
                  Regulatory Category
                </label>
                <select
                  value={form.formulation_type}
                  onChange={(e) => updateFormulationMeta(fIdx, "formulation_type", e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d8d1c2] bg-white text-[#14281c]"
                >
                  <option value="Classical Ayurvedic (First Schedule)">Classical Ayurvedic (First Schedule)</option>
                  <option value="Proprietary ASU Product">Proprietary ASU Product</option>
                  <option value="Patented / NDDS Formulation">Patented / NDDS Formulation</option>
                </select>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2 pt-2 border-t border-[#eee8dc]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4d5f52]">
                    Ingredients ({form.ingredients.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => addIngredient(fIdx)}
                    className="text-[11px] font-semibold text-[#144226] hover:underline inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {form.ingredients.map((ing, iIdx) => (
                    <div key={iIdx} className="p-2 rounded border border-[#e4ded2] bg-[#f9f7f2] text-xs space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => updateIngredient(fIdx, iIdx, "name", e.target.value)}
                          placeholder="Herb name"
                          className="w-full text-[11px] px-1.5 py-0.5 rounded border border-[#d5cebf] bg-white font-semibold"
                        />
                        {form.ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeIngredient(fIdx, iIdx)}
                            className="text-[#852a1b] hover:text-[#501309] p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={ing.percentage_or_parts}
                          onChange={(e) => updateIngredient(fIdx, iIdx, "percentage_or_parts", Number(e.target.value))}
                          placeholder="%"
                          className="w-14 text-[10px] px-1 py-0.5 rounded border border-[#d5cebf] bg-white font-mono"
                        />
                        <input
                          type="text"
                          value={ing.standardized_marker || ""}
                          onChange={(e) => updateIngredient(fIdx, iIdx, "standardized_marker", e.target.value)}
                          placeholder="Standardized Marker"
                          className="w-full text-[10px] px-1.5 py-0.5 rounded border border-[#d5cebf] bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparative Diff Results Display */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Overview */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eeeae0]">
              <div>
                <span className="text-xs font-mono text-[#637567] tracking-wider uppercase">
                  Diff Reference: {result.comparison_id} • Evaluated: {result.generated_at}
                </span>
                <h3 className="text-xl font-heading font-bold text-[#14281c] mt-0.5">
                  {result.title}
                </h3>
                <p className="text-xs text-[#526356] mt-0.5">
                  {result.dosage_and_bioavailability_diff.analytical_observation}
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg border border-[#c9c1b0] bg-[#f7f4ed] hover:bg-[#ede7db] text-[#1e3023] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Diff Report</span>
              </button>
            </div>

            {/* Common Core Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4d5f52]">
                Universal Core Botanicals:
              </span>
              {result.common_core_ingredients.length > 0 ? (
                result.common_core_ingredients.map((c, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#e3ece5] text-[#144226] font-bold border border-[#cddcd0]"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#6e7f72] italic">
                  No single herb shared identically across all formulations (Distinct novel variations).
                </span>
              )}
            </div>
          </div>

          {/* Cross-Formulation Ingredient Concordance Matrix */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeae0] pb-3">
              <h3 className="text-base font-bold font-heading text-[#14281c] flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-[#144226]" />
                <span>Cross-Formulation Ingredient Concordance Matrix</span>
              </h3>
              <span className="text-xs text-[#637567]">
                {result.total_unique_ingredients} Unique Botanical Entities
              </span>
            </div>

            <div className="border border-[#e2dbce] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0ece1] text-[#334438] font-bold border-b border-[#e2dbce]">
                  <tr>
                    <th className="p-3">Botanical Entity</th>
                    <th className="p-3">Concordance Type</th>
                    {formulations.map((f, idx) => (
                      <th key={f.formulation_id} className="p-3">
                        <span className="block font-bold text-[#144226]">
                          Formulation {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="block font-normal text-[10px] text-[#556759] truncate max-w-[120px]">
                          {f.formulation_name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee8dc]">
                  {result.ingredient_concordance_matrix.map((row, idx) => {
                    const isUniversal = row.concordance_type === "Universal Core Ingredient";
                    const isUnique = row.concordance_type === "Unique Novel Component";
                    return (
                      <tr key={idx} className="hover:bg-[#fbf9f5]">
                        <td className="p-3">
                          <span className="font-bold text-[#14281c] block">{row.ingredient_name}</span>
                          <span className="italic text-[11px] text-[#4d5f52]">{row.botanical_name}</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isUniversal
                                ? "bg-[#e0ece2] text-[#144226]"
                                : isUnique
                                ? "bg-[#faedd0] text-[#7a5a19]"
                                : "bg-[#ede8db] text-[#47574b]"
                            }`}
                          >
                            {row.concordance_type}
                          </span>
                        </td>
                        {formulations.map((f) => {
                          const present = row.presence_matrix[f.formulation_id];
                          const prop = row.proportions[f.formulation_id];
                          const marker = row.standardized_markers[f.formulation_id];
                          return (
                            <td key={f.formulation_id} className="p-3">
                              {present ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-[#144226] font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{prop}%</span>
                                  </div>
                                  <span className="text-[11px] text-[#59695d] block leading-tight">
                                    {marker}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-[#a39c8f] font-mono">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulatory & Statutory Divergence Matrix */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeae0] pb-3">
              <h3 className="text-base font-bold font-heading text-[#14281c] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#144226]" />
                <span>Regulatory & Statutory Divergence Audit</span>
              </h3>
              <span className="text-xs text-[#637567]">Rule 158B vs Section 3(p) / 3(e)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.regulatory_divergence_matrix.map((reg) => (
                <div key={reg.formulation_id} className="p-4 rounded-xl border border-[#ded7c8] bg-[#f9f7f2] space-y-3">
                  <div className="pb-2 border-b border-[#eee6d7]">
                    <span className="text-xs font-bold text-[#14281c] block">
                      {reg.formulation_name}
                    </span>
                    <span className="text-[11px] text-[#637567]">
                      {reg.formulation_type}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-[#2a3c30] block">AYUSH Licensing Pathway:</span>
                      <p className="text-[#495b4e] mt-0.5">{reg.ayush_licensing_pathway}</p>
                    </div>

                    <div>
                      <span className="font-bold text-[#2a3c30] block">Clinical Trial Mandate:</span>
                      <p className="text-[#495b4e] mt-0.5">{reg.clinical_trial_requirement}</p>
                    </div>

                    <div>
                      <span className="font-bold text-[#2a3c30] block">Patentability Status:</span>
                      <p className="text-[#495b4e] mt-0.5">{reg.patentability_status}</p>
                    </div>

                    <div>
                      <span className="font-bold text-[#2a3c30] block">TKDL Prior Art Status:</span>
                      <p className="text-[#495b4e] mt-0.5">{reg.tkdl_status}</p>
                    </div>

                    <div className="pt-2 border-t border-[#eee6d7] text-[11px]">
                      <span className="font-semibold text-[#802f1a] block">Prosecution / Infringement Risk:</span>
                      <p className="text-[#556759] mt-0.5">{reg.infringement_or_objection_risk}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Verdict & Guidance */}
          <div className="bg-[#fcfbf9] border border-[#ded7c8] rounded-xl p-6 sm:p-7 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14281c]">
              Strategic Regulatory Verdict:
            </h4>
            <p className="text-xs text-[#3a4c3e] leading-relaxed">
              {result.statutory_verdict_summary}
            </p>
            <p className="text-[11px] text-[#6e7f72] pt-2 border-t border-[#eee6d7]">
              {result.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
