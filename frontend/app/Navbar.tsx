"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronDown, 
  BookOpen, 
  GitCompare, 
  Scale, 
  Zap, 
  Calculator, 
  ClipboardCheck, 
  Database, 
  MessageSquare,
  Menu,
  X,
  FileCheck2
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus when route changes
  useEffect(() => {
    setToolsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isToolActive = [
    "/treatises",
    "/compare",
    "/patentability",
    "/synergy",
    "/nba"
  ].some((path) => pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 bg-[#fdfcf9]/95 backdrop-blur-md border-b border-[#e5e0d5]">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex items-center justify-between h-16">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#144226] text-white flex items-center justify-center font-heading font-bold text-base shadow-xs">
            A
          </div>
          <span className="text-xl font-bold font-heading text-[#10291a] tracking-tight">
            AyuRith
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f3eee1] border border-[#e0d6c1] text-[#7a5a19]">
            IP-SHAKTI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "text-[#10291a] font-semibold bg-[#eee9dc]"
                : "text-[#45574a] hover:text-[#10291a] hover:bg-[#f2ede2]"
            }`}
          >
            Overview
          </Link>

          <Link
            href="/classifier"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/classifier"
                ? "text-[#10291a] font-semibold bg-[#eee9dc]"
                : "text-[#45574a] hover:text-[#10291a] hover:bg-[#f2ede2]"
            }`}
          >
            Classifier
          </Link>

          {/* Statutory Tools Mega-Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isToolActive || toolsOpen
                  ? "text-[#10291a] font-semibold bg-[#eee9dc]"
                  : "text-[#45574a] hover:text-[#10291a] hover:bg-[#f2ede2]"
              }`}
            >
              <span>Statutory Tools</span>
              <ChevronDown 
                className={`w-3.5 h-3.5 text-[#5e7164] transition-transform duration-200 ${
                  toolsOpen ? "rotate-180" : ""
                }`} 
              />
            </button>

            {/* Dropdown Menu Flyout */}
            {toolsOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[540px] bg-[#fcfbf9] border border-[#ded7c8] rounded-xl shadow-lg p-4 animate-in fade-in zoom-in-95 duration-150 z-50">
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* Item 1: Treatises */}
                  <Link
                    href="/treatises"
                    className="p-3 rounded-lg hover:bg-[#f3eee2] transition-colors border border-transparent hover:border-[#ded6c3] flex items-start gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#e8ede9] text-[#144226] flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4 text-[#144226]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14281c] group-hover:text-[#144226] flex items-center gap-1.5">
                        <span>54 Classical Treatises</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#e3eae4] text-[#183a23] font-semibold">D&C Act</span>
                      </div>
                      <p className="text-[11px] text-[#5c6d60] mt-0.5 leading-snug">
                        First Schedule classical texts & Section 3(p) prior art verification.
                      </p>
                    </div>
                  </Link>

                  {/* Item 2: Patentability */}
                  <Link
                    href="/patentability"
                    className="p-3 rounded-lg hover:bg-[#f3eee2] transition-colors border border-transparent hover:border-[#ded6c3] flex items-start gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#e3ece5] text-[#144226] flex items-center justify-center shrink-0 mt-0.5">
                      <Scale className="w-4 h-4 text-[#144226]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14281c] group-hover:text-[#144226] flex items-center gap-1.5">
                        <span>Patentability Scorer</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#e0eae2] text-[#144226] font-semibold">PPI</span>
                      </div>
                      <p className="text-[11px] text-[#5c6d60] mt-0.5 leading-snug">
                        Section 2 & 3 probability index against IPO, USPTO, EPO & TKDL.
                      </p>
                    </div>
                  </Link>

                  {/* Item 3: Synergy */}
                  <Link
                    href="/synergy"
                    className="p-3 rounded-lg hover:bg-[#f3eee2] transition-colors border border-transparent hover:border-[#ded6c3] flex items-start gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#fbf2da] text-[#7a5a19] flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-[#7a5a19]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14281c] group-hover:text-[#7a5a19] flex items-center gap-1.5">
                        <span>Synergy Evaluator</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#f5ecce] text-[#7a5a19] font-semibold">Sec 3(e)</span>
                      </div>
                      <p className="text-[11px] text-[#5c6d60] mt-0.5 leading-snug">
                        Chou-Talalay Combination Index & patent claim drafter.
                      </p>
                    </div>
                  </Link>

                  {/* Item 4: NBA Form III */}
                  <Link
                    href="/nba"
                    className="p-3 rounded-lg hover:bg-[#f3eee2] transition-colors border border-transparent hover:border-[#ded6c3] flex items-start gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#eddcd2] text-[#802f1a] flex items-center justify-center shrink-0 mt-0.5">
                      <Calculator className="w-4 h-4 text-[#802f1a]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14281c] group-hover:text-[#802f1a] flex items-center gap-1.5">
                        <span>NBA Form III & ABS</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#eed5c8] text-[#802f1a] font-semibold">BDA § 6</span>
                      </div>
                      <p className="text-[11px] text-[#5c6d60] mt-0.5 leading-snug">
                        Benefit-sharing fee calculator & statutory patent approval dossier.
                      </p>
                    </div>
                  </Link>

                  {/* Item 5: Formulation Diff */}
                  <Link
                    href="/compare"
                    className="p-3 rounded-lg hover:bg-[#f3eee2] transition-colors border border-transparent hover:border-[#ded6c3] flex items-start gap-3 group col-span-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#f0ebd9] text-[#63501a] flex items-center justify-center shrink-0 mt-0.5">
                      <GitCompare className="w-4 h-4 text-[#63501a]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14281c] group-hover:text-[#63501a] flex items-center gap-1.5">
                        <span>Polyherbal Diff Engine</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#e8e0c9] text-[#5c4a16] font-semibold">Rule 158B Diff</span>
                      </div>
                      <p className="text-[11px] text-[#5c6d60] mt-0.5 leading-snug">
                        Side-by-side recipe comparison across classical, proprietary ASU, and patented NDDS compositions.
                      </p>
                    </div>
                  </Link>

                </div>
              </div>
            )}
          </div>

          <Link
            href="/dossier"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/dossier"
                ? "text-[#10291a] font-semibold bg-[#eee9dc]"
                : "text-[#45574a] hover:text-[#10291a] hover:bg-[#f2ede2]"
            }`}
          >
            Audit Dossier
          </Link>

          <Link
            href="/sources"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/sources"
                ? "text-[#10291a] font-semibold bg-[#eee9dc]"
                : "text-[#45574a] hover:text-[#10291a] hover:bg-[#f2ede2]"
            }`}
          >
            Sources
          </Link>
        </nav>

        {/* Right Action: Assistant CTA & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs flex items-center gap-1.5 ${
              pathname === "/chat"
                ? "bg-[#0b2414] text-white"
                : "bg-[#144226] hover:bg-[#0e311c] text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Assistant</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#384a3e] hover:bg-[#f0ece1] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e2dcd0] bg-[#fcfbf9] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              href="/"
              className="p-2.5 rounded-lg bg-[#f5f1e8] text-[#14281c] font-semibold"
            >
              Overview
            </Link>
            <Link
              href="/classifier"
              className="p-2.5 rounded-lg bg-[#f5f1e8] text-[#14281c] font-semibold"
            >
              5-Step Classifier
            </Link>
            <Link
              href="/dossier"
              className="p-2.5 rounded-lg bg-[#f5f1e8] text-[#14281c] font-semibold"
            >
              Audit Dossier
            </Link>
            <Link
              href="/sources"
              className="p-2.5 rounded-lg bg-[#f5f1e8] text-[#14281c] font-semibold"
            >
              Sources & Chunks
            </Link>
          </div>

          <div className="pt-2 border-t border-[#eee8dd]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#637567] mb-2 px-1">
              Statutory Analytical Engines:
            </p>
            <div className="space-y-1 text-xs">
              <Link
                href="/treatises"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2eee3] text-[#182c1f]"
              >
                <span>54 Classical Treatises</span>
                <span className="text-[10px] font-mono text-[#144226]">First Schedule</span>
              </Link>
              <Link
                href="/patentability"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2eee3] text-[#182c1f]"
              >
                <span>Patentability Scorer</span>
                <span className="text-[10px] font-mono text-[#144226]">PPI Scorer</span>
              </Link>
              <Link
                href="/synergy"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2eee3] text-[#182c1f]"
              >
                <span>Synergy Evaluator</span>
                <span className="text-[10px] font-mono text-[#7a5a19]">Sec 3(e)</span>
              </Link>
              <Link
                href="/nba"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2eee3] text-[#182c1f]"
              >
                <span>NBA Form III & ABS</span>
                <span className="text-[10px] font-mono text-[#802f1a]">BDA § 6</span>
              </Link>
              <Link
                href="/compare"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2eee3] text-[#182c1f]"
              >
                <span>Polyherbal Diff Engine</span>
                <span className="text-[10px] font-mono text-[#5c4a16]">Diff</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
