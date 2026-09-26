"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Scale } from "lucide-react";

interface Treatise {
  id: number;
  name_sanskrit: string;
  name_english: string;
  author: string;
  period: string;
  category: string;
  significance: string;
  key_formulations: string[];
  patent_tkdl_impact: string;
}

interface TreatiseStats {
  statutory_treatises_count: number;
  legal_basis: string;
  section_3p_applicability: string;
  categories: Record<string, number>;
}

interface VerifyResult {
  is_classical: boolean;
  matched_treatises: Array<{ id: number; name: string; category: string; impact: string }>;
  patent_bar_status: string;
  regulatory_recommendation: string;
}

export default function TreatisesPage() {
  const [treatises, setTreatises] = useState<Treatise[]>([]);
  const [stats, setStats] = useState<TreatiseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Verification simulator state
  const [verifyQuery, setVerifyQuery] = useState("");
  const [verifyBotanical, setVerifyBotanical] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    fetchStats();
    fetchTreatises();
  }, [selectedCategory]);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/treatises/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to load stats", e);
    }
  };

  const fetchTreatises = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "http://127.0.0.1:8000/api/treatises?";
      if (selectedCategory !== "all") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (search.trim()) {
        url += `search=${encodeURIComponent(search.trim())}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch treatises directory");
      const data = await res.json();
      setTreatises(data);
    } catch (err: any) {
      setError(err.message || "Could not retrieve treatises");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTreatises();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyQuery.trim() && !verifyBotanical.trim()) return;
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/treatises/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: verifyQuery,
          botanical_name: verifyBotanical
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyResult(data);
      }
    } catch (e) {
      console.error("Verification failed", e);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#10291a] via-[#144226] to-[#0c2014] text-white p-6 sm:p-8 shadow-md border border-[#1b5230] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf9f4]/10 border border-[#fbf9f4]/20 text-[#eddcd2] text-xs font-mono uppercase tracking-wider">
            <span>First Schedule</span>
            <span>•</span>
            <span>Drugs & Cosmetics Act, 1940</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading tracking-tight text-[#fbf9f4]">
            54 Classical Treatises of Ayurveda
          </h1>
          <p className="text-sm sm:text-base text-[#d1ddcf] leading-relaxed">
            Statutory codified compendia recognized under Section 3(a) and Rule 158B of the Drugs and Cosmetics Act, 1940.
            Every formulation, herb combination, and shloka within these texts forms absolute prior art under 
            <span className="text-amber-300 font-semibold"> Section 3(p) of the Patents Act, 1970</span>, while granting clinical safety study exemptions for AYUSH manufacturing licenses.
          </p>
        </div>
      </div>

      {/* Statutory Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#fbf9f4] border border-[#e5e0d5] rounded-xl p-4 shadow-2xs">
            <div className="text-2xl font-bold font-heading text-[#144226]">{stats.statutory_treatises_count}</div>
            <div className="text-xs font-semibold text-[#5c6e61]">Statutory Treatises</div>
            <div className="text-[11px] text-[#8c9c90] mt-1">First Schedule D&C Act</div>
          </div>
          <div className="bg-[#fbf9f4] border border-[#e5e0d5] rounded-xl p-4 shadow-2xs">
            <div className="text-2xl font-bold font-heading text-[#7a5a19]">{Object.keys(stats.categories).length}</div>
            <div className="text-xs font-semibold text-[#5c6e61]">Codified Classes</div>
            <div className="text-[11px] text-[#8c9c90] mt-1">Brihat-Trayi to Nighantus</div>
          </div>
          <div className="bg-[#fbf9f4] border border-[#e5e0d5] rounded-xl p-4 shadow-2xs">
            <div className="text-2xl font-bold font-heading text-[#802f1a]">Sec 3(p)</div>
            <div className="text-xs font-semibold text-[#5c6e61]">Traditional Knowledge Bar</div>
            <div className="text-[11px] text-[#8c9c90] mt-1">100% Anticipation Risk</div>
          </div>
          <div className="bg-[#fbf9f4] border border-[#e5e0d5] rounded-xl p-4 shadow-2xs">
            <div className="text-2xl font-bold font-heading text-[#1b5230]">Rule 158B</div>
            <div className="text-xs font-semibold text-[#5c6e61]">Manufacturing Exemption</div>
            <div className="text-[11px] text-[#8c9c90] mt-1">Form 25-D License Safe-Harbor</div>
          </div>
        </div>
      )}

      {/* Verification Simulator Tool */}
      <div className="bg-[#faf8f2] border border-[#dcd4c3] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8e2d4] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-heading text-[#10291a] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#144226]" />
              Classical Treatise Prior Art & Regulatory Verification Simulator
            </h2>
            <p className="text-xs text-[#637568]">
              Verify if an herbal drug, shloka, or formulation appears in the 54 First Schedule texts to determine patent bar vs AYUSH licensing.
            </p>
          </div>
          <span className="text-[11px] font-mono font-medium px-2 py-1 rounded bg-[#ece5d5] text-[#554625]">
            Statutory Verifier
          </span>
        </div>

        <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-[#46574c] mb-1">
              Formulation / Herb Name (e.g. Triphala, Ashwagandha, Chyawanprash)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Brahma Rasayana or Curcuma longa"
              value={verifyQuery}
              onChange={(e) => setVerifyQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#cfc6b2] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#144226]"
            />
          </div>
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-[#46574c] mb-1">
              Botanical Name (Optional)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Withania somnifera"
              value={verifyBotanical}
              onChange={(e) => setVerifyBotanical(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#cfc6b2] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#144226]"
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={verifyLoading || (!verifyQuery.trim() && !verifyBotanical.trim())}
              className="w-full py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg bg-[#144226] text-white hover:bg-[#0e311c] disabled:opacity-50 transition-all"
            >
              {verifyLoading ? "Verifying..." : "Verify Status"}
            </button>
          </div>
        </form>

        {verifyResult && (
          <div className={`mt-4 p-4 rounded-xl border ${verifyResult.is_classical ? "bg-amber-50/70 border-amber-200" : "bg-emerald-50/70 border-emerald-200"} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${verifyResult.is_classical ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"}`}>
                {verifyResult.is_classical ? "CLASSICAL CODIFIED MEDICINE DETECTED" : "NO DIRECT FIRST SCHEDULE ANTICIPATION"}
              </span>
              <span className="text-xs text-stone-500 font-mono">D&C Act 1940 First Schedule</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-stone-700">Patent Law Bar Status:</span>
                <p className="text-stone-800 bg-white/80 p-2.5 rounded-lg border border-stone-200">{verifyResult.patent_bar_status}</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-stone-700">AYUSH Regulatory Recommendation:</span>
                <p className="text-stone-800 bg-white/80 p-2.5 rounded-lg border border-stone-200">{verifyResult.regulatory_recommendation}</p>
              </div>
            </div>

            {verifyResult.matched_treatises.length > 0 && (
              <div className="pt-2 border-t border-amber-200/60">
                <span className="text-[11px] font-semibold text-amber-950 uppercase tracking-wider block mb-1">
                  Matched Statutory Treatises:
                </span>
                <div className="flex flex-wrap gap-2">
                  {verifyResult.matched_treatises.map((m) => (
                    <span key={m.id} className="text-xs bg-white px-2.5 py-1 rounded-md border border-amber-300 font-medium text-amber-950 shadow-2xs">
                      #{m.id} {m.name} ({m.category})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {["all", "Brihat-Trayi", "Laghu-Trayi", "Therapeutic Compendia", "Regional Compendia", "Rasa Shastra", "Statutory Pharmacopoeia"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#144226] text-white shadow-2xs"
                  : "bg-[#f4efe4] text-[#4d5e53] hover:bg-[#e9e2d3]"
              }`}
            >
              {cat === "all" ? "All Treatises" : cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 min-w-[260px]">
          <input
            type="text"
            placeholder="Search treatise, author, herb..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow px-3 py-1.5 text-xs bg-white border border-[#cfc6b2] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#144226]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#144226] text-white hover:bg-[#0e311c]"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Treatise Cards Grid */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="inline-block w-8 h-8 border-3 border-[#144226] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#637568]">Loading codified classical treatises...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#637568] px-1">
            <span>Showing <strong>{treatises.length}</strong> treatises</span>
            <span>First Schedule Drugs & Cosmetics Act, 1940</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatises.map((t) => (
              <div 
                key={t.id} 
                className="bg-[#fcfaf5] border border-[#e2dcd0] hover:border-[#b8c9bc] rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#e8ede9] text-[#144226] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {t.id}
                      </span>
                      <div>
                        <h3 className="font-heading font-bold text-sm sm:text-base text-[#10291a] leading-tight">
                          {t.name_english}
                        </h3>
                        <p className="text-xs text-[#705622] font-serif">{t.name_sanskrit}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#f0eae0] text-[#554625] shrink-0">
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#526457] pt-1">
                    <span><strong>Author:</strong> {t.author}</span>
                    <span>•</span>
                    <span><strong>Period:</strong> {t.period}</span>
                  </div>

                  <p className="text-xs text-[#384a3f] leading-relaxed">
                    {t.significance}
                  </p>

                  {t.key_formulations.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-[#5c6e61] uppercase tracking-wider block">
                        Landmark Classical Formulations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.key_formulations.map((f, idx) => (
                          <span key={idx} className="text-[11px] bg-white border border-[#dfd7c7] px-2 py-0.5 rounded text-[#2a3c30]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#eee8db] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#802f1a]">
                    <Scale className="w-3.5 h-3.5 text-[#802f1a]" />
                    <span>Patent & TKDL Defense Impact:</span>
                  </div>
                  <p className="text-[11px] text-[#48332b] bg-[#fbf5f2] p-2 rounded border border-[#edd7cd] leading-normal">
                    {t.patent_tkdl_impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
