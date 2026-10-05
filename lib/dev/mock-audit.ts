import { detectWordPressContext } from "@/lib/wp-detection";
import { matchWordPressFixes } from "@/lib/wp-fixes/matcher";
import { deriveVerdict } from "@/lib/verdict";
import type { AuditResult, CWVMetric } from "@/lib/types";
import fixture from "@/lib/dev/fixtures/wpastra-psi.json";

// Development-only: an AuditResult built from a real PageSpeed Insights response
// (wpastra.com, Lighthouse 13.5), so pages can be previewed without Stripe or Firestore.

type Audits = Record<string, { numericValue?: number; displayValue?: string }>;

function metric(audits: Audits, id: string, goodBelow: number, label: string): CWVMetric {
  const a = audits[id];
  const pass = typeof a?.numericValue === "number" && a.numericValue <= goodBelow;
  return { value: a?.displayValue ?? "n/a", status: pass ? "pass" : "fail", meaning: `${pass ? "Good" : "Poor"} ${label}` };
}

export function buildMockAudit(): AuditResult {
  const mobile = fixture as unknown as Record<string, unknown>;
  const lh = (fixture as { lighthouseResult: { audits: Audits; finalDisplayedUrl: string } }).lighthouseResult;
  const wordpressContext = detectWordPressContext({ mobile, desktop: mobile });
  const structuredFixes = matchWordPressFixes({ mobile }, wordpressContext);
  const mobileScore = Math.round(
    ((fixture.lighthouseResult as { categories?: { performance?: { score?: number } } }).categories?.performance?.score ?? 0) * 100
  );
  const desktopScore = 69;

  return {
    url: lh.finalDisplayedUrl,
    auditDate: new Date().toISOString(),
    overallVerdict: "fail",
    verdict: deriveVerdict(mobileScore, desktopScore),
    summaryParagraph:
      "Your homepage takes almost 9 seconds to show its main content on mobile. Most of that delay comes from a heavy hero image, render-blocking CSS from your block plugins, and over a second of Google Tag Manager work on the main thread.",
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
    lighthouseCategories: { performance: mobileScore, accessibility: 0, bestPractices: 0, seo: 0 },
    fieldDataAvailable: false,
    topFixes: [],
    structuredFixes,
    quickWin: { title: structuredFixes[0]?.title ?? "", steps: structuredFixes[0]?.steps ?? [] },
    seoSnippets: [],
    checklistAfter: ["Clear your site cache and CDN cache.", "Run Maki again to compare."],
    mobileScore,
    desktopScore,
  };
}
