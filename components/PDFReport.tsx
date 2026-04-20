import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { AuditResult, TopFix } from "@/lib/types";
import { STATIC_TIPS } from "@/lib/static-tips";

Font.register({
  family: "Helvetica",
  fonts: [],
});

const colors = {
  pass: "#16a34a",
  fail: "#dc2626",
  passLight: "#f0fdf4",
  failLight: "#fef2f2",
  blue: "#268ad8",
  blueLight: "#e8f3fb",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray700: "#374151",
  gray900: "#282f42",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.gray900,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    right: 48,
    fontSize: 9,
    color: colors.gray400,
  },
  // Cover
  coverPage: {
    flex: 1,
    justifyContent: "center",
  },
  coverLabel: {
    fontSize: 9,
    color: colors.blue,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
    marginBottom: 8,
    lineHeight: 1.3,
  },
  coverUrl: {
    fontSize: 13,
    color: colors.gray500,
    marginBottom: 32,
  },
  verdictBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 48,
  },
  verdictDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  verdictText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  coverMeta: {
    fontSize: 9,
    color: colors.gray400,
    marginTop: 8,
  },
  // Section headers
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  // Score cards
  scoreRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  scoreCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.gray500,
  },
  // CWV metric rows
  metricRow: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metricHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
    flexWrap: "wrap",
  },
  metricName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
  },
  metricKeyChip: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.gray700,
    backgroundColor: colors.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
  },
  metricDescription: {
    fontSize: 8,
    color: colors.gray400,
    marginBottom: 6,
  },
  metricMeaning: {
    fontSize: 9,
    color: colors.gray500,
    lineHeight: 1.5,
  },
  badge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  // Summary
  summaryText: {
    fontSize: 10,
    color: colors.gray700,
    lineHeight: 1.7,
  },
  // Quick win box
  quickWinBox: {
    backgroundColor: colors.blueLight,
    borderWidth: 1,
    borderColor: "#d1e7f6",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
  },
  quickWinLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.blue,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  quickWinTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
    marginBottom: 8,
  },
  quickWinStep: {
    fontSize: 9,
    color: colors.gray700,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  // Fix cards
  fixCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  fixHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  fixRankBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  fixRankText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.gray700,
  },
  fixHeadline: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
  },
  fixWhy: {
    fontSize: 9,
    color: colors.gray500,
    lineHeight: 1.5,
    marginBottom: 8,
    marginLeft: 26,
  },
  fixSteps: {
    backgroundColor: colors.gray50,
    borderRadius: 6,
    padding: 10,
    marginLeft: 26,
    marginBottom: 6,
  },
  fixStepsText: {
    fontSize: 9,
    color: colors.gray700,
    lineHeight: 1.6,
  },
  fixImpact: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.pass,
    marginLeft: 26,
  },
  // Checklist
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  checkBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: colors.gray400,
    borderRadius: 2,
    marginTop: 1,
  },
  checklistText: {
    flex: 1,
    fontSize: 9,
    color: colors.gray700,
    lineHeight: 1.5,
  },
  // Glossary
  glossaryItem: {
    marginBottom: 10,
  },
  glossaryTerm: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
    marginBottom: 2,
  },
  glossaryDef: {
    fontSize: 9,
    color: colors.gray500,
    lineHeight: 1.6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    marginVertical: 16,
  },
  // Tips
  tipCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
    marginBottom: 4,
  },
  tipBody: {
    fontSize: 9,
    color: colors.gray500,
    lineHeight: 1.6,
  },
  tipsIntro: {
    fontSize: 9,
    color: colors.gray500,
    marginBottom: 12,
    lineHeight: 1.5,
  },
});

const TOTAL_PAGES = 8;

function PageNumber({ n }: { n: number }) {
  return <Text style={s.pageNumber}>{n} / {TOTAL_PAGES}</Text>;
}

function VerdictBadge({ status }: { status: "pass" | "fail" }) {
  const isPass = status === "pass";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={[s.verdictDot, { backgroundColor: isPass ? colors.pass : colors.fail }]} />
      <Text style={[s.verdictText, { color: isPass ? colors.pass : colors.fail }]}>
        {isPass ? "Passing" : "Needs Improvement"}
      </Text>
    </View>
  );
}

function MetricBadge({ status }: { status: "pass" | "fail" }) {
  const isPass = status === "pass";
  return (
    <Text
      style={[
        s.badge,
        {
          backgroundColor: isPass ? colors.passLight : colors.failLight,
          color: isPass ? colors.pass : colors.fail,
        },
      ]}
    >
      {isPass ? "Pass" : "Fail"}
    </Text>
  );
}

function scoreColor(score: number) {
  if (score >= 90) return colors.pass;
  if (score >= 50) return "#d97706";
  return colors.fail;
}

export function PDFReport({ audit }: { audit: AuditResult }) {
  return (
    <Document title={`Maki — ${audit.url}`}>
      {/* Page 1: Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.coverPage}>
          <Text style={s.coverLabel}>Maki — Core Web Vitals Report</Text>
          <Text style={s.coverTitle}>Performance Report</Text>
          <Text style={s.coverUrl}>{audit.url}</Text>
          <VerdictBadge status={audit.overallVerdict} />
          <Text style={s.coverMeta}>
            Generated {new Date(audit.auditDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
        <PageNumber n={1} />
      </Page>

      {/* Page 2: Score Summary */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Lighthouse Performance Score</Text>
        <View style={s.scoreRow}>
          <View style={s.scoreCard}>
            <Text style={[s.scoreValue, { color: scoreColor(audit.mobileScore) }]}>
              {audit.mobileScore}
            </Text>
            <Text style={s.scoreLabel}>Mobile</Text>
          </View>
          <View style={s.scoreCard}>
            <Text style={[s.scoreValue, { color: scoreColor(audit.desktopScore) }]}>
              {audit.desktopScore}
            </Text>
            <Text style={s.scoreLabel}>Desktop</Text>
          </View>
        </View>

        <View style={s.divider} />
        <Text style={s.sectionTitle}>Core Web Vitals</Text>

        {[
          { key: "LCP", label: "Largest Contentful Paint", description: "How fast the biggest thing on your page appears.", metric: audit.cwvScores.lcp },
          { key: "INP", label: "Interaction to Next Paint", description: "How quickly your page responds when someone taps or clicks.", metric: audit.cwvScores.inp },
          { key: "CLS", label: "Cumulative Layout Shift", description: "How much stuff jumps around as the page loads.", metric: audit.cwvScores.cls },
        ].map(({ key, label, description, metric }) => (
          <View key={key} style={s.metricRow}>
            <View style={s.metricHeader}>
              <View style={s.metricHeaderLeft}>
                <Text style={s.metricName}>{label}</Text>
                <Text style={s.metricKeyChip}>{key}</Text>
                <MetricBadge status={metric.status} />
              </View>
              <Text style={s.metricValue}>{metric.value}</Text>
            </View>
            <Text style={s.metricDescription}>{description}</Text>
            <Text style={s.metricMeaning}>{metric.meaning}</Text>
          </View>
        ))}
        <PageNumber n={2} />
      </Page>

      {/* Page 3: What This Means */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>What This Means for Your Visitors</Text>
        <Text style={s.summaryText}>{audit.summaryParagraph}</Text>

        <View style={s.divider} />

        <Text style={s.sectionTitle}>Quick Win — Under 10 Minutes</Text>
        <View style={s.quickWinBox}>
          <Text style={s.quickWinLabel}>Quick Win</Text>
          <Text style={s.quickWinTitle}>{audit.quickWin.title}</Text>
          {audit.quickWin.steps.map((step, i) => (
            <Text key={i} style={s.quickWinStep}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>
        <PageNumber n={3} />
      </Page>

      {/* Pages 4-5: Top Fixes */}
      {[
        audit.topFixes.slice(0, 3),
        audit.topFixes.slice(3),
      ].map((chunk, pageIdx) => (
        <Page key={pageIdx} size="A4" style={s.page}>
          <Text style={s.sectionTitle}>
            {pageIdx === 0 ? "Your Top 5 Fixes (1 of 2)" : "Your Top 5 Fixes (2 of 2)"}
          </Text>
          {chunk.map((fix: TopFix) => (
            <View key={fix.rank} style={s.fixCard}>
              <View style={s.fixHeader}>
                <View style={s.fixRankBubble}>
                  <Text style={s.fixRankText}>{fix.rank}</Text>
                </View>
                <Text style={s.fixHeadline}>{fix.problemHeadline}</Text>
              </View>
              <Text style={s.fixWhy}>{fix.whyItMatters}</Text>
              <View style={s.fixSteps}>
                <Text style={s.fixStepsText}>{fix.whatToDo}</Text>
              </View>
              <Text style={s.fixImpact}>{fix.estimatedImpact}</Text>
            </View>
          ))}
          <PageNumber n={pageIdx + 4} />
        </Page>
      ))}

      {/* Page 6: Verification Checklist */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Verification Checklist</Text>
        <Text style={[s.summaryText, { marginBottom: 16 }]}>
          After applying the fixes above, use this checklist to confirm everything worked.
        </Text>
        {audit.checklistAfter.map((item, i) => (
          <View key={i} style={s.checklistItem}>
            <View style={s.checkBox} />
            <Text style={s.checklistText}>{item}</Text>
          </View>
        ))}
        <PageNumber n={6} />
      </Page>

      {/* Page 7: General Infrastructure Tips */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>General Infrastructure Tips</Text>
        <Text style={s.tipsIntro}>
          These aren&apos;t in your top 5 fixes, but every fast site does them. If you haven&apos;t already, these are the foundational layer underneath the specific fixes above.
        </Text>
        {STATIC_TIPS.map((tip) => (
          <View key={tip.title} style={s.tipCard}>
            <Text style={s.tipTitle}>{tip.title}</Text>
            <Text style={s.tipBody}>{tip.body}</Text>
          </View>
        ))}
        <PageNumber n={7} />
      </Page>

      {/* Page 8: Glossary */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Glossary</Text>
        {[
          {
            term: "LCP — Largest Contentful Paint",
            def: "Measures how long it takes for the largest visible element on the page (usually your hero image or main heading) to load. Google wants this under 2.5 seconds. Slower means visitors see a blank or partial page for too long.",
          },
          {
            term: "INP — Interaction to Next Paint",
            def: "Measures how quickly your page responds when a visitor clicks, taps, or types. Google wants this under 200ms. A slow INP means buttons feel unresponsive — like the page is frozen.",
          },
          {
            term: "CLS — Cumulative Layout Shift",
            def: "Measures how much the page layout moves around while loading. Google wants this below 0.1. High CLS means text or buttons jump around while the visitor is trying to read or click — very frustrating.",
          },
          {
            term: "TTFB — Time to First Byte",
            def: "How long it takes for the browser to receive the first piece of data from your server. A slow TTFB usually means your hosting server is slow or far from your visitors.",
          },
          {
            term: "Lighthouse",
            def: "Google's free auditing tool built into Chrome DevTools. It runs a simulated page load and scores your site on Performance, Accessibility, Best Practices, and SEO. This report uses real Lighthouse data from Google's servers.",
          },
          {
            term: "Core Web Vitals",
            def: "Three specific metrics (LCP, INP, CLS) that Google uses as signals for its search ranking algorithm. A site that passes all three is considered to have a 'good page experience' — which can boost rankings.",
          },
          {
            term: "PageSpeed Insights",
            def: "Google's free tool that shows both lab data (from Lighthouse) and real-world field data from actual Chrome users visiting your site. This report is powered by the PageSpeed Insights API.",
          },
        ].map((item) => (
          <View key={item.term} style={s.glossaryItem}>
            <Text style={s.glossaryTerm}>{item.term}</Text>
            <Text style={s.glossaryDef}>{item.def}</Text>
          </View>
        ))}
        <PageNumber n={8} />
      </Page>
    </Document>
  );
}
