"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AuditResult } from "@/lib/types";
import { WordPressFixRecommendation } from "@/lib/wp-fixes/types";

import { RetestRecord } from "@/lib/types";

interface DashboardProps {
  audit: AuditResult;
  scanId: string;
  initialRetests: RetestRecord[];
}

type Tab = "overview" | "fixes" | "setup";

export default function Dashboard({ audit, scanId, initialRetests }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("fixes");
  const [completedFixIds, setCompletedFixIds] = useState<string[]>([]);
  const [expandedFixId, setExpandedFixId] = useState<string | null>(null);
  
  const [retests, setRetests] = useState<RetestRecord[]>(initialRetests || []);
  const [isRetesting, setIsRetesting] = useState(false);
  const [retestError, setRetestError] = useState<string | null>(null);

  const storageKey = `maki_progress_v1_${scanId}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed?.completedFixIds)) {
          setCompletedFixIds(parsed.completedFixIds);
        }
      }
    } catch (err) {
      console.warn("Failed to read progress from localStorage", err);
    }
  }, [storageKey]);

  const toggleFix = (fixId: string) => {
    let nextCompleted: string[];
    if (completedFixIds.includes(fixId)) {
      nextCompleted = completedFixIds.filter((id) => id !== fixId);
    } else {
      nextCompleted = [...completedFixIds, fixId];
    }
    setCompletedFixIds(nextCompleted);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ completedFixIds: nextCompleted }));
    } catch (err) {
      console.warn("Failed to write progress to localStorage", err);
    }
  };

  const handleRetest = async () => {
    if (isRetesting) return;
    setIsRetesting(true);
    setRetestError(null);
    try {
      const res = await fetch("/api/retest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to run re-test");
      }
      const newRetest = await res.json();
      setRetests(prev => [...prev, newRetest]);
      setActiveTab("overview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setRetestError(err.message);
    } finally {
      setIsRetesting(false);
    }
  };

  const wpContext = audit.siteInfo?.wordpressContext;
  const fixes = audit.structuredFixes || [];

  const highImpact = fixes.filter(f => f.impact === "high");
  const medImpact = fixes.filter(f => f.impact === "medium");
  const lowImpact = fixes.filter(f => f.impact === "low");

  const totalFixes = fixes.length;
  const completedCount = fixes.filter(f => completedFixIds.includes(f.fixId)).length;
  const progressPercent = totalFixes > 0 ? Math.round((completedCount / totalFixes) * 100) : 100;

  // Next Priority Fix (first unresolved high or medium)
  const nextFix = fixes.find(f => !completedFixIds.includes(f.fixId));

  const domain = new URL(audit.url).hostname;

  // Formatting helpers
  const getWpStatusText = () => {
    if (wpContext?.status === "likely") return "WordPress likely detected";
    return "WordPress detected";
  };

  const getTechString = () => {
    if (!wpContext) return "";
    const techs = [];
    if (wpContext.theme) techs.push(wpContext.theme.name);
    if (wpContext.pageBuilder) techs.push(wpContext.pageBuilder.name);
    if (wpContext.performancePlugins[0]) techs.push(wpContext.performancePlugins[0].name);
    return techs.join(" · ");
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-amber-500";
    return "text-red-600";
  };

  const metricColor = (status: "pass" | "fail" | "needs-improvement") => {
    if (status === "pass") return "text-green-600";
    if (status === "needs-improvement") return "text-amber-500";
    return "text-red-600";
  };

  const renderComparisonRow = (label: string, oldVal: string | number, newVal: string | number, lowerIsBetter: boolean = true) => {
    let oldNum = typeof oldVal === 'string' ? parseFloat(oldVal) : oldVal;
    let newNum = typeof newVal === 'string' ? parseFloat(newVal) : newVal;

    if (isNaN(oldNum) || isNaN(newNum)) {
      return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-500 font-medium w-1/3">{label}</span>
          <span className="text-gray-400 w-1/3 text-center">{oldVal}</span>
          <span className="text-gray-900 font-medium w-1/3 text-right">{newVal}</span>
        </div>
      );
    }

    const diff = newNum - oldNum;
    const isImprovement = lowerIsBetter ? diff < 0 : diff > 0;
    const isWorse = lowerIsBetter ? diff > 0 : diff < 0;

    let diffEl = <span className="text-gray-400 text-xs">No change</span>;
    if (isImprovement) diffEl = <span className="text-green-600 text-xs font-bold flex items-center gap-0.5 justify-end"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lowerIsBetter ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M5 10l7-7m0 0l7 7m-7-7v18"} /></svg>{Math.abs(diff).toFixed(label.includes('Score') ? 0 : 2)}</span>;
    if (isWorse) diffEl = <span className="text-red-600 text-xs font-bold flex items-center gap-0.5 justify-end"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lowerIsBetter ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} /></svg>{Math.abs(diff).toFixed(label.includes('Score') ? 0 : 2)}</span>;

    return (
      <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
        <span className="text-gray-600 font-medium w-1/3">{label}</span>
        <span className="text-gray-400 w-1/4 text-center">{oldVal}</span>
        <div className="w-5/12 text-right flex flex-col items-end">
          <span className="text-gray-900 font-bold">{newVal}</span>
          {diffEl}
        </div>
      </div>
    );
  };

  const renderCard = (fix: WordPressFixRecommendation) => {
    const isCompleted = completedFixIds.includes(fix.fixId);
    const isExpanded = expandedFixId === fix.fixId;

    const impactStyle = 
      fix.impact === 'high' ? 'bg-[#c84367]/10 text-[#c84367] border-[#c84367]/20' : 
      fix.impact === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
      'bg-blue-100 text-[#268ad8] border-blue-200';

    return (
      <div key={fix.fixId} className={`border rounded-2xl mb-4 overflow-hidden shadow-sm transition-all ${isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'}`}>
        {/* Collapsed Header */}
        <div 
          className="p-5 cursor-pointer flex flex-col md:flex-row md:items-start gap-4 hover:bg-[#f3fbff]/50 transition-colors"
          onClick={() => setExpandedFixId(isExpanded ? null : fix.fixId)}
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${impactStyle}`}>
                {fix.impact} impact
              </span>
              {isCompleted && (
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Fixed
                </span>
              )}
            </div>
            <h3 className={`font-bold text-lg text-[#282f42] leading-snug ${isCompleted ? 'line-through text-gray-500' : ''}`}>{fix.title}</h3>
            {fix.resource && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resource</span>
                <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded truncate max-w-[200px] sm:max-w-xs border border-gray-200">
                  {typeof fix.resource === 'string' ? fix.resource.split('/').pop() : 'Multiple resources'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pt-2 md:pt-0">
             <button 
                onClick={(e) => { e.stopPropagation(); toggleFix(fix.fixId); }}
                className={`text-sm px-5 py-2 rounded-full border-2 font-bold transition-all ${
                  isCompleted ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-white text-[#268ad8] border-[#268ad8] hover:bg-[#268ad8] hover:text-white'
                }`}
              >
                {isCompleted ? '✓ Fixed' : 'Mark as fixed'}
              </button>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform ${isExpanded ? 'rotate-180 bg-gray-200 text-gray-600' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-6 border-t border-gray-100 bg-[#f9fafb] text-sm text-[#282f42]">
            
            {/* Context/Setup Chips */}
            {wpContext && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Detected Setup</span>
                <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2 py-1 rounded-md">WordPress</span>
                {wpContext.theme && <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2 py-1 rounded-md">{wpContext.theme.name}</span>}
                {wpContext.pageBuilder && <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2 py-1 rounded-md">{wpContext.pageBuilder.name}</span>}
                {fix.context?.plugin && <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2 py-1 rounded-md">{fix.context.plugin}</span>}
              </div>
            )}

            <div className="mb-8">
              <h4 className="font-bold text-xs text-[#268ad8] uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                How to fix
              </h4>
              <div className="space-y-4 ml-1">
                {fix.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start relative">
                    {idx !== fix.steps.length - 1 && <div className="absolute left-3 top-7 bottom-[-16px] w-0.5 bg-gray-200"></div>}
                    <div className="w-6 h-6 rounded-full bg-[#268ad8] text-white flex items-center justify-center text-xs font-bold shrink-0 relative z-10 shadow-sm">
                      {idx + 1}
                    </div>
                    <div className="pt-0.5 text-[#282f42] font-medium leading-relaxed">{step}</div>
                  </div>
                ))}
              </div>
            </div>

            {fix.resource && (
              <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-2">Affected Resource</h4>
                <div className="text-xs font-mono text-gray-600 overflow-x-auto whitespace-pre bg-gray-50 p-2 rounded border border-gray-100">
                  {typeof fix.resource === 'string' ? fix.resource : fix.resource.join('\n')}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-3">Verify it worked</h4>
              <ul className="space-y-2">
                {fix.verification.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            {fix.caution && fix.caution.length > 0 && (
              <div className="mb-2 bg-[#fff8e6] border border-[#f5d061] rounded-xl p-4 text-[#8a6100]">
                <h4 className="font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Caution
                </h4>
                <ul className="space-y-1">
                  {fix.caution.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="opacity-50 mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3fbff] font-sans pb-24 md:pb-0 relative overflow-hidden">
      
      {/* Gentle background decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#c84367]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-150px] w-[600px] h-[600px] bg-[#268ad8]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around p-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'overview' ? 'text-[#c84367]' : 'text-gray-400 hover:text-gray-600'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] font-bold tracking-wide">Overview</span>
        </button>
        <button onClick={() => setActiveTab('fixes')} className={`flex flex-col items-center p-2 transition-colors relative ${activeTab === 'fixes' ? 'text-[#c84367]' : 'text-gray-400 hover:text-gray-600'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          <span className="text-[10px] font-bold tracking-wide">Fixes</span>
          {totalFixes > completedCount && <span className="absolute top-1 right-2 w-2 h-2 bg-[#c84367] rounded-full"></span>}
        </button>
        <button onClick={() => setActiveTab('setup')} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'setup' ? 'text-[#c84367]' : 'text-gray-400 hover:text-gray-600'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[10px] font-bold tracking-wide">Setup</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto md:flex min-h-screen relative z-10">
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 p-8 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#268ad8] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-2xl font-black text-[#282f42] tracking-tight">Maki</h1>
          </div>
          
          <nav className="space-y-3">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-white shadow-sm border border-gray-100 text-[#c84367]' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Overview
            </button>
            <button onClick={() => setActiveTab('fixes')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'fixes' ? 'bg-white shadow-sm border border-gray-100 text-[#c84367]' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Fixes
              </div>
              {totalFixes > completedCount && <span className="bg-[#c84367] text-white py-0.5 px-2.5 rounded-full text-[10px] font-black">{totalFixes - completedCount}</span>}
            </button>
            <button onClick={() => setActiveTab('setup')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'setup' ? 'bg-white shadow-sm border border-gray-100 text-[#c84367]' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Setup
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-10 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
          
          {/* Header Block (Always visible on mobile Overview, or desktop) */}
          {(activeTab === 'overview' || typeof window === 'undefined' || window.innerWidth >= 768) && (
            <>
              {retests.length > 0 ? (
                <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xl shadow-blue-900/5 mb-8 border-[#268ad8]/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#268ad8] to-[#c84367]"></div>
                  
                  {completedCount === totalFixes && (
                    <Image src="/celebrate.svg" alt="Celebrate" width={45} height={60} className="absolute top-4 right-4 opacity-20 animate-pop pointer-events-none" />
                  )}

                  <h2 className="text-2xl font-black text-[#282f42] mb-6 tracking-tight">Before & After</h2>
                  
                  <div className="flex text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1 border-b border-gray-100 pb-2">
                    <div className="w-1/3">Metric</div>
                    <div className="w-1/4 text-center">Original</div>
                    <div className="w-5/12 text-right">Latest</div>
                  </div>
                  
                  <div className="bg-gray-50/50 rounded-2xl px-5 py-3 border border-gray-100/80">
                    {renderComparisonRow("Performance score", audit.mobileScore, retests[retests.length - 1].performanceScore ?? "N/A", false)}
                    {renderComparisonRow("LCP", audit.cwvScores.lcp.value.replace('s',''), retests[retests.length - 1].lcp.value.replace('s',''))}
                    {renderComparisonRow("INP", audit.cwvScores.inp.value.replace('ms',''), retests[retests.length - 1].inp.value.replace('ms',''))}
                    {renderComparisonRow("CLS", audit.cwvScores.cls.value, retests[retests.length - 1].cls.value)}
                  </div>
                  
                  {retests.length > 1 && (
                    <details className="mt-6 text-sm">
                      <summary className="text-[#268ad8] cursor-pointer hover:underline outline-none font-bold">View past re-tests ({retests.length})</summary>
                      <div className="mt-4 pl-4 space-y-3 border-l-2 border-gray-100">
                        {retests.map((rt, i) => (
                          <div key={i} className="flex justify-between items-center text-gray-600">
                            <span className="font-medium">{new Date(rt.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                            <span className="font-mono bg-white border shadow-sm px-2 py-0.5 rounded-md text-xs font-bold text-[#282f42]">Score: {rt.performanceScore ?? "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xl shadow-blue-900/5 mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6 relative overflow-hidden">
                  <div className="z-10 relative flex-1">
                    <h2 className="text-2xl font-black text-[#282f42] mb-2 truncate">{domain}</h2>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#268ad8] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                        {getWpStatusText()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#282f42] p-5 rounded-2xl flex gap-6 text-center shadow-lg relative overflow-hidden z-10 shrink-0 min-w-[160px] justify-center">
                    <div className="absolute inset-0 bg-[url('/sprinkles.png')] opacity-10 bg-cover mix-blend-overlay pointer-events-none"></div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Performance score</p>
                      <p className={`text-4xl font-black ${audit.mobileScore >= 90 ? 'text-green-400' : audit.mobileScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{audit.mobileScore}</p>
                      <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Google PageSpeed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full md:w-auto md:min-w-[250px] shrink-0">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                      <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1">LCP</p>
                      <p className={`text-lg font-black ${metricColor(audit.cwvScores.lcp.status)}`}>{audit.cwvScores.lcp.value}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                      <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1">INP</p>
                      <p className={`text-lg font-black ${metricColor(audit.cwvScores.inp.status)}`}>{audit.cwvScores.inp.value}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                      <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1">CLS</p>
                      <p className={`text-lg font-black ${metricColor(audit.cwvScores.cls.status)}`}>{audit.cwvScores.cls.value}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Progress Summary */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Fix plan progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{completedCount} of {totalFixes} fixes completed</span>
                  <span className="text-sm font-bold text-[#268ad8]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                  <div className="bg-[#268ad8] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>

                {completedCount > 0 && (
                  <div className="border-t pt-5">
                    {isRetesting ? (
                      <div className="bg-blue-50 text-[#268ad8] rounded-xl p-4 text-center animate-pulse">
                        <svg className="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="font-bold">Re-testing your site...</p>
                        <p className="text-xs mt-1">Running a fresh PageSpeed test. This can take a little while.</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">You marked {completedCount} {completedCount === 1 ? 'fix' : 'fixes'} as complete.</p>
                        <button 
                          onClick={handleRetest}
                          className="w-full sm:w-auto bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
                        >
                          Re-test site
                        </button>
                        {retestError && <p className="text-xs text-red-600 mt-3">{retestError}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fix Summary & Next Fix */}
              {totalFixes > 0 ? (
                <div className="bg-white rounded-2xl p-6 border shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    {highImpact.length > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> High impact fixes
                        </span>
                        <span className="font-medium">{highImpact.length}</span>
                      </div>
                    )}
                    {medImpact.length > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium impact improvements
                        </span>
                        <span className="font-medium">{medImpact.length}</span>
                      </div>
                    )}
                    {lowImpact.length > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Minor adjustments
                        </span>
                        <span className="font-medium">{lowImpact.length}</span>
                      </div>
                    )}
                  </div>

                  {nextFix && (
                    <div className="mt-8 relative animate-slide-up-fade">
                      <p className="text-[10px] font-black text-[#c84367] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Next Priority Fix
                      </p>
                      
                      <Image src="/mascot.svg" alt="" width={38} height={60} className="absolute -top-12 right-0 hidden sm:block animate-bob pointer-events-none drop-shadow-md z-10" />

                      <div className="bg-white border-2 border-red-100 shadow-xl shadow-red-500/5 rounded-2xl overflow-hidden relative z-0">
                        <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => { setActiveTab('fixes'); setExpandedFixId(nextFix.fixId); }}>
                          <div className="flex flex-wrap gap-2 items-center mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border bg-[#c84367]/10 text-[#c84367] border-[#c84367]/20">
                              High Impact
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-xl text-[#282f42] mb-3 leading-snug">{nextFix.title}</h4>
                          
                          {nextFix.resource && (
                            <div className="mb-4">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Affected resource</p>
                              <div className="bg-gray-100 border border-gray-200 rounded p-2 text-xs font-mono text-gray-600 truncate max-w-full inline-block">
                                {typeof nextFix.resource === 'string' ? nextFix.resource : nextFix.resource[0]}
                                {Array.isArray(nextFix.resource) && nextFix.resource.length > 1 && ` (+${nextFix.resource.length - 1} more)`}
                              </div>
                            </div>
                          )}

                          {wpContext && (
                            <div className="mb-6">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Image src="/mascot.svg" alt="" width={10} height={16} className="sm:hidden" />
                                Maki detected this setup:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2.5 py-1 rounded-md">WordPress</span>
                                {wpContext.theme && <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2.5 py-1 rounded-md">{wpContext.theme.name}</span>}
                                {wpContext.pageBuilder && <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2.5 py-1 rounded-md">{wpContext.pageBuilder.name}</span>}
                                {nextFix.context?.plugin && <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2.5 py-1 rounded-md">{nextFix.context.plugin}</span>}
                              </div>
                            </div>
                          )}

                          <div className="bg-[#f9fafb] p-5 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-xs text-[#268ad8] uppercase tracking-widest mb-4">How to fix</h5>
                            <div className="space-y-4 ml-1">
                              {nextFix.steps.slice(0, 3).map((step, idx) => (
                                <div key={idx} className="flex gap-3 items-start relative">
                                  {idx !== Math.min(nextFix.steps.length, 3) - 1 && <div className="absolute left-3 top-7 bottom-[-16px] w-0.5 bg-gray-200"></div>}
                                  <div className="w-6 h-6 rounded-full bg-[#268ad8] text-white flex items-center justify-center text-xs font-bold shrink-0 relative z-10 shadow-sm">
                                    {idx + 1}
                                  </div>
                                  <div className="pt-0.5 text-[#282f42] text-sm font-medium leading-relaxed">{step}</div>
                                </div>
                              ))}
                              {nextFix.steps.length > 3 && (
                                <div className="flex gap-3 items-center mt-2 pl-1.5 opacity-50">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#268ad8]"></div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#268ad8]"></div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#268ad8]"></div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between">
                            <span className="text-sm font-bold text-[#c84367] flex items-center gap-1 group">
                              View full instructions
                              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFix(nextFix.fixId); }}
                              className="text-sm px-5 py-2.5 rounded-full border-2 font-bold bg-white text-[#268ad8] border-[#268ad8] hover:bg-[#268ad8] hover:text-white transition-all shadow-sm shadow-[#268ad8]/10"
                            >
                              Mark as fixed
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">No major WordPress performance issues were detected in this scan.</h3>
                  <p className="text-sm text-gray-500">Your site structure is looking solid based on the structured fix library.</p>
                </div>
              )}
            </div>
          )}

          {/* FIXES TAB */}
          {activeTab === 'fixes' && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">WordPress Fixes</h2>
                  <p className="text-sm text-gray-500 mt-1">Structured instructions for your specific setup.</p>
                </div>
              </div>

              {fixes.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border text-center text-gray-500 shadow-sm">
                  No structured fixes to display.
                </div>
              ) : (
                <div className="space-y-2">
                  {fixes.map(fix => renderCard(fix))}
                </div>
              )}

              <div className="mt-8 rounded-2xl bg-[#0c0d24] text-white p-6 sm:flex sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="font-bold text-lg">Short on time? We can apply these fixes for you.</p>
                  <p className="text-sm text-white/60 mt-1">Backups first, fixed quote, before/after report.</p>
                </div>
                <a
                  href={`/done-for-you?type=fix&from=dashboard&scan=${scanId}#quote`}
                  className="mt-4 sm:mt-0 inline-block shrink-0 rounded-xl bg-[#9ee19a] text-[#0c0d24] font-bold px-5 py-3"
                >
                  Get a quote →
                </a>
              </div>
            </div>
          )}

          {/* SETUP TAB */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Detected Setup</h3>
                {wpContext?.allDetected?.length ? (
                  <div className="space-y-3">
                    {wpContext.allDetected.map((tech, idx) => (
                      <div key={idx} className="flex flex-col border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{tech.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${tech.confidence === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {tech.confidence}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{tech.type}</p>
                        
                        <details className="mt-2 text-xs">
                          <summary className="text-gray-400 cursor-pointer hover:text-gray-600 outline-none">Why we think this</summary>
                          <ul className="mt-2 pl-4 list-disc space-y-1 text-gray-500 font-mono text-[10px]">
                            {tech.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
                          </ul>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No specific technologies detected.</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200 text-center pb-12">
            <span className="text-sm text-gray-400">
              Maki WordPress Fix Plan
            </span>
          </div>

        </main>
      </div>
    </div>
  );
}
