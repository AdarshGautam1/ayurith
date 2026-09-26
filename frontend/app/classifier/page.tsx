"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "../apiConfig";
import { 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  RotateCcw, 
  FileText, 
  Scale, 
  ShieldAlert, 
  BookOpen, 
  ExternalLink 
} from "lucide-react";

export default function ClassifierPage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    q1: "", q2: "", q3: "", q4: "", q5: ""
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const stepsList = [
    { num: 1, title: "Classical Basis", desc: "First Schedule" },
    { num: 2, title: "Novelty", desc: "Non-classical herbs" },
    { num: 3, title: "Intended Use", desc: "Therapeutic vs. Food" },
    { num: 4, title: "Process", desc: "Proprietary method" },
    { num: 5, title: "Extraction", desc: "Purified isolates" }
  ];

  const handleSelect = (q: string, val: string) => {
    setAnswers(prev => ({ ...prev, [q]: val }));
    setTimeout(() => {
      if (step < 5) setStep(step + 1);
    }, 250);
  };

  const submitClassification = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, jurisdiction: "india", language: "en" })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence?.toUpperCase()) {
      case "HIGH":
        return "bg-[#14532d] text-[#f0fdf4] border-[#166534]";
      case "MEDIUM":
        return "bg-[#854d0e] text-[#fefce8] border-[#a16207]";
      case "LOW":
        return "bg-[#991b1b] text-[#fef2f2] border-[#b91c1c]";
      default:
        return "bg-[#3f3f46] text-[#fafafa] border-[#52525b]";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 text-[#1a251e]">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#e9e4d6] border border-[#d8d2c2] text-xs font-semibold uppercase tracking-wider text-[#1a402a] mb-2">
          <Layers className="w-3.5 h-3.5" />
          Statutory Categorization Protocol
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#10291a]">
          Ayurvedic Formulation Category Classifier
        </h1>
        <p className="text-sm text-[#4d5f52] mt-2 max-w-2xl leading-relaxed">
          Screen your product against the statutory provisions of the Drugs and Cosmetics Act, 1940 (Rule 158B) and The Patents Act, 1970 (Section 3(p) Traditional Knowledge exclusion).
        </p>
      </div>

      {!result ? (
        <div className="rounded-3xl border border-[#dedad0] bg-white p-6 md:p-10 shadow-sm">
          
          {/* Step Progress Bar */}
          <div className="grid grid-cols-5 gap-2 pb-8 border-b border-[#eeeae0] mb-8">
            {stepsList.map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div key={s.num} className="flex flex-col gap-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      isPast ? "bg-[#144226]" : isActive ? "bg-[#8a7238]" : "bg-[#e5e1d7]"
                    }`} 
                  />
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-[10px] font-mono font-bold ${
                      isActive ? "text-[#8a7238]" : isPast ? "text-[#144226]" : "text-[#8c9c91]"
                    }`}>
                      0{s.num}
                    </span>
                    <span className={`hidden sm:inline text-xs font-medium truncate ${
                      isActive ? "text-[#10291a] font-semibold" : "text-[#65766a]"
                    }`}>
                      {s.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Question View */}
          <div className="min-h-[240px] flex flex-col justify-center">
            {step === 1 && (
              <QuestionBlock 
                stepNum={1}
                question="Is the formulation described precisely in an authoritative classical treatise (First Schedule of Drugs & Cosmetics Act, 1940)?"
                subtext="Examples include Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Bhavaprakasha, or Sharangadhara Samhita."
                options={["Yes", "No", "Unsure"]}
                onSelect={(v) => handleSelect("q1", v)}
                selected={answers.q1}
              />
            )}
            {step === 2 && (
              <QuestionBlock 
                stepNum={2}
                question="Does the product contain novel botanical or synthetic ingredients not documented in classical texts?"
                subtext="Includes herbs from non-Indian pharmacopoeias, synthetic additives, or modern chemical excipients."
                options={["Yes", "No", "Unsure"]}
                onSelect={(v) => handleSelect("q2", v)}
                selected={answers.q2}
              />
            )}
            {step === 3 && (
              <QuestionBlock 
                stepNum={3}
                question="What is the primary intended therapeutic and commercial classification?"
                subtext="This determines whether licensing falls under State AYUSH Licensing (Rule 158B) or FSSAI (Ayurveda-Aahar regulations)."
                options={["Therapeutic", "Health supplement / wellness", "Food / dietary", "Cosmetic"]}
                onSelect={(v) => handleSelect("q3", v)}
                selected={answers.q3}
              />
            )}
            {step === 4 && (
              <QuestionBlock 
                stepNum={4}
                question="Are you utilizing a proprietary or modified manufacturing process?"
                subtext="E.g., supercritical fluid extraction (SCFE), microwave-assisted extraction, or non-classical hydroalcoholic ratios."
                options={["Yes", "No", "Unsure"]}
                onSelect={(v) => handleSelect("q4", v)}
                selected={answers.q4}
              />
            )}
            {step === 5 && (
              <QuestionBlock 
                stepNum={5}
                question="Does the formulation involve standardized active phytochemical isolates (e.g. 95% pure withanolides or curcuminoids)?"
                subtext="Isolating single chemical entities moves products toward Phytopharmaceutical or New Chemical Entity (NCE) frameworks."
                options={["Yes", "No", "Unsure"]}
                onSelect={(v) => handleSelect("q5", v)}
                selected={answers.q5}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-5 border-t border-[#ede9df]">
            <button 
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#546559] hover:bg-[#f2eee3] disabled:opacity-30 disabled:cursor-not-allowed transition-all" 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Back
            </button>
            
            {step === 5 ? (
              <button 
                className="px-6 py-2.5 rounded-xl bg-[#144226] hover:bg-[#0e311c] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50" 
                onClick={submitClassification}
                disabled={!answers.q5 || loading}
              >
                {loading ? "Analyzing Statutory Corpus..." : "Generate Classification Dossier"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button 
                className="px-5 py-2.5 rounded-xl bg-[#144226] hover:bg-[#0e311c] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50" 
                onClick={() => setStep(step + 1)}
                disabled={!answers[`q${step}` as keyof typeof answers]}
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <ResultView 
          result={result} 
          onReset={() => {
            setResult(null); 
            setStep(1); 
            setAnswers({q1:"",q2:"",q3:"",q4:"",q5:""});
          }} 
          getConfidenceBadge={getConfidenceBadge}
        />
      )}
    </div>
  );
}

function QuestionBlock({ 
  stepNum, 
  question, 
  subtext, 
  options, 
  onSelect, 
  selected 
}: { 
  stepNum: number;
  question: string; 
  subtext?: string;
  options: string[]; 
  onSelect: (v: string) => void; 
  selected: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-bold text-[#8a7238] uppercase tracking-wider">Criteria 0{stepNum}</span>
        <h3 className="text-xl md:text-2xl font-bold font-heading text-[#10291a] mt-1">
          {question}
        </h3>
        {subtext && (
          <p className="text-xs text-[#5a6c5f] mt-1.5 leading-relaxed">
            {subtext}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 pt-3">
        {options.map((opt: string) => {
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                isSelected
                  ? "bg-[#144226] text-white border-[#144226] shadow-xs"
                  : "bg-[#fbf9f4] text-[#1c2c20] border-[#dedad0] hover:border-[#144226]/40 hover:bg-[#f5f1e7]"
              }`}
              onClick={() => onSelect(opt)}
            >
              <span>{opt}</span>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#86efac]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultView({ 
  result, 
  onReset,
  getConfidenceBadge 
}: { 
  result: any; 
  onReset: () => void;
  getConfidenceBadge: (c: string) => string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#dedad0] bg-white p-6 md:p-10 shadow-sm">
        
        {/* Category Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#eeeae0]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#8a7238]">
              Statutory Classification Result
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#10291a] mt-1">
              {result.category}
            </h2>
          </div>
          <div className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getConfidenceBadge(result.confidence)}`}>
            Confidence: {result.confidence}
          </div>
        </div>
        
        {/* Reasoning and Implications */}
        <div className="mt-6 space-y-6">
          <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-[#e5e0d4]">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#144226] flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#144226]" /> 
              Statutory Basis & Legal Reasoning
            </h3>
            <p className="text-sm text-[#2a3c30] leading-relaxed whitespace-pre-wrap">
              {result.reasoning}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#fcfbf9] p-5 rounded-2xl border border-[#dedad0]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8a7238] mb-2">
                <FileText className="w-4 h-4" />
                Regulatory & Licensing Route (Rule 158B)
              </div>
              <p className="text-xs text-[#45574a] leading-relaxed">
                {result.regulatory_implications}
              </p>
            </div>

            <div className="bg-[#fcfbf9] p-5 rounded-2xl border border-[#dedad0]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8a7238] mb-2">
                <Scale className="w-4 h-4" />
                Intellectual Property & Section 3(p) Scope
              </div>
              <p className="text-xs text-[#45574a] leading-relaxed">
                {result.ip_implications}
              </p>
            </div>
          </div>

          {result.abs_relevance && result.abs_relevance !== "Unknown" && (
            <div className="p-4 rounded-xl bg-[#f7f5ed] border border-[#ded8c8] text-xs text-[#526357]">
              <span className="font-bold text-[#14281c]">Biological Diversity & ABS Note: </span>
              {result.abs_relevance}
            </div>
          )}
        </div>
        
        {/* Evidence Sources */}
        {result.relevant_sources?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#eeeae0]">
            <h3 className="font-heading font-bold text-base text-[#10291a] mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#144226]" />
              Relevant Statutory Citations Grounding This Result
            </h3>
            <div className="space-y-2">
              {result.relevant_sources.map((s: any, i: number) => (
                <div key={i} className="text-xs bg-[#fbf9f4] p-3 rounded-xl border border-[#e5e0d4] flex items-start justify-between">
                  <div>
                    <span className="font-bold text-[#144226] mr-1.5">[{i+1}]</span>
                    <span className="font-semibold text-[#18281d]">{s.title}</span>
                    <span className="text-[#65766a] ml-2">
                      — {s.authority} {s.section && `• Section: ${s.section}`}
                    </span>
                  </div>
                  {s.relevance_score && (
                    <span className="text-[10px] font-mono text-[#8a7238] bg-[#f5efe2] px-1.5 py-0.5 rounded border border-[#e6decc]">
                      Score: {(s.relevance_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-[#eeeae0]">
          <button 
            className="px-4 py-2.5 rounded-xl border border-[#cfc8b8] hover:bg-[#f3efe4] text-[#36493c] text-xs font-semibold flex items-center gap-2 transition-all" 
            onClick={onReset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Classify Another Formulation
          </button>
          <Link 
            href="/chat" 
            className="px-5 py-2.5 rounded-xl bg-[#144226] hover:bg-[#0e311c] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            Ask Assistant Follow-up Questions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
