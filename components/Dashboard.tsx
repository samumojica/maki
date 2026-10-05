"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "./Logo";
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
          // Progress lives in localStorage, which only exists in the browser: read it after mount
          // so the server render and first client render match.
          // eslint-disable-next-line react-hooks/set-state-in-effect
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
    } catch (err) {
      setRetestError((err as Error).message);
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

  const metricColor = (status: string) => {
    if (status === "pass") return "text-[#2f7d32]";
    if (status === "needs-improvement") return "text-amber-600";
    return "text-red-600";
  };

  const scoreTone = (score: number) => (score >= 90 ? "text-mint" : score >= 50 ? "text-[#ffb547]" : "text-[#ff7a7a]");

  const renderComparisonRow = (label: string, oldVal: string | number, newVal: string | number, lowerIsBetter: boolean = true) => {
    const oldNum = typeof oldVal === "string" ? parseFloat(oldVal) : oldVal;
    const newNum = typeof newVal === "string" ? parseFloat(newVal) : newVal;

    if (isNaN(oldNum) || isNaN(newNum)) {
      return (
        <div className="flex justify-between items-center py-3 border-b border-ink/10 last:border-0">
          <span className="text-ink/60 font-semibold w-1/3">{label}</span>
          <span className="text-ink/40 w-1/4 text-center">{oldVal}</span>
          <span className="text-ink font-bold w-5/12 text-right">{newVal}</span>
        </div>
      );
    }

    const diff = newNum - oldNum;
    const isImprovement = lowerIsBetter ? diff < 0 : diff > 0;
    const isWorse = lowerIsBetter ? diff > 0 : diff < 0;
    const amount = Math.abs(diff).toFixed(label.includes("score") ? 0 : 2);

    let diffEl = <span className="text-ink/40 text-xs">No change</span>;
    if (isImprovement) diffEl = <span className="text-[#2f7d32] text-xs font-bold">▲ {amount} better</span>;
    if (isWorse) diffEl = <span className="text-red-600 text-xs font-bold">▼ {amount} worse</span>;

    return (
      <div className="flex justify-between items-center py-3 border-b border-ink/10 last:border-0">
        <span className="text-ink/70 font-semibold w-1/3">{label}</span>
        <span className="text-ink/40 w-1/4 text-center">{oldVal}</span>
        <div className="w-5/12 text-right flex flex-col items-end">
          <span className="text-ink font-display font-extrabold text-lg">{newVal}</span>
          {diffEl}
        </div>
      </div>
    );
  };

  const impactBadge = (impact: string) =>
    impact === "high"
      ? "bg-red-50 text-red-600"
      : impact === "medium"
        ? "bg-amber-50 text-amber-700"
        : "bg-ink/5 text-ink/60";

  const setupChips = (plugin?: string) => (
    <div className="flex flex-wrap gap-2">
      {["WordPress", wpContext?.theme?.name, wpContext?.pageBuilder?.name, plugin]
        .filter((x): x is string => Boolean(x))
        .map((x) => (
          <span key={x} className="text-xs font-bold bg-maki/10 text-maki px-2.5 py-1 rounded-full">
            {x}
          </span>
        ))}
    </div>
  );

  const stepList = (steps: string[]) => (
    <ol className="space-y-4">
      {steps.map((step, idx) => (
        <li key={idx} className="flex gap-3 items-start relative">
          {idx !== steps.length - 1 && <span aria-hidden className="absolute left-3 top-7 bottom-[-16px] w-0.5 bg-ink/10" />}
          <span className="w-6 h-6 rounded-full bg-maki text-white flex items-center justify-center text-xs font-bold shrink-0 relative z-10">
            {idx + 1}
          </span>
          <span className="pt-0.5 text-ink/85 leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );

  const renderCard = (fix: WordPressFixRecommendation) => {
    const isCompleted = completedFixIds.includes(fix.fixId);
    const isExpanded = expandedFixId === fix.fixId;

    return (
      <div
        key={fix.fixId}
        className={`rounded-[22px] border overflow-hidden transition-all ${
          isCompleted ? "bg-white/60 border-ink/5" : "bg-white border-ink/10 shadow-sm"
        }`}
      >
        <div
          className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-start gap-4 hover:bg-paper/60 transition-colors"
          onClick={() => setExpandedFixId(isExpanded ? null : fix.fixId)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${impactBadge(fix.impact)}`}>
                {fix.impact} impact
              </span>
              {fix.context?.plugin && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-maki/10 text-maki">Steps for {fix.context.plugin}</span>
              )}
              {isCompleted && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-mint text-ink">✓ Fixed</span>
              )}
            </div>
            <h3 className={`font-display text-lg sm:text-xl font-extrabold leading-snug ${isCompleted ? "line-through text-ink/40" : "text-ink"}`}>
              {fix.title}
            </h3>
            {fix.resource && (
              <p className="mt-2 text-xs font-mono text-ink/50 truncate">
                {typeof fix.resource === "string" ? fix.resource.split("/").pop() : `${fix.resource.length} resources`}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFix(fix.fixId);
              }}
              className={`text-sm px-5 py-2.5 rounded-xl font-bold transition-all ${
                isCompleted ? "bg-mint text-ink hover:brightness-95" : "border-2 border-ink text-ink hover:bg-ink hover:text-white"
              }`}
            >
              {isCompleted ? "✓ Fixed" : "Mark as fixed"}
            </button>
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center bg-paper text-ink/50 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="px-5 sm:px-6 pb-6 pt-5 border-t border-ink/10 bg-paper/60 text-sm space-y-7">
            {wpContext && (
              <div>
                <p className="text-[11px] font-bold text-ink/45 uppercase tracking-widest mb-2">Your setup</p>
                {setupChips(fix.context?.plugin)}
              </div>
            )}

            <div>
              <p className="text-[11px] font-bold text-maki uppercase tracking-widest mb-4">How to fix</p>
              {stepList(fix.steps)}
            </div>

            {fix.resource && (
              <div>
                <p className="text-[11px] font-bold text-ink/45 uppercase tracking-widest mb-2">Affected resource</p>
                <pre className="text-xs font-mono text-ink/70 overflow-x-auto whitespace-pre bg-white p-3 rounded-xl border border-ink/10">
                  {typeof fix.resource === "string" ? fix.resource : fix.resource.join("\n")}
                </pre>
              </div>
            )}

            <div>
              <p className="text-[11px] font-bold text-ink/45 uppercase tracking-widest mb-3">Verify it worked</p>
              <ul className="space-y-2">
                {fix.verification.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-ink/75">
                    <svg className="w-4 h-4 text-[#2f7d32] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            {fix.caution && fix.caution.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900">
                <p className="font-bold text-[11px] uppercase tracking-widest mb-2">Be careful</p>
                <ul className="space-y-1">
                  {fix.caution.map((c, idx) => (
                    <li key={idx}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const NAV: { tab: Tab; label: string; icon: string }[] = [
    { tab: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { tab: "fixes", label: "Fixes", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { tab: "setup", label: "Your setup", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];
  const latest = retests[retests.length - 1];

  return (
    <div className="min-h-screen bg-paper text-ink pb-24 md:pb-0">
      {/* Mobile top bar */}
      <div className="md:hidden bg-ink text-white px-5 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Maki home">
          <Logo className="h-6 w-auto" color="#ffffff" />
        </Link>
        <span className="text-xs font-bold text-white/60">
          {completedCount}/{totalFixes} fixed
        </span>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-ink/10 z-50 flex justify-around p-2 shadow-[0_-10px_40px_rgba(12,13,36,0.06)]">
        {NAV.map((n) => (
          <button
            key={n.tab}
            onClick={() => setActiveTab(n.tab)}
            className={`relative flex flex-col items-center px-4 py-2 rounded-xl transition-colors ${activeTab === n.tab ? "text-ink bg-mint-soft" : "text-ink/40"}`}
          >
            <svg className="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={n.icon} />
            </svg>
            <span className="text-[10px] font-bold">{n.label}</span>
            {n.tab === "fixes" && totalFixes > completedCount && <span className="absolute top-1 right-3 w-2 h-2 bg-maki rounded-full" />}
          </button>
        ))}
      </nav>

      <div className="md:flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:flex-col w-72 shrink-0 bg-ink text-white p-7 sticky top-0 h-screen overflow-y-auto">
          <Link href="/" aria-label="Maki home" className="self-start">
            <Logo className="h-7 w-auto" color="#ffffff" />
          </Link>
          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-mint">Fix plan</p>
          <p className="mt-1 font-display text-xl font-extrabold truncate">{domain}</p>

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-white/60">Progress</span>
              <span className="font-display text-2xl font-extrabold text-mint">{progressPercent}%</span>
            </div>
            <div className="mt-3 w-full bg-white/10 rounded-full h-2">
              <div className="bg-mint h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/50">
              {completedCount} of {totalFixes} fixes done
            </p>
          </div>

          <nav className="mt-8 space-y-1.5">
            {NAV.map((n) => (
              <button
                key={n.tab}
                onClick={() => setActiveTab(n.tab)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  activeTab === n.tab ? "bg-mint text-ink" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={n.icon} />
                  </svg>
                  {n.label}
                </span>
                {n.tab === "fixes" && totalFixes > completedCount && (
                  <span className={`py-0.5 px-2.5 rounded-full text-[10px] font-extrabold ${activeTab === "fixes" ? "bg-ink text-mint" : "bg-maki text-white"}`}>
                    {totalFixes - completedCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <a
            href={`/done-for-you?type=fix&from=dashboard&scan=${scanId}#quote`}
            className="mt-auto rounded-2xl border border-white/10 p-4 hover:bg-white/5 transition-colors"
          >
            <p className="font-bold text-sm">Short on time?</p>
            <p className="text-xs text-white/55 mt-1">We can apply these fixes for you →</p>
          </a>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Header: always on desktop, only on the Overview tab on mobile */}
            <div className={activeTab === "overview" ? "" : "hidden md:block"}>
              {retests.length > 0 && latest ? (
                <div className="bg-white rounded-[28px] p-6 md:p-8 border border-ink/10 shadow-xl shadow-ink/5 mb-8 relative overflow-hidden">
                  {completedCount === totalFixes && totalFixes > 0 && (
                    <Image src="/celebrate.svg" alt="" width={60} height={80} className="absolute top-4 right-5 opacity-90 animate-pop pointer-events-none" />
                  )}
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maki">Re-test results</p>
                  <h2 className="font-display text-3xl font-extrabold tracking-tight mt-1 mb-6">Before &amp; after</h2>
                  <div className="flex text-[11px] font-bold text-ink/40 uppercase tracking-widest mb-2 px-1">
                    <div className="w-1/3">Metric</div>
                    <div className="w-1/4 text-center">Original</div>
                    <div className="w-5/12 text-right">Latest</div>
                  </div>
                  <div className="bg-paper rounded-2xl px-5 py-2">
                    {renderComparisonRow("Performance score", audit.mobileScore, latest.performanceScore ?? "N/A", false)}
                    {renderComparisonRow("LCP", audit.cwvScores.lcp.value.replace("s", ""), latest.lcp.value.replace("s", ""))}
                    {renderComparisonRow("INP", audit.cwvScores.inp.value.replace("ms", ""), latest.inp.value.replace("ms", ""))}
                    {renderComparisonRow("CLS", audit.cwvScores.cls.value, latest.cls.value)}
                  </div>
                  {retests.length > 1 && (
                    <details className="mt-6 text-sm">
                      <summary className="text-maki cursor-pointer font-bold">View past re-tests ({retests.length})</summary>
                      <div className="mt-4 pl-4 space-y-3 border-l-2 border-ink/10">
                        {retests.map((rt, i) => (
                          <div key={i} className="flex justify-between items-center text-ink/70">
                            <span>{new Date(rt.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                            <span className="font-mono bg-paper px-2 py-0.5 rounded-md text-xs font-bold text-ink">Score: {rt.performanceScore ?? "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="bg-ink text-white rounded-[28px] p-6 md:p-8 mb-8 relative overflow-hidden">
                  <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-maki/30 blur-[80px]" />
                  <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                        {wpContext?.status === "likely" ? "WordPress likely detected" : "WordPress detected"}
                      </span>
                      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 truncate">{domain}</h1>
                      <p className="text-white/55 text-sm mt-1">Your WordPress fix plan</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <div className="rounded-2xl bg-white/10 px-5 py-4 text-center min-w-[120px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Performance</p>
                        <p className={`font-display text-4xl font-extrabold leading-none mt-1.5 ${scoreTone(audit.mobileScore)}`}>{audit.mobileScore}</p>
                        <p className="text-[10px] text-white/40 mt-1">mobile</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 grid grid-cols-3 gap-3">
                    {(["lcp", "inp", "cls"] as const).map((k) => (
                      <div key={k} className="rounded-2xl bg-white p-4 text-ink">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-ink/45">{k}</p>
                        <p className={`font-display text-xl sm:text-2xl font-extrabold mt-1 ${metricColor(audit.cwvScores[k].status)}`}>
                          {audit.cwvScores[k].value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-[24px] p-6 border border-ink/10">
                  <h3 className="font-display text-xl font-extrabold mb-4">Fix plan progress</h3>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-ink/70">
                      {completedCount} of {totalFixes} fixes completed
                    </span>
                    <span className="font-bold text-maki">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-ink/10 rounded-full h-2.5">
                    <div className="bg-maki h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>

                  {completedCount > 0 && (
                    <div className="border-t border-ink/10 mt-6 pt-5">
                      {isRetesting ? (
                        <div className="bg-maki/10 text-maki rounded-2xl p-4 text-center">
                          <span className="inline-block w-6 h-6 border-2 border-maki/20 border-t-maki rounded-full animate-spin mb-2" />
                          <p className="font-bold">Re-testing your site…</p>
                          <p className="text-xs mt-1 text-ink/60">Running a fresh PageSpeed test. This takes about a minute.</p>
                        </div>
                      ) : (
                        <div className="sm:flex sm:items-center sm:justify-between gap-4">
                          <p className="text-sm text-ink/70">
                            You marked {completedCount} {completedCount === 1 ? "fix" : "fixes"} as done. See what changed.
                          </p>
                          <button
                            onClick={handleRetest}
                            className="mt-3 sm:mt-0 w-full sm:w-auto shrink-0 bg-ink text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-ink-soft transition-colors"
                          >
                            Re-test my site
                          </button>
                        </div>
                      )}
                      {retestError && <p className="text-xs text-red-600 mt-3">{retestError}</p>}
                    </div>
                  )}
                </div>

                {totalFixes > 0 ? (
                  <div className="bg-white rounded-[24px] p-6 border border-ink/10">
                    <h3 className="font-display text-xl font-extrabold mb-4">Summary</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { n: highImpact.length, label: "High impact", cls: "bg-red-50 text-red-600" },
                        { n: medImpact.length, label: "Medium", cls: "bg-amber-50 text-amber-700" },
                        { n: lowImpact.length, label: "Minor", cls: "bg-paper text-ink/60" },
                      ].map((x) => (
                        <div key={x.label} className={`rounded-2xl p-4 ${x.cls}`}>
                          <p className="font-display text-3xl font-extrabold">{x.n}</p>
                          <p className="text-xs font-bold mt-0.5">{x.label}</p>
                        </div>
                      ))}
                    </div>

                    {nextFix && (
                      <div className="mt-8 animate-slide-up-fade">
                        <p className="text-[11px] font-bold text-maki uppercase tracking-[0.2em] mb-3">Next priority fix</p>
                        <div
                          className="rounded-[22px] border-2 border-ink p-6 cursor-pointer hover:bg-paper/60 transition-colors"
                          onClick={() => {
                            setActiveTab("fixes");
                            setExpandedFixId(nextFix.fixId);
                          }}
                        >
                          <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${impactBadge(nextFix.impact)}`}>
                            {nextFix.impact} impact
                          </span>
                          <h4 className="font-display text-2xl font-extrabold leading-snug mt-3">{nextFix.title}</h4>

                          {nextFix.resource && (
                            <p className="mt-2 text-xs font-mono text-ink/50 truncate">
                              {typeof nextFix.resource === "string" ? nextFix.resource : nextFix.resource[0]}
                              {Array.isArray(nextFix.resource) && nextFix.resource.length > 1 && ` (+${nextFix.resource.length - 1} more)`}
                            </p>
                          )}

                          {wpContext && <div className="mt-4">{setupChips(nextFix.context?.plugin)}</div>}

                          <div className="mt-5 bg-paper p-5 rounded-2xl text-sm">
                            <p className="text-[11px] font-bold text-maki uppercase tracking-widest mb-4">How to fix</p>
                            {stepList(nextFix.steps.slice(0, 3))}
                            {nextFix.steps.length > 3 && <p className="mt-3 text-xs text-ink/50">+ {nextFix.steps.length - 3} more steps</p>}
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold text-ink">View full instructions →</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFix(nextFix.fixId);
                              }}
                              className="text-sm px-5 py-2.5 rounded-xl font-bold bg-ink text-white hover:bg-ink-soft transition-colors"
                            >
                              Mark as fixed
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-[24px] p-8 border border-ink/10 text-center">
                    <div className="w-12 h-12 rounded-full bg-mint flex items-center justify-center mx-auto mb-4 text-ink font-bold">✓</div>
                    <h3 className="font-display text-xl font-extrabold mb-2">No major WordPress performance issues were detected.</h3>
                    <p className="text-sm text-ink/60">Your setup is looking solid based on Maki&apos;s fix library.</p>
                  </div>
                )}
              </div>
            )}

            {/* FIXES */}
            {activeTab === "fixes" && (
              <div>
                <div className="mb-6">
                  <h2 className="font-display text-3xl font-extrabold tracking-tight">Your WordPress fixes</h2>
                  <p className="text-sm text-ink/60 mt-1">Ordered by impact, with steps for the plugins on your site.</p>
                </div>

                {fixes.length === 0 ? (
                  <div className="bg-white rounded-[22px] p-8 border border-ink/10 text-center text-ink/60">No structured fixes to display.</div>
                ) : (
                  <div className="space-y-3">{fixes.map((fix) => renderCard(fix))}</div>
                )}

                <div className="mt-8 rounded-[24px] bg-ink text-white p-6 sm:flex sm:items-center sm:justify-between gap-6">
                  <div>
                    <p className="font-display text-xl font-extrabold">Short on time? We can apply these fixes for you.</p>
                    <p className="text-sm text-white/60 mt-1">Backups first, fixed quote, before/after report.</p>
                  </div>
                  <a
                    href={`/done-for-you?type=fix&from=dashboard&scan=${scanId}#quote`}
                    className="mt-4 sm:mt-0 inline-block shrink-0 rounded-xl bg-mint text-ink font-bold px-5 py-3"
                  >
                    Get a quote →
                  </a>
                </div>
              </div>
            )}

            {/* SETUP */}
            {activeTab === "setup" && (
              <div className="bg-white rounded-[24px] p-6 border border-ink/10">
                <h2 className="font-display text-2xl font-extrabold mb-1">Your setup</h2>
                <p className="text-sm text-ink/60 mb-5">What Maki detected on your site, and why.</p>
                {wpContext?.allDetected?.length ? (
                  <div className="divide-y divide-ink/10">
                    {wpContext.allDetected.map((tech, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-center gap-3">
                          <span className="font-bold">{tech.name}</span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              tech.confidence === "confirmed" ? "bg-mint-soft text-[#2f7d32]" : "bg-paper text-ink/60"
                            }`}
                          >
                            {tech.confidence}
                          </span>
                        </div>
                        <p className="text-xs text-ink/50 mt-1 capitalize">{tech.type}</p>
                        <details className="mt-2 text-xs">
                          <summary className="text-ink/45 cursor-pointer hover:text-ink">Why we think this</summary>
                          <ul className="mt-2 pl-4 list-disc space-y-1 text-ink/55 font-mono text-[11px]">
                            {tech.evidence.map((ev, i) => (
                              <li key={i}>{ev}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink/60">No specific technologies detected.</p>
                )}
              </div>
            )}

            <p className="mt-12 pt-8 border-t border-ink/10 text-center pb-12 text-sm text-ink/40">Maki · WordPress fix plan</p>
          </div>
        </main>
      </div>
    </div>
  );
}
