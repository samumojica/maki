export type Tier = "basic";

export type Verdict = "excellent" | "good" | "needs-work" | "poor";

export type DetectedPlatform =
  | "wordpress"
  | "shopify"
  | "webflow"
  | "squarespace"
  | "wix"
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
  codeSnippet?: string;
  snippetLang?: string;
  resourceUrl?: string;
  resourceLabel?: string;
  estimatedImpact: string;
}

export interface QuickWin {
  title: string;
  steps: string[];
}

export interface SEOSnippet {
  title: string;
  description: string;
  code: string;
  lang: string;
}

export interface SiteInfo {
  detectedPlatform: DetectedPlatform;
  serverSoftware?: string;
  serverCountry?: string;
  cdnDetected?: string;
  technologies?: string[];
}

export interface AuditResult {
  url: string;
  auditDate: string;
  overallVerdict: "pass" | "fail";
  verdict: Verdict;
  siteInfo: SiteInfo;
  summaryParagraph: string;
  cwvScores: {
    lcp: CWVMetric;
    inp: CWVMetric;
    cls: CWVMetric;
  };
  lighthouseCategories?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  fieldDataAvailable: boolean;
  topFixes: TopFix[];
  quickWin: QuickWin;
  seoSnippets: SEOSnippet[];
  checklistAfter: string[];
  mobileScore: number;
  desktopScore: number;
  /** @deprecated Use siteInfo.detectedPlatform instead */
  detectedPlatform?: DetectedPlatform;
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
  mobileScore: number;
  desktopScore: number;
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
