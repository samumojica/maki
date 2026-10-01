import Link from "next/link";
import { getScan } from "@/lib/scan-store";
import { verdictLabel, verdictSublabel, verdictColor } from "@/lib/verdict";
import type { TeaserResult } from "@/lib/types";
import { Speedometer } from "./unlock-button";
import UnlockButton from "./unlock-button";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function ScanTeaserPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;
  const entry = await getScan(scanId);

  if (!entry) {
    return (
      <main className="min-h-screen bg-white text-[#282f42] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-3">Scan expired</h1>
          <p className="text-gray-600 mb-8">
            Scans are saved for 30 minutes. Run a new one to see your results.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#268ad8] text-white px-5 py-3 rounded-full font-medium hover:bg-[#1e6fb0] transition"
          >
            Run a new scan
          </Link>
        </div>
      </main>
    );
  }

  const teaser: TeaserResult = {
    url: entry.audit.url,
    verdict: entry.audit.verdict,
    mobileScore: entry.audit.mobileScore ?? 0,
    desktopScore: entry.audit.desktopScore ?? 0,
    summaryParagraph: entry.audit.summaryParagraph,
    createdAt: entry.createdAt,
  };

  const colors = verdictColor(teaser.verdict);
  const wpContext = entry.audit.siteInfo?.wordpressContext;
  
  let wpDetectionStatus = "";
  if (wpContext?.status === "confirmed") {
    wpDetectionStatus = "WordPress detected";
  } else if (wpContext?.status === "likely") {
    wpDetectionStatus = "WordPress likely detected";
  }

  const wpTechnologies = wpContext?.allDetected?.map(t => t.name).join(" · ") || "";
  const highImpactCount = entry.audit.structuredFixes?.filter((f: any) => f.impact === "high").length || 0;
  const additionalCount = entry.audit.structuredFixes?.filter((f: any) => f.impact !== "high").length || 0;

  const metricColor = (status: "pass" | "fail" | "needs-improvement") => {
    if (status === "pass") return "text-green-600";
    if (status === "needs-improvement") return "text-amber-500";
    return "text-red-600";
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <main className="min-h-screen bg-gray-50 text-[#282f42] font-sans">
      <header className="px-6 py-5 border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo className="h-7 w-auto" />
          </Link>
          <span className="text-sm text-gray-500 font-medium">Free preview</span>
        </div>
      </header>

      <section className="px-6 py-12 sm:py-20 relative overflow-hidden bg-[#f3fbff]">
        {/* Gentle background decoration */}
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#268ad8] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#c84367] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10">
          <p className="text-sm text-gray-500 mb-2 truncate text-center">
            Results for{" "}
            <span className="font-mono text-gray-700">{teaser.url}</span>
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mb-8 tracking-tight text-center">
            Your site&apos;s verdict
          </h1>

          <div
            className={`animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out rounded-3xl border-2 ${colors.border} ${colors.bg} p-6 sm:p-10 mb-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-center sm:text-left overflow-hidden relative shadow-xl shadow-gray-200/50 bg-white`}
          >
            <div className="shrink-0 scale-90 sm:scale-100">
              <Speedometer verdict={teaser.verdict} score={teaser.mobileScore} />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col items-center sm:items-start mb-1">
                <div 
                  className="px-3 py-1 rounded-full bg-white border border-current font-black text-sm tracking-widest uppercase mb-2"
                  style={{ color: colors.hex }}
                >
                  Performance score: {teaser.mobileScore}
                </div>
              </div>
              <div
                className={`font-black mb-2 leading-none ${
                  teaser.verdict === "poor" 
                    ? "text-4xl sm:text-5xl text-red-500" 
                    : `text-5xl sm:text-6xl ${colors.text}`
                }`}
              >
                {verdictLabel(teaser.verdict)}
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                {verdictSublabel(teaser.verdict)}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
            {wpDetectionStatus && (
              <div className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#268ad8] bg-blue-50 px-2.5 py-1 rounded-md">
                      {wpDetectionStatus}
                    </span>
                    {wpTechnologies && (
                      <p className="text-sm text-gray-500 mt-2 font-medium">{wpTechnologies}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">LCP</p>
                <p className={`text-xl font-bold ${metricColor(entry.audit.cwvScores.lcp.status)}`}>{entry.audit.cwvScores.lcp.value}</p>
                <p className={`text-[10px] font-bold uppercase mt-1 ${metricColor(entry.audit.cwvScores.lcp.status)}`}>{capitalize(entry.audit.cwvScores.lcp.status.replace('-', ' '))}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">INP</p>
                <p className={`text-xl font-bold ${metricColor(entry.audit.cwvScores.inp.status)}`}>{entry.audit.cwvScores.inp.value}</p>
                {entry.audit.cwvScores.inp.value.includes("N/A") ? (
                  <p className="text-[10px] font-bold uppercase mt-1 text-gray-400">Field Data Only</p>
                ) : (
                  <p className={`text-[10px] font-bold uppercase mt-1 ${metricColor(entry.audit.cwvScores.inp.status)}`}>{capitalize(entry.audit.cwvScores.inp.status.replace('-', ' '))}</p>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">CLS</p>
                <p className={`text-xl font-bold ${metricColor(entry.audit.cwvScores.cls.status)}`}>{entry.audit.cwvScores.cls.value}</p>
                <p className={`text-[10px] font-bold uppercase mt-1 ${metricColor(entry.audit.cwvScores.cls.status)}`}>{capitalize(entry.audit.cwvScores.cls.status.replace('-', ' '))}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">We found:</p>
              <p className="text-lg font-bold text-gray-900">{highImpactCount} high-impact fixes</p>
              {additionalCount > 0 && <p className="text-sm text-gray-600 mt-1">{additionalCount} additional improvements</p>}
            </div>
          </div>

          {wpContext?.eligible === false ? (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 text-center text-amber-900 shadow-sm">
              <h2 className="text-lg font-bold mb-2">We couldn&apos;t confidently detect WordPress on this site.</h2>
              <p className="text-sm">
                Maki currently creates detailed fix plans specifically for WordPress sites.
              </p>
            </div>
          ) : (
            <>
              <UnlockButton scanId={scanId} score={teaser.mobileScore} />

              <p className="text-center text-xs font-medium text-gray-500 mt-6 flex justify-center items-center gap-2 flex-wrap">
                <span>One-time payment</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
                <span>No subscription</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
                <span>No account required</span>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
