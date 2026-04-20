import Link from "next/link";
import { getScan } from "@/lib/scan-store";
import { verdictLabel, verdictSublabel, verdictColor } from "@/lib/verdict";
import type { TeaserResult } from "@/lib/types";
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
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-500 mb-2 truncate">
            Results for{" "}
            <span className="font-mono text-gray-700">{teaser.url}</span>
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-10">
            Your site&apos;s verdict
          </h1>

          <div
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-10 mb-8 text-center`}
          >
            <div
              className={`inline-block text-5xl sm:text-6xl font-bold ${colors.text} mb-4 tracking-tight`}
            >
              {verdictLabel(teaser.verdict)}
            </div>
            <p className="text-lg text-gray-700 max-w-md mx-auto">
              {verdictSublabel(teaser.verdict)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-gray-500 mb-3">
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
                  The 5 biggest problems on your site — ranked by impact
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

          <UnlockButton scanId={scanId} tier={entry.tier} />

          <p className="text-center text-xs text-gray-500 mt-6">
            One-time payment · No subscription · Instant PDF
          </p>
        </div>
      </section>
    </main>
  );
}
