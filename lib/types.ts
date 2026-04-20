export type Tier = "basic" | "pro";

export type Verdict = "excellent" | "good" | "needs-work" | "poor";

export type DetectedPlatform =
  | "wordpress"
  | "shopify"
  | "webflow"
  | "static"
  | "custom"
  | "unknown";

export type CWVStatus = "pass" | "fail" | "needs-improvement";

export interface CWVMetric {
  value: string;
  status: "pass" | "fail";
  meaning: string;
}

export interface TopFix {
  rank: number;
  problemHeadline: string;
  whyItMatters: string;
  whatToDo: string;
  estimatedImpact: string;
}

export interface QuickWin {
  title: string;
  steps: string[];
}

export interface AuditResult {
  url: string;
  auditDate: string;
  overallVerdict: "pass" | "fail";
  verdict: Verdict;
  detectedPlatform?: DetectedPlatform;
  summaryParagraph: string;
  cwvScores: {
    lcp: CWVMetric;
    inp: CWVMetric;
    cls: CWVMetric;
  };
  topFixes: TopFix[];
  quickWin: QuickWin;
  checklistAfter: string[];
  mobileScore: number;
  desktopScore: number;
}

export interface ScanStoreEntry {
  scanId: string;
  url: string;
  tier: Tier;
  audit: AuditResult;
  createdAt: number;
}

export interface TeaserResult {
  url: string;
  verdict: Verdict;
  summaryParagraph: string;
  createdAt: number;
}

export interface ScanRequest {
  url: string;
  tier: Tier;
}

export interface CheckoutRequest {
  scanId: string;
}

export interface AuditRequest {
  sessionId: string;
}
