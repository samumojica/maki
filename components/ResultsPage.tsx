"use client";

import { useState } from "react";
import { AuditResult } from "@/lib/types";
import { STATIC_TIPS } from "@/lib/static-tips";
import { Logo } from "./Logo";

interface Props {
  audit: AuditResult;
}

function StatusBadge({ status }: { status: "pass" | "fail" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        status === "pass"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "pass" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {status === "pass" ? "Pass" : "Fail"}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 90 ? "text-green-600" : score >= 50 ? "text-yellow-500" : "text-red-500";
  return (
    <div className={`text-3xl font-semibold ${color}`}>{score}</div>
  );
}

export default function ResultsPage({ audit }: Props) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const [{ pdf }, { PDFReport }, React] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./PDFReport"),
        import("react"),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = React.createElement(PDFReport as any, { audit }) as any;
      const blob = await pdf(doc).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `maki-report-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const { lcp, inp, cls } = audit.cwvScores;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Logo className="h-7 w-auto" />
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-[#268ad8] text-white text-sm font-medium rounded-lg hover:bg-[#1e6fb0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloading ? "Generating PDF…" : "Download Full Report (PDF)"}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        {/* Site + verdict */}
        <div>
          <p className="text-sm text-gray-500 mb-1 truncate">{audit.url}</p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#282f42]">Performance Report</h1>
            <StatusBadge status={audit.overallVerdict} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Audited {new Date(audit.auditDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Lighthouse Scores */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Lighthouse Score
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-4 text-center">
              <ScoreRing score={audit.mobileScore} />
              <p className="text-xs text-gray-500 mt-1">Mobile</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 text-center">
              <ScoreRing score={audit.desktopScore} />
              <p className="text-xs text-gray-500 mt-1">Desktop</p>
            </div>
          </div>
        </section>

        {/* CWV Scores */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Core Web Vitals
          </h2>
          <div className="space-y-3">
            {[
              { key: "LCP", label: "Largest Contentful Paint", description: "How fast the biggest thing on your page appears.", metric: lcp },
              { key: "INP", label: "Interaction to Next Paint", description: "How quickly your page responds when someone taps or clicks.", metric: inp },
              { key: "CLS", label: "Cumulative Layout Shift", description: "How much stuff jumps around as the page loads.", metric: cls },
            ].map(({ key, label, description, metric }) => (
              <div
                key={key}
                className="border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-[#282f42]">{label}</p>
                      <span className="text-[10px] font-mono font-semibold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 tracking-wide">
                        {key}
                      </span>
                      <StatusBadge status={metric.status} />
                    </div>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                  <p className="text-2xl font-bold text-[#282f42] shrink-0 tabular-nums">
                    {metric.value}
                  </p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{metric.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            What This Means
          </h2>
          <p className="text-gray-700 leading-relaxed">{audit.summaryParagraph}</p>
        </section>

        {/* Quick Win */}
        <section className="bg-[#e8f3fb] border border-[#d1e7f6] rounded-xl p-5">
          <p className="text-xs font-medium text-[#268ad8] uppercase tracking-wide mb-2">
            Quick Win — Under 10 Minutes
          </p>
          <p className="font-medium text-[#282f42] mb-3">{audit.quickWin.title}</p>
          <ol className="space-y-1">
            {audit.quickWin.steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="shrink-0 text-[#268ad8] font-medium">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* Top Fixes */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Your Top Fixes
          </h2>
          <div className="space-y-4">
            {audit.topFixes.map((fix) => (
              <div key={fix.rank} className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {fix.rank}
                  </span>
                  <h3 className="font-medium text-[#282f42]">{fix.problemHeadline}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 ml-9">{fix.whyItMatters}</p>
                <div className="ml-9 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line">
                  {fix.whatToDo}
                </div>
                <p className="text-xs text-green-600 font-medium mt-2 ml-9">
                  {fix.estimatedImpact}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            After You Apply the Fixes
          </h2>
          <ul className="space-y-2">
            {audit.checklistAfter.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-4 h-4 border border-gray-300 rounded mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* General Infrastructure Tips */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
            General Infrastructure Tips
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Not in your top 5 fixes, but every fast site does these.
          </p>
          <div className="space-y-3">
            {STATIC_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="border border-gray-200 rounded-xl p-4"
              >
                <h3 className="text-sm font-semibold text-[#282f42] mb-1">
                  {tip.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Download CTA */}
        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Save your full report as a PDF to share with your developer.
          </p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#268ad8] text-white text-sm font-medium rounded-lg hover:bg-[#1e6fb0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? "Generating PDF…" : "Download Full Report (PDF)"}
          </button>
        </div>
      </div>
    </main>
  );
}
