"use client";

import { useState, useEffect } from "react";
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

    return (
      <div key={fix.fixId} className={`border rounded-xl mb-4 overflow-hidden bg-white shadow-sm transition-all ${isCompleted ? 'opacity-70' : ''}`}>
        {/* Collapsed Header */}
        <div 
          className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center gap-3 hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedFixId(isExpanded ? null : fix.fixId)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                fix.impact === 'high' ? 'bg-red-100 text-red-700' : 
                fix.impact === 'medium' ? 'bg-amber-100 text-amber-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {fix.impact} impact
              </span>
              {isCompleted && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-100 text-green-700 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Fixed
                </span>
              )}
            </div>
            <h3 className={`font-semibold text-gray-900 ${isCompleted ? 'line-through' : ''}`}>{fix.title}</h3>
            {fix.resource && (
              <p className="text-xs text-gray-500 mt-1 font-mono truncate max-w-full">
                {typeof fix.resource === 'string' ? fix.resource.split('/').pop() : 'Multiple resources'}
              </p>
            )}
            {fix.context?.plugin && (
              <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {fix.context.plugin}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 mt-2 md:mt-0">
             <button 
                onClick={(e) => { e.stopPropagation(); toggleFix(fix.fixId); }}
                className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                  isCompleted ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' : 'bg-white text-[#268ad8] border-[#268ad8] hover:bg-blue-50'
                }`}
              >
                {isCompleted ? 'Unmark' : 'Mark as fixed'}
              </button>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 border-t bg-gray-50 text-sm text-gray-800">
            <div className="mb-6">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">How to fix</h4>
              <ol className="list-decimal pl-5 space-y-2">
                {fix.steps.map((step, idx) => (
                  <li key={idx} className="pl-1">{step}</li>
                ))}
              </ol>
            </div>

            {fix.resource && (
              <div className="mb-6">
                <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Affected Resource</h4>
                <div className="bg-white border rounded p-2 text-xs font-mono overflow-x-auto whitespace-pre">
                  {typeof fix.resource === 'string' ? fix.resource : fix.resource.join('\n')}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Verify</h4>
              <ul className="list-disc pl-5 space-y-1">
                {fix.verification.map((v, idx) => (
                  <li key={idx} className="pl-1">{v}</li>
                ))}
              </ul>
            </div>

            {fix.caution && fix.caution.length > 0 && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded p-3 text-amber-800">
                <h4 className="font-semibold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Caution
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {fix.caution.map((c, idx) => (
                    <li key={idx} className="pl-1">{c}</li>
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
    <div className="min-h-screen bg-[#f9fafb] font-sans pb-24 md:pb-0">
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around p-2 pb-safe">
        <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center p-2 ${activeTab === 'overview' ? 'text-[#268ad8]' : 'text-gray-500'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] font-medium">Overview</span>
        </button>
        <button onClick={() => setActiveTab('fixes')} className={`flex flex-col items-center p-2 ${activeTab === 'fixes' ? 'text-[#268ad8]' : 'text-gray-500'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          <span className="text-[10px] font-medium">Fixes</span>
        </button>
        <button onClick={() => setActiveTab('setup')} className={`flex flex-col items-center p-2 ${activeTab === 'setup' ? 'text-[#268ad8]' : 'text-gray-500'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[10px] font-medium">Setup</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto md:flex min-h-screen">
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 border-r bg-white p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#282f42] tracking-tight">Maki</h1>
          </div>
          
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-[#268ad8]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Overview
            </button>
            <button onClick={() => setActiveTab('fixes')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'fixes' ? 'bg-blue-50 text-[#268ad8]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Fixes
              </div>
              {totalFixes > 0 && <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{totalFixes - completedCount}</span>}
            </button>
            <button onClick={() => setActiveTab('setup')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'setup' ? 'bg-blue-50 text-[#268ad8]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Setup
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 md:max-w-3xl">
          
          {/* Header Block (Always visible on mobile Overview, or desktop) */}
          {(activeTab === 'overview' || typeof window === 'undefined' || window.innerWidth >= 768) && (
            <>
              {retests.length > 0 ? (
                <div className="bg-white rounded-2xl p-6 border shadow-sm mb-6 border-indigo-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#268ad8]"></div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Before & After</h2>
                  
                  <div className="flex text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                    <div className="w-1/3">Metric</div>
                    <div className="w-1/4 text-center">Original</div>
                    <div className="w-5/12 text-right">Latest</div>
                  </div>
                  
                  <div className="bg-gray-50/50 rounded-xl px-4 py-2 border">
                    {renderComparisonRow("Performance", audit.mobileScore, retests[retests.length - 1].performanceScore ?? "N/A", false)}
                    {renderComparisonRow("LCP", audit.cwvScores.lcp.value.replace('s',''), retests[retests.length - 1].lcp.value.replace('s',''))}
                    {renderComparisonRow("INP", audit.cwvScores.inp.value.replace('ms',''), retests[retests.length - 1].inp.value.replace('ms',''))}
                    {renderComparisonRow("CLS", audit.cwvScores.cls.value, retests[retests.length - 1].cls.value)}
                  </div>
                  
                  {retests.length > 1 && (
                    <details className="mt-4 text-xs">
                      <summary className="text-gray-500 cursor-pointer hover:text-gray-700 outline-none font-medium">Previous tests ({retests.length})</summary>
                      <div className="mt-3 pl-2 space-y-2 text-gray-600 border-l-2 border-gray-100">
                        {retests.map((rt, i) => (
                          <div key={i} className="flex justify-between pl-3">
                            <span>{new Date(rt.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                            <span className="font-mono bg-gray-100 px-1.5 rounded text-[10px]">Score: {rt.performanceScore ?? "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{domain}</h2>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-[#268ad8] bg-blue-50 px-2 py-0.5 rounded">
                          {getWpStatusText()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{getTechString()}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl flex gap-6 text-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Performance</p>
                        <p className={`text-3xl font-bold ${scoreColor(audit.mobileScore)}`}>{audit.mobileScore}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-semibold mb-1">LCP</p>
                      <p className={`text-lg font-bold ${metricColor(audit.cwvScores.lcp.status)}`}>{audit.cwvScores.lcp.value}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-semibold mb-1">INP</p>
                      <p className={`text-lg font-bold ${metricColor(audit.cwvScores.inp.status)}`}>{audit.cwvScores.inp.value}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-semibold mb-1">CLS</p>
                      <p className={`text-lg font-bold ${metricColor(audit.cwvScores.cls.status)}`}>{audit.cwvScores.cls.value}</p>
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
                    <div className="mt-6 border-t pt-6">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Priority Next Fix</p>
                      <div className="border border-red-100 bg-red-50/30 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{nextFix.title}</h4>
                        {nextFix.resource && <p className="text-xs font-mono text-gray-500 truncate">{typeof nextFix.resource === 'string' ? nextFix.resource.split('/').pop() : 'Multiple resources'}</p>}
                        <button 
                          onClick={() => {
                            setActiveTab('fixes');
                            setExpandedFixId(nextFix.fixId);
                          }}
                          className="mt-3 text-sm font-medium text-[#268ad8] hover:underline"
                        >
                          View instructions →
                        </button>
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
