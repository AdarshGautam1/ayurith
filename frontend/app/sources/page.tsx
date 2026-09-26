"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  UploadCloud, 
  Search, 
  FileText, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  Filter, 
  Database, 
  Sparkles,
  ChevronRight,
  X,
  FileCheck2,
  Scale
} from "lucide-react";

interface SourceDocument {
  id: string;
  title: string;
  authority: string;
  jurisdiction: string;
  document_type: string;
  file_path: string;
  source_url?: string | null;
  version?: string | null;
  effective_date?: string | null;
}

interface SourceStats {
  total_documents: number;
  india_documents: number;
  international_documents: number;
  india_chunks: number;
  international_chunks: number;
  document_types: Record<string, number>;
}

interface ChunkItem {
  id: string;
  text: string;
  metadata: Record<string, any>;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [stats, setStats] = useState<SourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("all");
  const [selectedDocType, setSelectedDocType] = useState<string>("all");
  
  // Modals state
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [inspectDoc, setInspectDoc] = useState<SourceDocument | null>(null);
  const [docChunks, setDocChunks] = useState<ChunkItem[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Ingestion form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [ingestTitle, setIngestTitle] = useState("");
  const [ingestAuthority, setIngestAuthority] = useState("");
  const [ingestJurisdiction, setIngestJurisdiction] = useState("india");
  const [ingestDocType, setIngestDocType] = useState("Act");
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingestVersion, setIngestVersion] = useState("");
  const [ingestDate, setIngestDate] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<{ status: string; message: string; chunks?: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedJurisdiction !== "all") params.append("jurisdiction", selectedJurisdiction);
      if (selectedDocType !== "all") params.append("document_type", selectedDocType);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`http://localhost:8000/api/sources?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      console.error("Failed to fetch sources:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/sources/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSources();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedJurisdiction, selectedDocType]);

  const handleInspectChunks = async (doc: SourceDocument) => {
    setInspectDoc(doc);
    setLoadingChunks(true);
    setDocChunks([]);
    try {
      const res = await fetch(`http://localhost:8000/api/sources/${doc.id}/chunks`);
      if (res.ok) {
        const chunks = await res.json();
        setDocChunks(chunks);
      }
    } catch (err) {
      console.error("Failed to load chunks:", err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !ingestTitle.trim() || !ingestAuthority.trim()) return;

    setIngesting(true);
    setIngestResult(null);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", ingestTitle.trim());
    formData.append("authority", ingestAuthority.trim());
    formData.append("jurisdiction", ingestJurisdiction);
    formData.append("document_type", ingestDocType);
    if (ingestUrl.trim()) formData.append("source_url", ingestUrl.trim());
    if (ingestVersion.trim()) formData.append("version", ingestVersion.trim());
    if (ingestDate.trim()) formData.append("effective_date", ingestDate.trim());

    try {
      const res = await fetch("http://localhost:8000/api/ingest/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setIngestResult({
          status: "success",
          message: data.message,
          chunks: data.chunks_embedded,
        });
        // Reset form
        setUploadFile(null);
        setIngestTitle("");
        setIngestAuthority("");
        setIngestUrl("");
        setIngestVersion("");
        setIngestDate("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        // Refresh sources and stats
        fetchSources();
        fetchStats();
      } else {
        setIngestResult({
          status: "error",
          message: data.detail || "Failed to ingest document.",
        });
      }
    } catch (err) {
      setIngestResult({
        status: "error",
        message: "Network error communicating with backend server.",
      });
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 py-4 text-[#1a251e] max-w-6xl mx-auto w-full">
      
      {/* 1. Header & Masthead */}
      <section className="relative overflow-hidden rounded-3xl border border-[#dedad0] bg-gradient-to-b from-[#fbf9f4] via-[#f7f4ec] to-[#f2eee3] p-8 md:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#e9e4d6] border border-[#d8d2c2] text-xs font-semibold tracking-wider uppercase text-[#1a402a] mb-4">
              <Database className="w-3.5 h-3.5 text-[#1b5e34]" />
              Persistent Statutory Repository • ChromaDB Vector Index
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#10291a] tracking-tight">
              Statutory Knowledge Base & Document Registry
            </h1>
            <p className="mt-3 text-sm md:text-base text-[#46574c] leading-relaxed">
              Browse authoritative acts, classical treatises, and international biodiversity agreements that ground AyuRith's statutory citation engine. Ingest new gazettes to expand live vector retrieval.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setIsIngestOpen(true);
                setIngestResult(null);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#144226] hover:bg-[#0f341d] active:scale-[0.99] text-[#f7f9f7] font-semibold text-sm transition-all shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              Ingest Document
            </button>
            <button
              onClick={() => {
                fetchSources();
                fetchStats();
              }}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#c9c2b1] hover:border-[#144226] text-[#2c3d31] font-medium text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4 text-[#5c6e61]" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#dedad0] shadow-2xs">
          <div className="text-3xl font-bold font-heading text-[#10291a]">
            {stats ? stats.total_documents : "..."}
          </div>
          <div className="text-xs font-semibold text-[#8a7238] uppercase tracking-wider mt-1">
            Total Indexed Documents
          </div>
          <p className="text-xs text-[#526357] mt-1.5">
            Statutes, regulations, and treaties stored in relational DB.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#dedad0] shadow-2xs">
          <div className="text-3xl font-bold font-heading text-[#144226]">
            {stats ? stats.india_documents : "..."}
          </div>
          <div className="text-xs font-semibold text-[#144226] uppercase tracking-wider mt-1">
            Indian Statutory Gazettes
          </div>
          <p className="text-xs text-[#526357] mt-1.5">
            Patents Act, D&C Act, Biological Diversity Act, FSSAI.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#dedad0] shadow-2xs">
          <div className="text-3xl font-bold font-heading text-[#8f6d2b]">
            {stats ? stats.international_documents : "..."}
          </div>
          <div className="text-xs font-semibold text-[#8f6d2b] uppercase tracking-wider mt-1">
            International Treaties
          </div>
          <p className="text-xs text-[#526357] mt-1.5">
            CBD, Nagoya Protocol, TRIPS Agreement guidelines.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#dedad0] shadow-2xs">
          <div className="text-3xl font-bold font-heading text-[#10291a]">
            {stats ? (stats.india_chunks + stats.international_chunks) : "..."}
          </div>
          <div className="text-xs font-semibold text-[#8a7238] uppercase tracking-wider mt-1">
            Embedded Vector Chunks
          </div>
          <p className="text-xs text-[#526357] mt-1.5">
            Cosine-indexed chunks in ChromaDB vector space.
          </p>
        </div>
      </section>

      {/* 3. Search & Registry Filter Controls */}
      <section className="bg-white p-5 rounded-2xl border border-[#dedad0] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c7d71]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, authority, or regulation keyword (e.g. Patents, FSSAI, Biodiversity)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d6d0c2] bg-[#fbf9f5] focus:bg-white focus:border-[#1a5632] focus:ring-1 focus:ring-[#1a5632] text-sm outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Jurisdiction Pills */}
            <div className="inline-flex p-1 rounded-xl bg-[#eeeae0] border border-[#d9d3c5] text-xs">
              <button
                onClick={() => setSelectedJurisdiction("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedJurisdiction === "all" ? "bg-white text-[#144226] shadow-2xs font-semibold" : "text-[#55675b] hover:text-[#18261e]"
                }`}
              >
                All Regimes
              </button>
              <button
                onClick={() => setSelectedJurisdiction("india")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedJurisdiction === "india" ? "bg-white text-[#144226] shadow-2xs font-semibold" : "text-[#55675b] hover:text-[#18261e]"
                }`}
              >
                India (IPO/AYUSH)
              </button>
              <button
                onClick={() => setSelectedJurisdiction("international")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedJurisdiction === "international" ? "bg-white text-[#144226] shadow-2xs font-semibold" : "text-[#55675b] hover:text-[#18261e]"
                }`}
              >
                International (WIPO/CBD)
              </button>
            </div>

            {/* Document Type Filter */}
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#d6d0c2] bg-[#fbf9f5] text-xs font-medium text-[#2a3c30] focus:outline-none focus:ring-1 focus:ring-[#144226]"
            >
              <option value="all">All Document Types</option>
              <option value="Act">Statutory Acts</option>
              <option value="Rule">Rules & Guidelines</option>
              <option value="Regulation">Regulations</option>
              <option value="Treaty">Treaties & Protocols</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. Document Registry Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-[#10291a]">
            Indexed Statutory Documents ({sources.length})
          </h2>
          <span className="text-xs text-[#627568]">
            Showing verified legal authorities loaded in knowledge base
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#dedad0]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#144226] mb-3" />
            <p className="text-sm text-[#526357]">Loading statutory registry...</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#dedad0]">
            <FileText className="w-10 h-10 text-[#8a9b8f] mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-lg text-[#10291a]">No documents matched your filter</h3>
            <p className="text-xs text-[#526357] mt-1 max-w-md mx-auto">
              Try adjusting your search terms or click "Ingest Document" to upload a new statutory Act or Treaty.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sources.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white p-6 rounded-2xl border border-[#dedad0] hover:border-[#144226]/50 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                      doc.jurisdiction === "india"
                        ? "bg-[#eaf3ed] text-[#144226] border-[#cbe3d3]"
                        : "bg-[#fbf4e6] text-[#8a681c] border-[#eedfc0]"
                    }`}>
                      {doc.jurisdiction === "india" ? "India" : "International"}
                    </span>

                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#f5f2e9] text-[#4d5f52] font-medium border border-[#e5dfd2]">
                      {doc.document_type}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-[#10291a] leading-snug">
                    {doc.title}
                  </h3>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#526357]">
                    <div>
                      <span className="font-semibold text-[#283b2e]">Authority:</span> {doc.authority || "Statutory Gazette"}
                    </div>
                    {doc.effective_date && (
                      <div>
                        <span className="font-semibold text-[#283b2e]">Effective:</span> {doc.effective_date}
                      </div>
                    )}
                    {doc.version && (
                      <div>
                        <span className="font-semibold text-[#283b2e]">Version:</span> {doc.version}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#f0ece1] flex items-center justify-between">
                  <button
                    onClick={() => handleInspectChunks(doc)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144226] hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Chunks
                  </button>

                  <Link
                    href={`/chat?q=${encodeURIComponent(`What are the key provisions of ${doc.title}?`)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#8f6d2b] hover:text-[#6c511e]"
                  >
                    Query in Assistant
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Ingestion Modal */}
      {isIngestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#dedad0] shadow-xl max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#eeeae0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eaf3ed] text-[#144226] flex items-center justify-center font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#10291a]">
                    Ingest Statutory Document
                  </h3>
                  <p className="text-xs text-[#526357]">
                    Upload PDF or text files into AyuRith's ChromaDB vector space
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsIngestOpen(false)}
                className="p-1.5 rounded-lg text-[#7c8d81] hover:text-[#14281c] hover:bg-[#f0ece1] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ingestResult && (
              <div className={`mt-4 p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                ingestResult.status === "success" 
                  ? "bg-[#eaf5ee] text-[#144226] border border-[#bee2ca]"
                  : "bg-[#fdf2f2] text-[#991b1b] border border-[#f8c8c8]"
              }`}>
                {ingestResult.status === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{ingestResult.message}</div>
                  {ingestResult.chunks !== undefined && (
                    <div className="mt-1 text-[11px]">
                      {ingestResult.chunks} chunks generated with multilingual embeddings.
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="mt-5 space-y-4">
              {/* File Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e4033] mb-1.5">
                  Select Document File (PDF or TXT) *
                </label>
                <div className="border-2 border-dashed border-[#d6d0c2] hover:border-[#144226] rounded-2xl p-5 text-center bg-[#fbf9f5] transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadFile(file);
                        if (!ingestTitle) {
                          setIngestTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
                        }
                      }
                    }}
                  />
                  <UploadCloud className="w-8 h-8 text-[#144226] mx-auto mb-2" />
                  {uploadFile ? (
                    <div>
                      <div className="text-xs font-semibold text-[#144226]">{uploadFile.name}</div>
                      <div className="text-[11px] text-[#69796e]">{(uploadFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-medium text-[#2d3f32]">Click or drop file to select</div>
                      <div className="text-[11px] text-[#718276] mt-0.5">Supports PDF statutes, official gazettes, or TXT excerpts</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Authority */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2e4033] mb-1">
                    Statute / Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestTitle}
                    onChange={(e) => setIngestTitle(e.target.value)}
                    placeholder="e.g. Biological Diversity Rules, 2004"
                    className="w-full px-3 py-2 rounded-xl border border-[#d6d0c2] text-xs focus:outline-none focus:border-[#144226]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2e4033] mb-1">
                    Issuing Authority *
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestAuthority}
                    onChange={(e) => setIngestAuthority(e.target.value)}
                    placeholder="e.g. National Biodiversity Authority"
                    className="w-full px-3 py-2 rounded-xl border border-[#d6d0c2] text-xs focus:outline-none focus:border-[#144226]"
                  />
                </div>
              </div>

              {/* Jurisdiction & Document Type */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2e4033] mb-1">
                    Jurisdiction Regime *
                  </label>
                  <select
                    value={ingestJurisdiction}
                    onChange={(e) => setIngestJurisdiction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6d0c2] text-xs bg-white focus:outline-none focus:border-[#144226]"
                  >
                    <option value="india">Indian Legal Regime (IPO / AYUSH)</option>
                    <option value="international">International Regime (WIPO / CBD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2e4033] mb-1">
                    Document Type *
                  </label>
                  <select
                    value={ingestDocType}
                    onChange={(e) => setIngestDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6d0c2] text-xs bg-white focus:outline-none focus:border-[#144226]"
                  >
                    <option value="Act">Statutory Act</option>
                    <option value="Rule">Rule / Regulation</option>
                    <option value="Treaty">Treaty / Protocol</option>
                    <option value="Guideline">Regulatory Guideline</option>
                    <option value="Pharmacopoeia">Ayurvedic Pharmacopoeia</option>
                  </select>
                </div>
              </div>

              {/* Additional optional fields */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#46574c] mb-1">
                    Version / Amendment (Optional)
                  </label>
                  <input
                    type="text"
                    value={ingestVersion}
                    onChange={(e) => setIngestVersion(e.target.value)}
                    placeholder="e.g. 2023 Amendment"
                    className="w-full px-3 py-2 rounded-xl border border-[#d6d0c2] text-xs focus:outline-none focus:border-[#144226]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#46574c] mb-1">
                    Official Gazette URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={ingestUrl}
                    onChange={(e) => setIngestUrl(e.target.value)}
                    placeholder="https://ipindia.gov.in/..."
                    className="w-full px-3 py-2 rounded-xl border border-[#d6d0c2] text-xs focus:outline-none focus:border-[#144226]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsIngestOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#d6d0c2] text-xs font-medium text-[#4b5c51] hover:bg-[#f5f2ea]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting || !uploadFile}
                  className="px-5 py-2.5 rounded-xl bg-[#144226] hover:bg-[#0f341d] disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2"
                >
                  {ingesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Chunking & Embedding...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      Embed into Vector Store
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Chunks Inspector Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#dedad0] shadow-xl max-w-3xl w-full p-6 md:p-8 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-[#eeeae0]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a7238] bg-[#fdf9ee] px-2 py-0.5 rounded border border-[#ebdcb9]">
                  {inspectDoc.jurisdiction === "india" ? "Indian Regime" : "International Regime"}
                </span>
                <h3 className="font-heading font-bold text-xl text-[#10291a] mt-1.5">
                  {inspectDoc.title}
                </h3>
                <p className="text-xs text-[#526357] mt-0.5">
                  Authority: {inspectDoc.authority} • {docChunks.length} Vector Chunks Embedded
                </p>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="p-1.5 rounded-lg text-[#7c8d81] hover:text-[#14281c] hover:bg-[#f0ece1] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loadingChunks ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#144226] mb-2" />
                  <p className="text-xs text-[#526357]">Retrieving chunks from ChromaDB...</p>
                </div>
              ) : docChunks.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#67776d]">
                  No vector chunks found for this document. It may have been registered as an external treatise reference.
                </div>
              ) : (
                docChunks.map((chunk, index) => (
                  <div 
                    key={chunk.id} 
                    className="p-4 rounded-xl bg-[#fbf9f4] border border-[#e8e4da] space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#637568]">
                      <span className="font-mono font-semibold text-[#144226]">Chunk #{index + 1} ({chunk.id})</span>
                      {chunk.metadata?.page && (
                        <span>Page {chunk.metadata.page}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#203126] leading-relaxed font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#eee9de]">
                      {chunk.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#eeeae0] flex justify-end">
              <button
                onClick={() => setInspectDoc(null)}
                className="px-4 py-2 rounded-xl bg-[#f0ece1] hover:bg-[#e4ded0] text-xs font-semibold text-[#293c2f]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
