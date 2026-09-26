"use client";

import React, { useState } from "react";
import { API_BASE_URL } from "../apiConfig";
import { Printer, AlertTriangle } from "lucide-react";

interface CompliancePillar {
  pillar_name: string;
  statutory_reference: string;
  status: string;
  risk_level: string;
  analysis: string;
  remedial_action: string;
}

interface DossierResponse {
  audit_id: string;
  generated_at: string;
  formulation_name: string;
  applicant_name: string;
  applicant_type: string;
  overall_ip_score: number;
  executive_verdict: string;
  recommended_pathway: string;
  pillars: CompliancePillar[];
  nba_statutory_form: string;
  dmra_prohibited_claims_flagged: string[];
  timeline_estimate: string;
  filing_checklist: string[];
  official_disclaimer: string;
}

export default function DossierPage() {
  const [formulationName, setFormulationName] = useState("Neuro-Rasayana Plus");
  const [applicantName, setApplicantName] = useState("AyuBiotech Innovations Ltd.");
  const [applicantType, setApplicantType] = useState("Indian Entity");
  const [indications, setIndications] = useState("Cognitive decline, Age-associated memory impairment");
  const [ingredients, setIngredients] = useState("Ashwagandha (Withania somnifera), Brahmi (Bacopa monnieri), Shankhpushpi (Convolvulus pluricaulis)");
  const [isClassical, setIsClassical] = useState(true);
  const [treatiseName, setTreatiseName] = useState("Charaka Samhita (Sutra Sthana Ch. 4)");
  const [hasSynergy, setHasSynergy] = useState(true);
  const [ciValue, setCiValue] = useState<number>(0.48);
  const [biologicalOrigin, setBiologicalOrigin] = useState("India");
  const [commercialClaims, setCommercialClaims] = useState("Supports memory retention and neural micro-circulation");

  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<DossierResponse | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dossier/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulation_name: formulationName,
          applicant_name: applicantName,
          applicant_type: applicantType,
          target_indications: indications.split(",").map((s) => s.trim()).filter(Boolean),
          ingredients: ingredients.split(",").map((s) => s.trim()).filter(Boolean),
          is_classical_source_cited: isClassical,
          classical_treatise_name: isClassical ? treatiseName : null,
          has_synergy_data: hasSynergy,
          combination_index: hasSynergy ? Number(ciValue) : null,
          biological_source_origin: biologicalOrigin,
          commercial_claims: commercialClaims.split("\n").map((s) => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDossier(data);
      }
    } catch (err) {
      console.error("Dossier generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner - hidden in print */}
      <div className="print:hidden rounded-2xl bg-gradient-to-br from-[#10291a] via-[#144226] to-[#0c2014] text-white p-6 sm:p-8 shadow-md border border-[#1b5230] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf9f4]/10 border border-[#fbf9f4]/20 text-[#eddcd2] text-xs font-mono uppercase tracking-wider">
            <span>5-Pillar Statutory Compliance</span>
            <span>•</span>
            <span>Indian Patent Office & AYUSH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading tracking-tight text-[#fbf9f4]">
            Official IP Due Diligence Audit Dossier
          </h1>
          <p className="text-sm sm:text-base text-[#d1ddcf] leading-relaxed">
            Generate an official audit report evaluating Section 3(p) TKDL prior art bar, Section 3(e) Synergism, 
            National Biodiversity Act (NBA) Section 6 Form III clearance, Rule 158B AYUSH licensing route, and Drugs & Magic Remedies Act advertising compliance.
          </p>
        </div>
      </div>

      {/* Input Form - hidden in print */}
      <form onSubmit={handleGenerate} className="print:hidden bg-[#faf8f2] border border-[#dcd4c3] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-[#e8e2d4] pb-3 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#10291a] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#144226]" />
            Formulation & Statutory Audit Parameters
          </h2>
          <span className="text-xs text-[#708075]">Regulatory Questionnaire</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">Formulation Name</label>
            <input 
              type="text" 
              value={formulationName}
              onChange={(e) => setFormulationName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">Applicant / Entity Name</label>
            <input 
              type="text" 
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">Applicant Entity Type</label>
            <select
              value={applicantType}
              onChange={(e) => setApplicantType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            >
              <option value="Indian Entity">Indian Entity (DPIIT Startup / MSME)</option>
              <option value="Foreign Entity">Foreign Entity (Section 3 NBA applies)</option>
              <option value="NRI / Non-Resident">NRI / Foreign Collaboration</option>
              <option value="Academic Institute">Academic / Government Institute</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">Target Indications (Comma-separated)</label>
            <input 
              type="text" 
              value={indications}
              onChange={(e) => setIndications(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">Ingredients (Herbs / Active Markers)</label>
            <input 
              type="text" 
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            />
          </div>
        </div>

        {/* Checkboxes for Classical & Synergy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-[#d8d1c1]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isClassical"
                checked={isClassical}
                onChange={(e) => setIsClassical(e.target.checked)}
                className="w-4 h-4 rounded text-[#144226]"
              />
              <label htmlFor="isClassical" className="text-xs font-semibold text-[#1c2d22]">
                Formulation Cited from Classical First Schedule Treatise
              </label>
            </div>
            {isClassical && (
              <input
                type="text"
                value={treatiseName}
                onChange={(e) => setTreatiseName(e.target.value)}
                placeholder="e.g. Charaka Samhita or Sushruta Samhita"
                className="w-full px-2.5 py-1.5 text-xs border border-[#cfc6b2] rounded-md"
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasSynergy"
                checked={hasSynergy}
                onChange={(e) => setHasSynergy(e.target.checked)}
                className="w-4 h-4 rounded text-[#144226]"
              />
              <label htmlFor="hasSynergy" className="text-xs font-semibold text-[#1c2d22]">
                Experimental Synergy / CI Data Available
              </label>
            </div>
            {hasSynergy && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600">Combination Index (CI):</span>
                <input
                  type="number"
                  step="0.01"
                  value={ciValue}
                  onChange={(e) => setCiValue(parseFloat(e.target.value) || 0.5)}
                  className="w-24 px-2 py-1 text-xs border border-[#cfc6b2] rounded-md font-mono"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">Biological Resource Geographic Provenance</label>
            <select
              value={biologicalOrigin}
              onChange={(e) => setBiologicalOrigin(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            >
              <option value="India">India (Territorial Biodiversity - Section 6 NBA Applies)</option>
              <option value="Outside India">Outside India (Imported with CITES / Phytosanitary Proof)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#46574c] mb-1">Commercial / Packaging Claims</label>
            <input 
              type="text" 
              value={commercialClaims}
              onChange={(e) => setCommercialClaims(e.target.value)}
              placeholder="e.g. Supports healthy memory"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfc6b2] rounded-lg"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#144226] text-white font-semibold text-sm hover:bg-[#0e311c] disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Generating Statutory Dossier..." : "Generate Official Due Diligence Audit Dossier"}
        </button>
      </form>

      {/* Generated Dossier Document */}
      {dossier && (
        <div className="space-y-6">
          <div className="print:hidden flex items-center justify-between bg-[#f4efe4] p-4 rounded-xl border border-[#ded4c1]">
            <span className="text-xs font-semibold text-[#44564a]">
              Official Dossier Ready for Filing & Review: <strong>{dossier.audit_id}</strong>
            </span>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#144226] text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-[#0e311c] flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Export PDF Dossier
            </button>
          </div>

          {/* Printable Formal Dossier Sheet */}
          <div className="bg-white border-2 border-stone-800 rounded-xl p-8 sm:p-12 shadow-sm space-y-8 text-stone-900 font-serif relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-9xl font-black font-sans uppercase select-none rotate-[-25deg]">
              AYURITH AUDIT
            </div>

            {/* Document Header */}
            <div className="border-b-2 border-stone-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
              <div>
                <div className="text-xs tracking-widest font-mono text-stone-500 uppercase">
                  AYURITH IP-SHAKTI SAHAYAK • DUE DILIGENCE DOSSIER
                </div>
                <h2 className="text-2xl font-bold font-heading text-stone-950 mt-1">
                  OFFICIAL STATUTORY IP AUDIT REPORT
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Pursuant to The Patents Act, 1970; The Drugs & Cosmetics Act, 1940; Biological Diversity Act, 2002
                </p>
              </div>

              <div className="text-right font-mono text-xs text-stone-600 space-y-1">
                <div><strong>Dossier Ref:</strong> {dossier.audit_id}</div>
                <div><strong>Date & Timestamp:</strong> {dossier.generated_at}</div>
                <div><strong>Jurisdiction:</strong> Republic of India (IPO / AYUSH / NBA)</div>
              </div>
            </div>

            {/* Executive Summary & Score Block */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-stone-50 p-6 rounded-xl border border-stone-300 font-sans">
              <div className="md:col-span-8 space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold text-stone-500">Executive Statutory Determination</span>
                <h3 className="text-lg font-bold text-stone-900">{dossier.executive_verdict}</h3>
                <div className="text-xs text-stone-700 space-y-1">
                  <div><strong>Formulation:</strong> {dossier.formulation_name}</div>
                  <div><strong>Applicant:</strong> {dossier.applicant_name} ({dossier.applicant_type})</div>
                  <div><strong>Primary Regulatory Pathway:</strong> <span className="text-[#144226] font-semibold">{dossier.recommended_pathway}</span></div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-stone-300 shadow-2xs text-center">
                <div className={`text-4xl font-black font-heading ${
                  dossier.overall_ip_score >= 80 ? "text-emerald-700" : dossier.overall_ip_score >= 60 ? "text-amber-700" : "text-red-700"
                }`}>
                  {dossier.overall_ip_score}/100
                </div>
                <div className="text-xs font-bold uppercase text-stone-600 mt-1">Composite IP Score</div>
                <div className="text-[10px] text-stone-400">Section 3(p) • 3(e) • NBA • 158B</div>
              </div>
            </div>

            {/* 5 Statutory Pillars Detailed Breakdown */}
            <div className="space-y-4 font-sans">
              <h3 className="text-base font-bold text-stone-950 uppercase tracking-wider border-b border-stone-300 pb-2">
                Statutory Pillar-by-Pillar Due Diligence Findings
              </h3>

              <div className="space-y-3">
                {dossier.pillars.map((pillar, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-300 bg-stone-50/60 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-stone-700" />
                        {pillar.pillar_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-stone-500">{pillar.statutory_reference}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pillar.status === "PASS" ? "bg-emerald-100 text-emerald-900 border border-emerald-300" :
                          pillar.status === "WARNING" ? "bg-amber-100 text-amber-900 border border-amber-300" :
                          pillar.status === "FAIL" ? "bg-red-100 text-red-900 border border-red-300" :
                          "bg-blue-100 text-blue-900 border border-blue-300"
                        }`}>
                          {pillar.status} • {pillar.risk_level} RISK
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-800 leading-relaxed">
                      {pillar.analysis}
                    </p>

                    <div className="text-xs bg-white p-2.5 rounded border border-stone-200 text-stone-900">
                      <strong>Mandated Remedial Action:</strong> {pillar.remedial_action}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prohibited DMRA Flagging */}
            {dossier.dmra_prohibited_claims_flagged.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-300 font-sans space-y-2">
                <div className="font-bold text-xs text-red-950 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>Drugs and Magic Remedies Act (DMRA) Violations Detected:</span>
                </div>
                <ul className="text-xs text-red-900 space-y-1">
                  {dossier.dmra_prohibited_claims_flagged.map((flag, idx) => (
                    <li key={idx} className="font-mono">{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Filing Sequence Checklist */}
            <div className="space-y-3 font-sans">
              <h3 className="text-base font-bold text-stone-950 uppercase tracking-wider border-b border-stone-300 pb-2">
                Mandatory Statutory Filing Checklist & Timeline
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5 bg-stone-50 p-4 rounded-xl border border-stone-300">
                  <span className="font-bold text-stone-900 uppercase tracking-wider block">Procedural Sequence:</span>
                  {dossier.filing_checklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-stone-400">{idx + 1}.</span>
                      <span className="text-stone-800">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-300 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-stone-900 uppercase tracking-wider block">Estimated Prosecution Timeline:</span>
                    <p className="text-stone-800 mt-1">{dossier.timeline_estimate}</p>
                  </div>
                  <div className="pt-3 border-t border-stone-200">
                    <span className="font-bold text-stone-900 uppercase tracking-wider block">NBA Mandate:</span>
                    <p className="text-stone-800 mt-0.5">{dossier.nba_statutory_form}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign-off & Disclaimer */}
            <div className="pt-6 border-t-2 border-stone-900 text-[11px] text-stone-500 font-sans space-y-4">
              <p className="leading-relaxed">
                <strong>Legal Certification Notice:</strong> {dossier.official_disclaimer}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-stone-200">
                <div className="space-y-1">
                  <div className="font-mono font-bold text-stone-800">AYURITH ALGORITHMIC VERIFICATION ENGINE</div>
                  <div className="text-[10px] text-stone-400">Cryptographically Generated Audit Token: {dossier.audit_id}</div>
                </div>
                <div className="border border-stone-400 px-4 py-2 text-center rounded bg-stone-50">
                  <div className="font-bold text-stone-900 uppercase text-[10px] tracking-wider">OFFICIAL AUDIT SEAL</div>
                  <div className="text-[9px] text-stone-500">IP-SHAKTI SAHAYAK • INDIA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
