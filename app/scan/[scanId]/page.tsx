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
  const entry = getScan(scanId);

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

  return (
    <main className="min-h-screen bg-gray-50 text-[#282f42]">
      <header className="px-6 py-5 border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo className="h-7 w-auto" />
          </Link>
          <span className="text-sm text-gray-500">Free preview</span>
        </div>
      </header>

      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-gray-500 mb-2 truncate">
            Results for{" "}
            <span className="font-mono text-gray-700">{teaser.url}</span>
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mb-10 tracking-tight">
            Your site&apos;s verdict
          </h1>

          <div
            className={`animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out rounded-[2.5rem] border-2 ${colors.border} ${colors.bg} p-8 sm:p-12 mb-8 flex flex-col sm:flex-row items-center gap-8 sm:gap-10 text-center sm:text-left overflow-hidden relative shadow-xl shadow-gray-200/50`}
          >
            <div className="shrink-0">
              <Speedometer verdict={teaser.verdict} score={teaser.mobileScore} />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col items-center sm:items-start mb-1">
                <div 
                  className="px-3 py-1 rounded-full bg-white/50 border border-current font-black text-sm tracking-widest uppercase mb-2"
                  style={{ color: colors.hex }}
                >
                  Score: {teaser.mobileScore}
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
              <p className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                {verdictSublabel(teaser.verdict)}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-gray-500 mb-4">
              What&apos;s behind this verdict
            </h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-[#268ad8] mt-0.5">✦</span>
                <span>Your exact LCP, INP, and CLS values</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#268ad8] mt-0.5">✦</span>
                <span>Mobile and desktop performance scores</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#268ad8] mt-0.5">✦</span>
                <span>
                  The 7 biggest problems on your site — ranked by impact
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#268ad8] mt-0.5">✦</span>
                <span>Step-by-step fix instructions tailored to your stack</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#268ad8] mt-0.5">✦</span>
                <span>A 10-minute quick win + infrastructure tips</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#268ad8] mt-0.5">✦</span>
                <span>Downloadable PDF report</span>
              </div>
            </div>
          </div>

          <UnlockButton scanId={scanId} score={teaser.mobileScore} />

          <p className="text-center text-xs text-gray-500 mt-6">
            One-time payment · No subscription · Instant PDF
          </p>
        </div>
      </section>
    </main>
  );
}
