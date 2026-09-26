"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  Scale
} from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("india");
  const [language, setLanguage] = useState("en");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setInput(q);
      }
    }
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg,
          jurisdiction,
          language,
          conversation_id: conversationId || undefined
        })
      });
      const data = await res.json();
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
      if (data.language === "hi") {
        setLanguage("hi");
      }
      setMessages(prev => [...prev, { role: "assistant", ...data }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        answer: "Error communicating with the IP-SHAKTI backend server. Please verify the backend is running.", 
        error: true,
        confidence: "INSUFFICIENT"
      }]);
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
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-2 text-[#1a251e]">
      
      {/* Settings / Institutional Header Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white px-5 py-3.5 rounded-t-2xl border border-[#dedad0] shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#144226] text-white flex items-center justify-center font-heading font-bold text-sm">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base text-[#10291a] leading-tight">
              Statutory Consultation Assistant
            </h2>
            <p className="text-[11px] text-[#637468]">
              Grounding: First Schedule Classical Texts • The Patents Act, 1970 • Rule 158B
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#526357]">
            <span className="font-semibold text-[#1a3825]">Regime:</span>
            <select 
              className="px-3 py-1.5 rounded-lg border border-[#cfc8ba] bg-[#fbf9f4] text-[#1c2c20] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#144226]"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            >
              <option value="india">Indian Legal Regime (IPO / AYUSH)</option>
              <option value="international">International Regime (PCT / USPTO / EPO)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#526357]">
            <span className="font-semibold text-[#1a3825]">Language:</span>
            <select 
              className="px-2.5 py-1.5 rounded-lg border border-[#cfc8ba] bg-[#fbf9f4] text-[#1c2c20] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#144226]"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-[#f9f7f2] border-x border-[#dedad0] overflow-y-auto p-4 md:p-6 space-y-6"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
            <div className="w-14 h-14 bg-[#eae5d8] border border-[#d8d0c0] rounded-2xl flex items-center justify-center text-[#144226] mb-4 shadow-2xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-heading text-[#10291a]">
              AyuRith Statutory RAG Assistant
            </h3>
            <p className="text-sm text-[#546559] mt-2 max-w-md">
              Inquire about formulation patentability, traditional knowledge exclusions under Section 3(p), Rule 158B ASU licensing, or TKDL prior art.
            </p>
            
            <div className="mt-6 flex flex-col gap-2 w-full text-left">
              <div className="text-xs font-semibold text-[#8a7238] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Recommended Statutory Queries:
              </div>
              <button 
                onClick={() => setInput("Can an aqueous extract of Withania somnifera and Piper longum overcome the Section 3(p) patent bar?")} 
                className="p-3 text-xs bg-white hover:bg-[#f3eee1] border border-[#dcd7cb] rounded-xl text-[#243528] transition-colors text-left font-medium"
              >
                • Can an aqueous extract of Withania somnifera and Piper longum overcome Section 3(p)?
              </button>
              <button 
                onClick={() => setInput("What are the mandatory clinical trial and safety data requirements under Rule 158B for proprietary medicines?")} 
                className="p-3 text-xs bg-white hover:bg-[#f3eee1] border border-[#dcd7cb] rounded-xl text-[#243528] transition-colors text-left font-medium"
              >
                • What are the mandatory safety and clinical trial requirements under Rule 158B?
              </button>
              <button 
                onClick={() => setInput("How does the National Biodiversity Authority (NBA Section 6) approval affect patent grants for foreign entities?")} 
                className="p-3 text-xs bg-white hover:bg-[#f3eee1] border border-[#dcd7cb] rounded-xl text-[#243528] transition-colors text-left font-medium"
              >
                • How does National Biodiversity Authority (NBA Section 6) approval apply to patent grants?
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl p-4 md:p-5 shadow-2xs ${
                  msg.role === 'user' 
                    ? 'bg-[#144226] text-white' 
                    : 'bg-white text-[#18271e] border border-[#dedad0]'
                }`}
              >
                {msg.role === 'assistant' && msg.abstained && (
                  <div className="flex items-center gap-2 text-[#995900] bg-[#fff9ed] border border-[#f5dfb8] px-3 py-1.5 rounded-lg text-xs font-semibold mb-3">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Statutory Abstention: {msg.abstention_reason || "Insufficient verified evidence to confirm."}</span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-[15px]">
                  {msg.role === 'user' ? msg.content : msg.answer}
                </div>

                {/* Sources Display */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-[#ede9df]">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#687a6d] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#144226]" /> Cited Statutory Authorities
                      </span>
                      {msg.confidence && (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getConfidenceBadge(msg.confidence)}`}>
                          Confidence: {msg.confidence}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      {msg.sources.map((src: any, i: number) => {
                        const isExpanded = expandedSource === `${idx}-${i}`;
                        return (
                          <div 
                            key={i} 
                            className="text-xs bg-[#fbf9f4] p-3 rounded-xl border border-[#e3ded2] hover:border-[#144226]/40 transition-colors"
                          >
                            <div 
                              className="flex items-start justify-between cursor-pointer"
                              onClick={() => setExpandedSource(isExpanded ? null : `${idx}-${i}`)}
                            >
                              <div className="flex items-center gap-1.5 flex-1 pr-2">
                                <span className="font-bold text-[#144226]">[{i+1}]</span> 
                                <span className="font-semibold text-[#18281d]">{src.title}</span>
                                <span className="text-[#6c7d71]">
                                  • {src.authority} {src.section && `(Sec: ${src.section})`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-mono text-[#8a7238] bg-[#f5efe2] px-1.5 py-0.5 rounded border border-[#e6decc]">
                                  Score: {(src.relevance_score * 100).toFixed(0)}%
                                </span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#7c8d81]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#7c8d81]" />}
                              </div>
                            </div>

                            {/* Expandable Statutory Excerpt */}
                            {isExpanded && (
                              <div className="mt-2.5 pt-2 border-t border-[#ede7da] text-[#425447] bg-white p-2.5 rounded-lg text-[12px] leading-relaxed font-mono">
                                <div className="text-[10px] uppercase font-bold text-[#8a7238] mb-1">Verbatim Excerpt:</div>
                                {src.text_excerpt}
                                {src.source_url && (
                                  <div className="mt-2">
                                    <a 
                                      href={src.source_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] text-[#144226] font-sans hover:underline"
                                    >
                                      Official Gazette Link <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-start">
            <div className="bg-white border border-[#dedad0] rounded-2xl px-5 py-3.5 shadow-2xs flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#144226] animate-ping"></span>
              <span className="text-xs font-medium text-[#4f6054]">
                Evaluating statutory corpus & checking citations...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border rounded-b-2xl border-[#dedad0] shadow-2xs">
        <form onSubmit={sendMessage} className="flex gap-2.5">
          <input 
            type="text" 
            placeholder="Inquire on Section 3(p), Rule 158B, TKDL prior art, or ASU classification..." 
            className="flex-1 px-4 py-3 rounded-xl border border-[#d6d0c2] bg-[#fcfbf8] focus:bg-white focus:border-[#144226] focus:ring-1 focus:ring-[#144226] text-sm text-[#18281d] outline-none transition-all placeholder-[#77867b]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="px-6 py-3 rounded-xl bg-[#144226] hover:bg-[#0e311c] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading || !input.trim()}
          >
            <span>Consult</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[11px] text-[#718276] mt-2.5">
          IP-SHAKTI Sahayak provides source-grounded regulatory information. Always verify filings with an Indian Patent Agent.
        </p>
      </div>

    </div>
  );
}
