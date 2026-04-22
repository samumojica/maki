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

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 90 ? "text-green-600" : score >= 50 ? "text-yellow-500" : "text-red-500";
  return (
    <div className="border border-gray-200 rounded-xl p-4 text-center">
      <div className={`text-3xl font-semibold ${color}`}>{score}</div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative group mt-3">
      <div className="bg-[#1e1e2e] rounded-lg overflow-hidden">
        {lang && (
          <div className="px-3 py-1.5 bg-[#2a2a3e] text-[10px] text-gray-400 uppercase tracking-wider font-mono border-b border-gray-700/50">
            {lang}
          </div>
        )}
        <pre className="p-4 text-sm text-gray-200 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
      <CopyButton text={code} />
    </div>
  );
}

const PLATFORM_LABELS: Record<string, string> = {
  wordpress: "WordPress",
  shopify: "Shopify",
  webflow: "Webflow",
  squarespace: "Squarespace",
  wix: "Wix",
  static: "Static Site",
  custom: "Custom Stack",
  unknown: "Unknown",
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", DE: "🇩🇪", GB: "🇬🇧", FR: "🇫🇷", NL: "🇳🇱", JP: "🇯🇵",
  AU: "🇦🇺", CA: "🇨🇦", BR: "🇧🇷", IN: "🇮🇳", SG: "🇸🇬", IE: "🇮🇪",
  SE: "🇸🇪", FI: "🇫🇮", KR: "🇰🇷", ES: "🇪🇸", IT: "🇮🇹", MX: "🇲🇽",
  AR: "🇦🇷", CL: "🇨🇱", CO: "🇨🇴", PL: "🇵🇱", CZ: "🇨🇿", RO: "🇷🇴",
  HK: "🇭🇰", TW: "🇹🇼", RU: "🇷🇺", ZA: "🇿🇦",
};

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
  const siteInfo = audit.siteInfo ?? {
    detectedPlatform: audit.detectedPlatform ?? "unknown",
  };

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

        {/* Site Info Card */}
        {siteInfo && (
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Site Technology
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Platform</p>
                <p className="text-sm font-semibold text-[#282f42]">
                  {PLATFORM_LABELS[siteInfo.detectedPlatform] ?? "Unknown"}
                </p>
              </div>
              {siteInfo.serverSoftware && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Server</p>
                  <p className="text-sm font-semibold text-[#282f42]">{siteInfo.serverSoftware}</p>
                </div>
              )}
              {siteInfo.cdnDetected && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">CDN</p>
                  <p className="text-sm font-semibold text-[#282f42]">{siteInfo.cdnDetected}</p>
                </div>
              )}
              {siteInfo.serverCountry && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Origin</p>
                  <p className="text-sm font-semibold text-[#282f42]">
                    {COUNTRY_FLAGS[siteInfo.serverCountry] ?? "🌐"} {siteInfo.serverCountry}
                  </p>
                </div>
              )}
            </div>
            {siteInfo.technologies && siteInfo.technologies.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Technologies Detected</p>
                <div className="flex flex-wrap gap-1.5">
                  {siteInfo.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Data source notice */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700">
            {audit.fieldDataAvailable
              ? "These scores are based on real Chrome user visits from the past 28 days (CrUX field data) — not synthetic tests."
              : "This site doesn't have enough traffic for real user data yet. These scores are from Lighthouse lab tests — a simulated page load."}
          </p>
        </div>

        {/* Lighthouse Scores */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Lighthouse Scores
            </h2>
            <div className="flex items-center gap-2 opacity-30 grayscale scale-75 origin-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by</span>
              <img 
                src="/assets/lighthouse.svg" 
                alt="Lighthouse" 
                className="h-4 w-auto"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ScoreRing score={audit.mobileScore} label="Mobile" />
            <ScoreRing score={audit.desktopScore} label="Desktop" />
            {audit.lighthouseCategories && (
              <>
                <ScoreRing score={audit.lighthouseCategories.accessibility} label="Accessibility" />
                <ScoreRing score={audit.lighthouseCategories.seo} label="SEO" />
              </>
            )}
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
            Your Top {audit.topFixes.length} Fixes
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

                {/* How to fix it */}
                <div className="ml-9">
                  <p className="text-xs font-semibold text-[#268ad8] uppercase tracking-wide mb-2">
                    How to fix it
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line">
                    {fix.whatToDo}
                  </div>
                </div>

                {/* Code snippet */}
                {fix.codeSnippet && (
                  <div className="ml-9">
                    <CodeBlock code={fix.codeSnippet} lang={fix.snippetLang} />
                  </div>
                )}

                {/* Resource link */}
                {fix.resourceUrl && (
                  <div className="ml-9 mt-3">
                    <a
                      href={fix.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#268ad8] hover:text-[#1e6fb0] transition-colors font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {fix.resourceLabel ?? "Learn more"}
                    </a>
                  </div>
                )}

                <p className="text-xs text-green-600 font-medium mt-3 ml-9">
                  {fix.estimatedImpact}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO Snippets */}
        {audit.seoSnippets && audit.seoSnippets.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              SEO Snippets
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Ready-to-paste code to improve your search engine visibility.
            </p>
            <div className="space-y-4">
              {audit.seoSnippets.map((snippet, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#282f42] mb-1">{snippet.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{snippet.description}</p>
                  <CodeBlock code={snippet.code} lang={snippet.lang} />
                </div>
              ))}
            </div>
          </section>
        )}

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
            Not in your top fixes, but every fast site does these.
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

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-1">Important Disclaimer</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Implementing these recommendations does not guarantee an immediate improvement in your Core Web Vitals scores or search rankings.
                Google&apos;s field data (CrUX) updates on a 28-day rolling cycle, so changes typically take 2-4 weeks to reflect in scores.
                Results depend on many factors including your hosting, traffic patterns, and how the changes are implemented.
                All sales are final.
              </p>
            </div>
          </div>
        </div>

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

          <div className="mt-8 text-xs text-gray-400">
            Have questions or feedback? Contact us at{" "}
            <a href="mailto:support@getmaki.app" className="text-[#268ad8] hover:underline font-medium">
              support@getmaki.app
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
