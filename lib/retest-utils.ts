import { RetestRecord, CWVMetric } from "./types";

export function extractRetestMetrics(psiData: { mobile: any; desktop?: any }): Omit<RetestRecord, 'id' | 'createdAt'> {
  const m = psiData.mobile?.lighthouseResult;
  if (!m) {
    throw new Error("Invalid PSI payload: missing mobile lighthouseResult");
  }

  const audits = m.audits || {};
  const categories = m.categories || {};

  const perfScore = categories.performance?.score != null ? Math.round(categories.performance.score * 100) : null;

  const extractMetric = (auditId: string): CWVMetric => {
    const audit = audits[auditId];
    if (!audit) return { value: "N/A", status: "fail", meaning: "Missing" };

    const score = audit.score;
    let status: "pass" | "fail" = "fail";
    if (score >= 0.9) status = "pass";

    return {
      value: audit.displayValue || `${audit.numericValue || "N/A"}`,
      status,
      meaning: audit.title || "Metric"
    };
  };

  return {
    performanceScore: perfScore,
    lcp: extractMetric("largest-contentful-paint"),
    inp: { value: "Lab N/A", status: "fail", meaning: "Field Data Only" }, // INP is field-only
    cls: extractMetric("cumulative-layout-shift"),
    ttfb: extractMetric("server-response-time")
  };
}
