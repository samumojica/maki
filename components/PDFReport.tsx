import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
  Svg,
  Path,
  Polygon,
  Rect,
} from "@react-pdf/renderer";
import { AuditResult, TopFix } from "@/lib/types";
import { STATIC_TIPS } from "@/lib/static-tips";

const colors = {
  pass: "#16a34a",
  fail: "#dc2626",
  passLight: "#f0fdf4",
  failLight: "#fef2f2",
  blue: "#268ad8",
  blueLight: "#e8f3fb",
  amber: "#d97706",
  amberLight: "#fffbeb",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray700: "#4b5563",
  gray800: "#1f2937",
  gray900: "#111827",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.gray900,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    right: 48,
    fontSize: 8,
    color: colors.gray400,
  },
  // Cover
  coverPage: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 40,
  },
  coverLabel: {
    fontSize: 9,
    color: colors.blue,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
    marginBottom: 8,
    lineHeight: 1.1,
  },
  coverUrl: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 40,
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
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  coverMeta: {
    fontSize: 9,
    color: colors.gray400,
    marginTop: 8,
    lineHeight: 1.4,
  },
  // Section headers
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitleFirst: {
    marginTop: 0,
  },
  // Score cards
  scoreRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
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
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // CWV metric rows
  metricRow: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
    gap: 8,
  },
  metricName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
  },
  metricMeaning: {
    fontSize: 9,
    color: colors.gray500,
    lineHeight: 1.6,
  },
  badge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
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
    padding: 16,
    marginBottom: 24,
  },
  quickWinTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
    marginBottom: 10,
  },
  quickWinStep: {
    fontSize: 9,
    color: colors.gray700,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  // Fix cards
  fixCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  fixHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  fixRankBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  fixRankText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.gray700,
  },
  fixHeadline: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
  },
  fixWhy: {
    fontSize: 9,
    color: colors.gray500,
    lineHeight: 1.6,
    marginBottom: 10,
    marginLeft: 30,
  },
  howToFixLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.blue,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 30,
    marginBottom: 6,
  },
  fixSteps: {
    backgroundColor: colors.gray50,
    borderRadius: 6,
    padding: 12,
    marginLeft: 30,
    marginBottom: 8,
  },
  fixStepsText: {
    fontSize: 9,
    color: colors.gray700,
    lineHeight: 1.6,
  },
  codeBlock: {
    backgroundColor: colors.gray800,
    borderRadius: 6,
    padding: 12,
    marginLeft: 30,
    marginBottom: 8,
    marginTop: 4,
  },
  codeText: {
    fontSize: 8,
    fontFamily: "Courier",
    color: "#e2e8f0",
    lineHeight: 1.5,
  },
  resourceLink: {
    fontSize: 9,
    color: colors.blue,
    marginLeft: 30,
    marginBottom: 6,
    textDecoration: "underline",
  },
  fixImpact: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.pass,
    marginLeft: 30,
  },
  // Checklist
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  checkBox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: colors.gray400,
    borderRadius: 3,
    marginTop: 1,
  },
  checklistText: {
    flex: 1,
    fontSize: 10,
    color: colors.gray700,
    lineHeight: 1.5,
  },
  // Glossary
  glossaryItem: {
    marginBottom: 12,
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
    marginVertical: 20,
  },
  // Tips
  tipCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
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
  // Site info
  siteInfoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  siteInfoItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
  },
  siteInfoLabel: {
    fontSize: 8,
    color: colors.gray400,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  siteInfoValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
  },
  // Disclaimer
  disclaimerBox: {
    backgroundColor: colors.amberLight,
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  disclaimerTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.amber,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 9,
    color: colors.gray700,
    lineHeight: 1.6,
  },
  // SEO snippets
  seoCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  seoTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.gray900,
    marginBottom: 4,
  },
  seoDesc: {
    fontSize: 9,
    color: colors.gray500,
    marginBottom: 8,
    lineHeight: 1.5,
  },
});

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

function PDFLogo({ color = colors.blue }: { color?: string }) {
  return (
    <Svg viewBox="0 0 707.22 170.25" style={{ height: 24 }}>
      <Path
        fill={color}
        d="M106.52,18.63l-13.64-15.62H.74l-.74.65v165.93l.74.65h78.36l.74-.65v-23.19c0-.08,1.27-1.2,1.47-1.08l26.38,24.41,26.36-24.63c.42-.61.99.81.99.87v23.63l.74.65h78.36l.74-.65V3.67l-.74-.65h-94.87l-12.75,15.62Z"
      />
      <Path
        fill={color}
        d="M511.56,24.34l15.77-21.32h90.44c.3,0,1.05.89.54,1.33l-47.01,82.36,47,82.67-.53.88h-87.23l-19.96-26.93v26.28l-.74.65h-78.85l-.74-.65V3.67l-.74-.65h78.85l.74.65.98,20.68Z"
      />
      <Polygon
        fill={color}
        points="322.07 153.38 323.72 154.95 332.67 170.25 421.13 170.25 421.81 169.23 323.72 1.57 322.07 0 320.15 2.2 222.48 169.37 223.01 170.25 311.59 170.25 320.15 155.58 322.07 153.38"
      />
      <Rect fill={color} x="626.89" y="3.02" width="80.33" height="167.23" />
    </Svg>
  );
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

function FixCard({ fix }: { fix: TopFix }) {
  return (
    <View style={s.fixCard} wrap={false}>
      <View style={s.fixHeader}>
        <View style={s.fixRankBubble}>
          <Text style={s.fixRankText}>{fix.rank}</Text>
        </View>
        <Text style={s.fixHeadline}>{fix.problemHeadline}</Text>
      </View>
      <Text style={s.fixWhy}>{fix.whyItMatters}</Text>
      <Text style={s.howToFixLabel}>How to fix it</Text>
      <View style={s.fixSteps}>
        <Text style={s.fixStepsText}>{fix.whatToDo}</Text>
      </View>
      {fix.codeSnippet && (
        <View style={s.codeBlock}>
          <Text style={s.codeText}>{fix.codeSnippet}</Text>
        </View>
      )}
      {fix.resourceUrl && (
        <Link src={fix.resourceUrl} style={s.resourceLink}>
          {fix.resourceLabel ?? fix.resourceUrl}
        </Link>
      )}
      <Text style={s.fixImpact}>{fix.estimatedImpact}</Text>
    </View>
  );
}

export function PDFReport({ audit }: { audit: AuditResult }) {
  const siteInfo = audit.siteInfo ?? { detectedPlatform: audit.detectedPlatform ?? "unknown" };
  const fixes = audit.topFixes ?? [];

  return (
    <Document title={`Maki Report — ${audit.url}`}>
      {/* Page 1: Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.coverPage}>
          <View style={s.logoContainer}>
            <PDFLogo />
          </View>
          <Text style={s.coverLabel}>Core Web Vitals Report</Text>
          <Text style={s.coverTitle}>Performance Diagnostic</Text>
          <Text style={s.coverUrl}>{audit.url}</Text>
          <VerdictBadge status={audit.overallVerdict} />
          <Text style={s.coverMeta}>
            Generated {new Date(audit.auditDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          {audit.fieldDataAvailable !== undefined && (
            <Text style={[s.coverMeta, { marginTop: 4 }]}>
              {audit.fieldDataAvailable
                ? "Based on real Chrome user data (CrUX) from the past 28 days"
                : "Based on Lighthouse lab tests (insufficient traffic for field data)"}
            </Text>
          )}
        </View>
      </Page>

      {/* Page 2: Site Info + Scores + Summary */}
      <Page size="A4" style={s.page}>
        <Text style={[s.sectionTitle, s.sectionTitleFirst]}>Site Technology</Text>
        <View style={s.siteInfoRow}>
          <View style={s.siteInfoItem}>
            <Text style={s.siteInfoLabel}>Platform</Text>
            <Text style={s.siteInfoValue}>
              {PLATFORM_LABELS[siteInfo.detectedPlatform] ?? "Unknown"}
            </Text>
          </View>
          <View style={s.siteInfoItem}>
            <Text style={s.siteInfoLabel}>Server</Text>
            <Text style={s.siteInfoValue}>{siteInfo.serverSoftware ?? "—"}</Text>
          </View>
          <View style={s.siteInfoItem}>
            <Text style={s.siteInfoLabel}>Origin</Text>
            <Text style={s.siteInfoValue}>{siteInfo.serverCountry ?? "—"}</Text>
          </View>
        </View>

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
          {audit.lighthouseCategories && (
            <>
              <View style={s.scoreCard}>
                <Text style={[s.scoreValue, { color: scoreColor(audit.lighthouseCategories.accessibility) }]}>
                  {audit.lighthouseCategories.accessibility}
                </Text>
                <Text style={s.scoreLabel}>Accessibility</Text>
              </View>
              <View style={s.scoreCard}>
                <Text style={[s.scoreValue, { color: scoreColor(audit.lighthouseCategories.seo) }]}>
                  {audit.lighthouseCategories.seo}
                </Text>
                <Text style={s.scoreLabel}>SEO</Text>
              </View>
            </>
          )}
        </View>

        <Text style={s.sectionTitle}>Analysis Summary</Text>
        <Text style={s.summaryText}>{audit.summaryParagraph}</Text>

        <Text style={s.sectionTitle}>Core Web Vitals</Text>
        {[
          { key: "LCP", label: "Largest Contentful Paint", metric: audit.cwvScores.lcp },
          { key: "INP", label: "Interaction to Next Paint", metric: audit.cwvScores.inp },
          { key: "CLS", label: "Cumulative Layout Shift", metric: audit.cwvScores.cls },
        ].map(({ key, label, metric }) => (
          <View key={key} style={s.metricRow}>
            <View style={s.metricHeader}>
              <View style={s.metricHeaderLeft}>
                <Text style={s.metricName}>{label}</Text>
                <MetricBadge status={metric.status} />
              </View>
              <Text style={s.metricValue}>{metric.value}</Text>
            </View>
            <Text style={s.metricMeaning}>{metric.meaning}</Text>
          </View>
        ))}
      </Page>

      {/* Page 3: Quick Win + Initial Fixes */}
      <Page size="A4" style={s.page}>
        <Text style={[s.sectionTitle, s.sectionTitleFirst]}>Quick Win — Under 10 Minutes</Text>
        <View style={s.quickWinBox}>
          <Text style={s.quickWinTitle}>{audit.quickWin.title}</Text>
          {audit.quickWin.steps.map((step, i) => (
            <Text key={i} style={s.quickWinStep}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>

        <Text style={s.sectionTitle}>Top Fixes (1 of 3)</Text>
        {fixes.slice(0, 2).map((fix: TopFix) => (
          <FixCard key={fix.rank} fix={fix} />
        ))}
      </Page>

      {/* Subsequent Fixes */}
      <Page size="A4" style={s.page}>
        <Text style={[s.sectionTitle, s.sectionTitleFirst]}>Top Fixes (2 of 3)</Text>
        {fixes.slice(2, 5).map((fix: TopFix) => (
          <FixCard key={fix.rank} fix={fix} />
        ))}
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={[s.sectionTitle, s.sectionTitleFirst]}>Top Fixes (3 of 3)</Text>
        {fixes.slice(5, 7).map((fix: TopFix) => (
          <FixCard key={fix.rank} fix={fix} />
        ))}

        {audit.seoSnippets && audit.seoSnippets.length > 0 && (
          <>
            <View style={s.divider} />
            <Text style={s.sectionTitle}>Featured SEO Snippet</Text>
            <View style={s.seoCard}>
              <Text style={s.seoTitle}>{audit.seoSnippets[0].title}</Text>
              <Text style={s.seoDesc}>{audit.seoSnippets[0].description}</Text>
              <View style={s.codeBlock}>
                <Text style={s.codeText}>{audit.seoSnippets[0].code}</Text>
              </View>
            </View>
          </>
        )}
      </Page>

      {/* SEO Snippets Page */}
      {audit.seoSnippets && audit.seoSnippets.length > 1 && (
        <Page size="A4" style={s.page}>
          <Text style={[s.sectionTitle, s.sectionTitleFirst]}>Additional SEO Snippets</Text>
          {audit.seoSnippets.slice(1).map((snippet, i) => (
            <View key={i} style={s.seoCard}>
              <Text style={s.seoTitle}>{snippet.title}</Text>
              <Text style={s.seoDesc}>{snippet.description}</Text>
              <View style={s.codeBlock}>
                <Text style={s.codeText}>{snippet.code}</Text>
              </View>
            </View>
          ))}
        </Page>
      )}

      {/* Verification Checklist */}
      <Page size="A4" style={s.page}>
        <Text style={[s.sectionTitle, s.sectionTitleFirst]}>Verification Checklist</Text>
        <Text style={[s.summaryText, { marginBottom: 24 }]}>
          After applying the fixes above, use this checklist to confirm everything is working correctly.
        </Text>
        {audit.checklistAfter.map((item, i) => (
          <View key={i} style={s.checklistItem}>
            <View style={s.checkBox} />
            <Text style={s.checklistText}>{item}</Text>
          </View>
        ))}
      </Page>

      {/* General Infrastructure */}
      <Page size="A4" style={s.page}>
        <Text style={[s.sectionTitle, s.sectionTitleFirst]}>General Infrastructure</Text>
        <Text style={[s.summaryText, { marginBottom: 20 }]}>
          Foundational layer optimizations that every fast site should implement.
        </Text>
        {STATIC_TIPS.map((tip) => (
          <View key={tip.title} style={s.tipCard}>
            <Text style={s.tipTitle}>{tip.title}</Text>
            <Text style={s.tipBody}>{tip.body}</Text>
          </View>
        ))}
      </Page>

      {/* Glossary + Disclaimer */}
      <Page size="A4" style={s.page}>
        <Text style={[s.sectionTitle, s.sectionTitleFirst]}>Glossary</Text>
        {[
          { term: "LCP", def: "Largest Contentful Paint: Measures how long it takes for the largest visible element to load." },
          { term: "INP", def: "Interaction to Next Paint: Measures how quickly the page responds to user interactions." },
          { term: "CLS", def: "Cumulative Layout Shift: Measures visual stability and layout jumps." },
          { term: "CrUX", def: "Real-world performance data from actual Chrome users visiting your site." },
          { term: "Lighthouse", def: "Google's audit engine used to simulate and score page performance." },
        ].map((item) => (
          <View key={item.term} style={s.glossaryItem}>
            <Text style={s.glossaryTerm}>{item.term}</Text>
            <Text style={s.glossaryDef}>{item.def}</Text>
          </View>
        ))}

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerTitle}>Support & Feedback</Text>
          <Text style={[s.disclaimerText, { marginBottom: 12 }]}>
            Have questions about your report or need technical assistance? Contact us at support@getmaki.app.
          </Text>
          <Text style={s.disclaimerTitle}>Important Disclaimer</Text>
          <Text style={s.disclaimerText}>
            Google&apos;s field data (CrUX) updates on a 28-day rolling cycle. Results depend on many factors including hosting and how changes are implemented. All sales are final.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
