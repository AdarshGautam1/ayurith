"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ArrowRight, 
  Scale, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  FileCheck2, 
  ExternalLink,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [queryInput, setQueryInput] = useState("");
  const [selectedPathway, setSelectedPathway] = useState<"classical" | "proprietary" | "patent">("classical");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<"india" | "international">("india");
  const [activeCaseStudy, setActiveCaseStudy] = useState<number | null>(0);

  const sampleQueries = [
    {
      label: "Section 3(p) TKDL Bar",
      query: "Can an aqueous extract of Withania somnifera and Piper longum overcome the Section 3(p) Traditional Knowledge patent bar?",
    },
    {
      label: "Rule 158B Licensing",
      query: "What safety and clinical trial requirements apply to an Ayurvedic Proprietary Medicine under Rule 158B?",
    },
    {
      label: "Classical vs. Proprietary",
      query: "Does adding microcrystalline cellulose excipients to Classical Triphala require a proprietary ASU license?",
    },
    {
      label: "EPO Article 56 Inventive Step",
      query: "How do EPO examiners evaluate inventive step for polyherbal formulations documented in Charaka Samhita?",
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(queryInput.trim())}`);
  };

  const handleSelectSample = (query: string) => {
    setQueryInput(query);
    router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex flex-col gap-16 py-4 text-[#1a251e]">
      
      {/* 1. Masthead & Executive Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[#dedad0] bg-gradient-to-b from-[#fbf9f4] via-[#f7f4ec] to-[#f2eee3] p-8 md:p-14 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#164428]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-[#c17f24]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-4xl">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md bg-[#e9e4d6] border border-[#d8d2c2] text-xs font-semibold tracking-wider uppercase text-[#1a402a] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1b5e34] animate-pulse"></span>
            Statutory Intelligence Engine • AYUSH & Patent Regulatory Framework
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[#10291a] tracking-tight leading-[1.12]">
            Evidence-Grounded IP & Regulatory Due Diligence for Ayurveda
          </h1>

          <p className="mt-5 text-lg md:text-xl text-[#3d4f43] leading-relaxed max-w-3xl">
            Navigate Section 3(p) Traditional Knowledge exclusions, verify Schedule 1 classical textual lineage, evaluate Rule 158B ASU licensing paths, and prepare defensible patent specifications with verbatim statutory grounding.
          </p>

          {/* Interactive Live Query Console */}
          <div className="mt-9 bg-white rounded-2xl border border-[#d6d0c2] p-3 md:p-4 shadow-md shadow-[#143320]/5">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c7d71]" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Enter formulation, active phytochemical, or statutory question (e.g. Ashwagandha Section 3(p)...)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-transparent bg-[#fbf9f5] focus:bg-white focus:border-[#1a5632] focus:ring-2 focus:ring-[#1a5632]/20 text-[#17261c] placeholder-[#79887e] text-sm md:text-base outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-[#144226] hover:bg-[#0f341d] active:scale-[0.99] text-[#f7f9f7] font-semibold text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                Analyze Statutory Scope
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Statutory Queries */}
            <div className="mt-3.5 pt-3 border-t border-[#f0ece1] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#6d7b71] font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#a87023]" /> Inquire Directly:
              </span>
              {sampleQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(item.query)}
                  className="px-2.5 py-1 rounded-md bg-[#f6f3eb] hover:bg-[#ede7d8] border border-[#e2dccf] text-[#2c3d31] transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Action Callouts */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/classifier"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#c9c2b1] hover:border-[#1a5632] text-[#144226] font-medium text-sm transition-all hover:shadow-sm"
            >
              <FileCheck2 className="w-4 h-4 text-[#1a5632]" />
              Formulation Category Classifier (5-Step Audit)
              <ChevronRight className="w-4 h-4 text-[#8a988e]" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent border border-transparent hover:bg-[#ebe5d6] text-[#36493c] font-medium text-sm transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#5c6e61]" />
              Open Full Regulatory Legal Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Institutional Framework Registry (Hard Metrics, Not Marketing Slop) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#dedad0] shadow-2xs">
          <div className="text-2xl md:text-3xl font-bold font-heading text-[#10291a]">54 Texts</div>
          <div className="text-xs font-semibold text-[#8a7238] uppercase tracking-wider mt-1">First Schedule Recognized</div>
          <p className="text-xs text-[#526357] mt-2 leading-relaxed">
            Statutory treatises under Drugs & Cosmetics Act, 1940 (Charaka, Sushruta, Ashtanga Hridaya, etc.).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#dedad0] shadow-2xs">
          <div className="text-2xl md:text-3xl font-bold font-heading text-[#10291a]">Section 3(p) & 3(e)</div>
          <div className="text-xs font-semibold text-[#8a7238] uppercase tracking-wider mt-1">The Patents Act, 1970</div>
          <p className="text-xs text-[#526357] mt-2 leading-relaxed">
            Dual statutory hurdles distinguishing mere traditional aggregation from proven synergistic therapeutic novelty.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#dedad0] shadow-2xs">
          <div className="text-2xl md:text-3xl font-bold font-heading text-[#10291a]">Rule 158B</div>
          <div className="text-xs font-semibold text-[#8a7238] uppercase tracking-wider mt-1">ASU Licensing Mandate</div>
          <p className="text-xs text-[#526357] mt-2 leading-relaxed">
            Safety study protocols and pilot clinical trials required for patent or proprietary Ayurvedic formulations.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#dedad0] shadow-2xs">
          <div className="text-2xl md:text-3xl font-bold font-heading text-[#10291a]">Zero Hallucination</div>
          <div className="text-xs font-semibold text-[#8a7238] uppercase tracking-wider mt-1">Strict Citation Protocol</div>
          <p className="text-xs text-[#526357] mt-2 leading-relaxed">
            Normalized cosine distance matching [0,1] with mandatory abstention when statutory proof is insufficient.
          </p>
        </div>
      </section>

      {/* 3. The Interactive Regulatory Pathway Navigator */}
      <section className="rounded-3xl border border-[#dedad0] bg-white p-6 md:p-10 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6d2b] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Decision Architecture
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#10291a] mt-1">
            Determine Your Formulation's Legal Status
          </h2>
          <p className="text-sm text-[#4c5d51] mt-2">
            The legal path for Ayurvedic formulations depends entirely on whether they follow classical authoritative treatises, introduce novel excipients/extracts, or claim synergistic clinical novelty.
          </p>
        </div>

        {/* Pathway Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-[#e8e4db] pb-4">
          <button
            onClick={() => setSelectedPathway("classical")}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              selectedPathway === "classical"
                ? "bg-[#144226] text-white shadow-xs font-semibold"
                : "bg-[#f5f2e9] text-[#36493c] hover:bg-[#eae5d8]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. Classical Ayurvedic Medicine
          </button>
          <button
            onClick={() => setSelectedPathway("proprietary")}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              selectedPathway === "proprietary"
                ? "bg-[#144226] text-white shadow-xs font-semibold"
                : "bg-[#f5f2e9] text-[#36493c] hover:bg-[#eae5d8]"
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Ayurvedic Patent / Proprietary (ASU)
          </button>
          <button
            onClick={() => setSelectedPathway("patent")}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              selectedPathway === "patent"
                ? "bg-[#144226] text-white shadow-xs font-semibold"
                : "bg-[#f5f2e9] text-[#36493c] hover:bg-[#eae5d8]"
            }`}
          >
            <Scale className="w-4 h-4" />
            3. Synergistic Patent Formulation
          </button>
        </div>

        {/* Detailed Breakdown for Selected Pathway */}
        <div className="mt-6 pt-2">
          {selectedPathway === "classical" && (
            <div className="grid md:grid-cols-3 gap-6 bg-[#fbf9f4] p-6 rounded-2xl border border-[#e8e2d4]">
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#144226] uppercase tracking-wide">Statutory Basis</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">Section 3(a) D&C Act</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  Manufactured exclusively in accordance with the formulae described in the authoritative books specified in the First Schedule of the Drugs and Cosmetics Act, 1940.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#8a681c] uppercase tracking-wide">Patentability Status</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">Non-Patentable (§ 3(p))</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  Strictly excluded under Section 3(p) of the Patents Act, 1970 as traditional knowledge. Attempted filings are routinely invalidated using TKDL citations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#2e5239] uppercase tracking-wide">Licensing & Regulatory Route</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">State SLA Form 25-D</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  Requires proof of classical textual citation. No animal toxicology or clinical safety studies mandated under Rule 158B.
                </p>
                <div className="pt-2">
                  <Link href="/classifier" className="text-xs font-semibold text-[#144226] inline-flex items-center gap-1 hover:underline">
                    Verify formulation in Classifier <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {selectedPathway === "proprietary" && (
            <div className="grid md:grid-cols-3 gap-6 bg-[#fbf9f4] p-6 rounded-2xl border border-[#e8e2d4]">
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#144226] uppercase tracking-wide">Statutory Basis</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">Section 3(h) & Rule 158B</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  Contains all ingredients listed in First Schedule texts, but prepared with altered ratios, novel excipients, standardized extracts, or modern dosage delivery forms.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#8a681c] uppercase tracking-wide">Evidence Burden</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">Safety & Trial Dossier</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  Rule 158B mandates published scientific literature or pilot clinical trial data for proof of effectiveness and acute oral toxicity studies.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#2e5239] uppercase tracking-wide">IP Protection Scope</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">Trademark & Trade Secret</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  While barred from conventional patents without synergy proof, formulations can be safeguarded via distinct brand marks, proprietary processing trade secrets, and SLA registrations.
                </p>
                <div className="pt-2">
                  <Link href="/classifier" className="text-xs font-semibold text-[#144226] inline-flex items-center gap-1 hover:underline">
                    Check Rule 158B Category <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {selectedPathway === "patent" && (
            <div className="grid md:grid-cols-3 gap-6 bg-[#fbf9f4] p-6 rounded-2xl border border-[#e8e2d4]">
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#144226] uppercase tracking-wide">Statutory Burden</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">Section 3(e) Synergism</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  Must demonstrate that the combination is not a mere aggregation of known herbal properties, but produces a surprising, statistically significant synergistic therapeutic effect.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#8a681c] uppercase tracking-wide">Mandatory NBA Clearance</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">Biological Diversity Act § 6</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  Prior approval of the National Biodiversity Authority (Form III) is an indispensable statutory prerequisite before the grant of any Indian patent based on Indian bio-resources.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#2e5239] uppercase tracking-wide">Filing Strategy</div>
                <h3 className="font-heading font-bold text-lg text-[#132c1c]">Comparative Efficacy Data</h3>
                <p className="text-xs text-[#4b5b50] leading-relaxed">
                  Experimental data comparing individual isolated herbs vs. the combination is mandatory to defeat Section 3(e) and Section 3(p) objections at the Indian Patent Office.
                </p>
                <div className="pt-2">
                  <Link href="/chat" className="text-xs font-semibold text-[#144226] inline-flex items-center gap-1 hover:underline">
                    Assess Section 3(e) in Assistant <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Dual Jurisdictional Separation Engine (India vs. International) */}
      <section className="rounded-3xl border border-[#dedad0] bg-[#fbf9f5] p-6 md:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6d2b] uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              Jurisdiction Intelligence
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#10291a] mt-1">
              Zero Cross-Contamination of Legal Regimes
            </h2>
            <p className="text-sm text-[#4c5d51] mt-2 max-w-2xl">
              Indian Ayush licensing and Indian Patent Office guidelines operate on fundamentally distinct principles compared to USPTO, EPO, and WIPO PCT national phase applications.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-[#eeeae0] border border-[#d9d3c5] self-start md:self-auto">
            <button
              onClick={() => setSelectedJurisdiction("india")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedJurisdiction === "india"
                  ? "bg-white text-[#144226] shadow-2xs"
                  : "text-[#55675b] hover:text-[#18261e]"
              }`}
            >
              Indian Legal Regime (IPO / AYUSH)
            </button>
            <button
              onClick={() => setSelectedJurisdiction("international")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedJurisdiction === "international"
                  ? "bg-white text-[#144226] shadow-2xs"
                  : "text-[#55675b] hover:text-[#18261e]"
              }`}
            >
              International Regime (PCT / USPTO / EPO)
            </button>
          </div>
        </div>

        {/* Dynamic Jurisdiction Comparison Matrix */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#e3ded2] bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#e8e4db]">
            
            <div className="p-6 space-y-3">
              <div className="text-xs font-bold text-[#8f6d2b] uppercase tracking-wider">
                {selectedJurisdiction === "india" ? "Exclusion Rule" : "Prior-Art Discovery"}
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#10291a]">
                {selectedJurisdiction === "india" ? "Section 3(p) Patent Act, 1970" : "TKDL Examiner Access Agreements"}
              </h3>
              <p className="text-xs text-[#526357] leading-relaxed">
                {selectedJurisdiction === "india"
                  ? "An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component is expressly not patentable."
                  : "WIPO, EPO, and USPTO patent examiners have direct non-disclosure access to CSIR's TKDL database (over 34 million pages of translated Sanskrit/Tamil/Urdu texts) for prior-art search."}
              </p>
              <div className="pt-2 text-xs font-medium text-[#1a5632] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedJurisdiction === "india" ? "Applies across all 4 Indian Patent Offices" : "Monitored by CSIR TKDL Unit"}
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-xs font-bold text-[#8f6d2b] uppercase tracking-wider">
                {selectedJurisdiction === "india" ? "Biological Compliance" : "Novelty & Inventive Step"}
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#10291a]">
                {selectedJurisdiction === "india" ? "National Biodiversity Act (NBA § 6)" : "EPC Article 56 / 35 U.S.C. 103"}
              </h3>
              <p className="text-xs text-[#526357] leading-relaxed">
                {selectedJurisdiction === "india"
                  ? "Section 6 mandates prior approval of the National Biodiversity Authority before applying for any IPR based on research or biological material obtained from India, with benefit sharing terms."
                  : "In foreign patent offices, traditional use in India can destroy novelty or demonstrate obviousness unless the specification claims specific novel extraction fractions or unexpected therapeutic mechanics."}
              </p>
              <div className="pt-2 text-xs font-medium text-[#1a5632] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedJurisdiction === "india" ? "Criminal penalties for non-compliance" : "Requires rigorous comparative assays"}
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-xs font-bold text-[#8f6d2b] uppercase tracking-wider">
                {selectedJurisdiction === "india" ? "Commercial Marketing Route" : "Regulatory Classification"}
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#10291a]">
                {selectedJurisdiction === "india" ? "Drugs & Cosmetics Rule 158B" : "Botanical Drug vs. Dietary Supplement"}
              </h3>
              <p className="text-xs text-[#526357] leading-relaxed">
                {selectedJurisdiction === "india"
                  ? "Manufacturing license issued by State Licensing Authority (SLA). Classical formulations require textual citations; Proprietary formulations require clinical safety/efficacy submissions."
                  : "In the US (FDA), botanical compositions are either marketed as Dietary Supplements under DSHEA without disease claims, or must undergo full botanical drug IND/NDA clinical phases."}
              </p>
              <div className="pt-2 text-xs font-medium text-[#1a5632] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedJurisdiction === "india" ? "Separate AYUSH regulatory hierarchy" : "Requires DSHEA / FDA compliance"}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Authentic Precedents & Legal Case Studies */}
      <section className="space-y-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6d2b] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            Landmark Precedents
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#10291a] mt-1">
            Historical Lessons in Ayurvedic Intellectual Property
          </h2>
          <p className="text-sm text-[#4c5d51] mt-2">
            Examining foundational disputes that shaped the intersection of traditional Ayurvedic science, modern patent specifications, and international prior-art revocation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "The Turmeric Patent Revocation",
              citation: "US Patent No. 5,401,504 (Revoked)",
              entity: "CSIR vs. University of Mississippi",
              summary: "A patent granted for the 'use of turmeric in wound healing' was formally revoked after CSIR submitted 32 documentary references from ancient Sanskrit treatises and Indian Journal of Medical Research.",
              takeaway: "Traditional knowledge documented in classical texts completely invalidates novelty claims under 35 U.S.C. 102."
            },
            {
              title: "The Neem Fungicidal Revocation",
              citation: "EPO Patent No. 0436257 (Revoked)",
              entity: "Opposition by India (Vandana Shiva et al.)",
              summary: "The European Patent Office revoked a patent on hydrophobic neem oil extracts for controlling plant fungi after opposition proved widespread traditional agricultural use in Indian villages.",
              takeaway: "EPO Article 56 (Inventive Step) cannot be satisfied if the biological utility is self-evident from historical indigenous practices."
            },
            {
              title: "Synergistic Polyherbal Allowance",
              citation: "IPO Section 3(e) Landmark Allowances",
              entity: "Contemporary ASU Innovators vs. IPO",
              summary: "Patents on polyherbal formulations are successfully granted only when applicants provide quantitative in-vitro/in-vivo synergy data showing a combination index significantly below 1.0.",
              takeaway: "Mere presence of classical herbs does not automatically bar patents if true pharmacological synergy is mathematically established."
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className={`rounded-2xl border p-6 transition-all ${
                activeCaseStudy === index 
                  ? "bg-white border-[#1a5632] shadow-md ring-1 ring-[#1a5632]/10" 
                  : "bg-[#fbf9f4] border-[#dedad0] hover:border-[#c9c2b1]"
              }`}
              onClick={() => setActiveCaseStudy(index)}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-[#8a7238] bg-[#f5efe2] px-2 py-0.5 rounded border border-[#e8dfcb]">
                  {item.citation}
                </span>
                <span className="text-[11px] font-medium text-[#65766a]">{item.entity}</span>
              </div>
              <h3 className="font-heading font-bold text-base text-[#10291a] mt-3">
                {item.title}
              </h3>
              <p className="text-xs text-[#526357] mt-2 leading-relaxed">
                {item.summary}
              </p>
              <div className="mt-4 pt-3 border-t border-[#f0ece1]">
                <div className="text-[11px] font-bold text-[#144226] uppercase tracking-wide">Key Precedent</div>
                <div className="text-xs text-[#34463a] font-medium mt-1">
                  {item.takeaway}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Technical Integrity & Safe Abstention Engine */}
      <section className="rounded-3xl border border-[#dcd7cb] bg-[#14281c] text-[#f2f6f3] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#2d7a4a]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#223d2d] border border-[#2d523c] text-xs font-semibold uppercase tracking-wider text-[#a4d4b4]">
            <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
            Regulatory Verification Guarantee
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mt-4">
            Grounded Citations. No Speculation. Confident Abstention.
          </h2>

          <p className="mt-3 text-sm md:text-base text-[#c0d1c5] leading-relaxed">
            Unlike general-purpose conversational LLMs that hallucinate section numbers or invent legal precedents, AyuRith enforces strict mathematical relevance thresholds over indexed statutory gazettes.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            <div className="bg-[#1b3425] p-5 rounded-2xl border border-[#264834]">
              <div className="text-sm font-bold text-[#e1ece4]">Cosine Distance Metric</div>
              <p className="text-xs text-[#a0b5a6] mt-2 leading-relaxed">
                Retrieval distances are normalized to [0,1] scores against ChromaDB embeddings, ensuring only high-fidelity statutory excerpts enter the context.
              </p>
            </div>

            <div className="bg-[#1b3425] p-5 rounded-2xl border border-[#264834]">
              <div className="text-sm font-bold text-[#e1ece4]">Verbatim Grounding</div>
              <p className="text-xs text-[#a0b5a6] mt-2 leading-relaxed">
                Every claim is anchored to exact Act sections, Rule clauses, or classical text references with confidence levels and source citations.
              </p>
            </div>

            <div className="bg-[#1b3425] p-5 rounded-2xl border border-[#264834]">
              <div className="text-sm font-bold text-[#e1ece4]">Principled Abstention</div>
              <p className="text-xs text-[#a0b5a6] mt-2 leading-relaxed">
                When statutory evidence is ambiguous or absent from the knowledge base, AyuRith explicitly refrains from guessing and advises expert consultation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Institutional Advisory & Facilitator Notice */}
      <section className="rounded-2xl border border-[#dedad0] bg-[#f8f6f0] p-6 text-xs text-[#526357] flex items-start gap-4">
        <Info className="w-5 h-5 text-[#8f6d2b] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[#14281c] uppercase tracking-wide">
            Statutory Research Notice & Professional Disclaimer
          </div>
          <p className="leading-relaxed">
            IP-SHAKTI Sahayak (AyuRith) is an algorithmic statutory analysis platform designed to support researchers, pharmaceutical manufacturers, and IP facilitators in navigating Ayurvedic regulatory regimes. Its findings are grounded directly in published acts and gazettes but do not constitute formal legal opinion or replace formal patent drafting by an Indian Patent Agent registered with the Office of the Controller General of Patents, Designs & Trade Marks (CGPDTM).
          </p>
        </div>
      </section>

    </div>
  );
}
