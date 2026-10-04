import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { detectWordPressContext } from "@/lib/wp-detection";
import { matchWordPressFixes } from "@/lib/wp-fixes/matcher";
import type { AuditResult, CWVMetric } from "@/lib/types";
import fixture from "@/lib/dev/fixtures/wpastra-psi.json";

// Development-only preview of the paid dashboard, built from a real PageSpeed
// Insights response (wpastra.com, Lighthouse 13.5). No Stripe, no Firestore.

export const metadata: Metadata = {
  title: "Dashboard preview (dev)",
  robots: { index: false, follow: false },
};

type Audits = Record<string, { numericValue?: number; displayValue?: string }>;

function metric(audits: Audits, id: string, goodBelow: number, label: string): CWVMetric {
  const a = audits[id];
  const pass = typeof a?.numericValue === "number" && a.numericValue <= goodBelow;
  return { value: a?.displayValue ?? "n/a", status: pass ? "pass" : "fail", meaning: `${pass ? "Good" : "Poor"} ${label}` };
}

export default function DashboardPreview() {
  if (process.env.NODE_ENV === "production") notFound();

  const mobile = fixture as unknown as Record<string, unknown>;
  const lh = (fixture as { lighthouseResult: { audits: Audits; finalDisplayedUrl: string } }).lighthouseResult;
  const wordpressContext = detectWordPressContext({ mobile, desktop: mobile });
  const structuredFixes = matchWordPressFixes({ mobile }, wordpressContext);
  const performance = Math.round(
    ((fixture.lighthouseResult as { categories?: { performance?: { score?: number } } }).categories?.performance?.score ?? 0) * 100
  );

  const audit: AuditResult = {
    url: lh.finalDisplayedUrl,
    auditDate: new Date().toISOString(),
    overallVerdict: "fail",
    verdict: "needs-work",
    summaryParagraph:
      "Preview built from a real PageSpeed Insights scan. Fixes below come from the live matcher and fix library.",
    siteInfo: {
      detectedPlatform: "wordpress",
      technologies: wordpressContext.allDetected.map((t) => t.name),
      wordpressContext,
    },
    cwvScores: {
      lcp: metric(lh.audits, "largest-contentful-paint", 2500, "LCP"),
      inp: metric(lh.audits, "total-blocking-time", 200, "INP (TBT proxy)"),
      cls: metric(lh.audits, "cumulative-layout-shift", 0.1, "CLS"),
    },
    lighthouseCategories: { performance, accessibility: 0, bestPractices: 0, seo: 0 },
    fieldDataAvailable: false,
    topFixes: [],
    structuredFixes,
    quickWin: { title: structuredFixes[0]?.title ?? "", steps: structuredFixes[0]?.steps ?? [] },
    seoSnippets: [],
    checklistAfter: ["Clear your site cache and CDN cache.", "Run Maki again to compare."],
    mobileScore: performance,
    desktopScore: performance,
  };

  return <Dashboard audit={audit} scanId="dev-preview" initialRetests={[]} />;
}
