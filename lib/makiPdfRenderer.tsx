import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Svg,
  Path,
  Polygon,
  Rect,
  Link
} from '@react-pdf/renderer';
import { AuditResult, TopFix } from './types';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    padding: '40px 45px',
    color: '#111827',
  },
  coverPage: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    padding: '80px 60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverName: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 12,
    textAlign: 'center',
    color: '#202124',
  },
  coverKit: {
    color: '#268ad8',
    fontSize: 19,
    fontWeight: 700,
    marginBottom: 6,
    textAlign: 'center',
  },
  coverDate: {
    color: '#5f6368',
    fontSize: 12,
    marginBottom: 48,
    textAlign: 'center',
  },
  coverBox: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #E4E4E4',
    borderRadius: 16,
    padding: '28px 36px',
    width: '100%',
    marginBottom: 36,
  },
  coverBoxTitle: {
    color: '#202124',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  coverItem: {
    color: '#374151',
    fontSize: 13,
    paddingVertical: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  coverCheck: {
    color: '#268ad8',
    fontSize: 12,
    fontWeight: 800,
    marginRight: 10,
  },
  coverFooterText: {
    fontSize: 11,
    color: '#5f6368',
    textAlign: 'center',
  },
  topAccent: {
    height: 5,
    backgroundColor: '#268ad8',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  pageLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#268ad8',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#111827',
    marginBottom: 10,
  },
  howTo: {
    fontSize: 10,
    color: '#0369a1',
    backgroundColor: '#e0f0fb',
    borderLeft: '3px solid #268ad8',
    padding: '10px 14px',
    borderRadius: 4,
    marginBottom: 18,
    lineHeight: 1.5,
  },
  howToBold: {
    fontWeight: 700,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: '2px solid #E4E4E4',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subDot: {
    width: 8,
    height: 8,
    backgroundColor: '#268ad8',
    borderRadius: 4,
    marginRight: 8,
  },
  card: {
    backgroundColor: '#f9fafb',
    border: '1px solid #E4E4E4',
    borderRadius: 10,
    padding: '14px 16px',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#9ca3af',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 11,
    color: '#1f2937',
    lineHeight: 1.6,
  },
  charNote: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 6,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCol2: {
    width: '48%',
  },
  gridCol3: {
    width: '31%',
  },
  catPrimary: {
    backgroundColor: '#e0f0fb',
    border: '1px solid #268ad8',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 12,
  },
  catPrimaryLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#268ad8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  catPrimaryVal: {
    fontSize: 14,
    fontWeight: 700,
    color: '#202124',
  },
  catTag: {
    backgroundColor: '#ffffff',
    border: '1px solid #E4E4E4',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 10,
    color: '#374151',
    fontWeight: 500,
    marginRight: 6,
    marginBottom: 6,
  },
  winCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    border: '1px solid #E4E4E4',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 10,
  },
  winNum: {
    backgroundColor: '#268ad8',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 800,
    width: 28,
    height: 28,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginRight: 10,
  },
  winText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
    flex: 1,
    paddingTop: 4,
  },
  pageFooter: {
    position: 'absolute',
    bottom: 30,
    left: 45,
    right: 45,
    paddingTop: 12,
    borderTop: '1px solid #E4E4E4',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pageFooterText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  // Custom styles for Maki
  scoreBox: {
    border: '1px solid #E4E4E4',
    borderRadius: 8,
    padding: '16px',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 4,
  },
  scoreTarget: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  codeBlock: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 9,
    fontFamily: 'Courier',
    color: '#e2e8f0',
    lineHeight: 1.5,
  },
  difficultyBadge: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  pluginTag: {
    fontSize: 9,
    fontWeight: 700,
    color: '#268ad8',
    backgroundColor: '#e0f0fb',
    padding: '4px 8px',
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clockIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  closingCard: {
    backgroundColor: '#e0f0fb',
    borderRadius: 10,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
  }
});

const MakiLogo = () => (
  <Svg viewBox="0 0 707.22 170.25" style={{ width: 140, height: 34, marginBottom: 40 }}>
    <Path fill="#268ad8" d="M106.52,18.63l-13.64-15.62H.74l-.74.65v165.93l.74.65h78.36l.74-.65v-23.19c0-.08,1.27-1.2,1.47-1.08l26.38,24.41,26.36-24.63c.42-.61.99.81.99.87v23.63l.74.65h78.36l.74-.65V3.67l-.74-.65h-94.87l-12.75,15.62Z" />
    <Path fill="#268ad8" d="M511.56,24.34l15.77-21.32h90.44c.3,0,1.05.89.54,1.33l-47.01,82.36,47,82.67-.53.88h-87.23l-19.96-26.93v26.28l-.74.65h-78.85l-.74-.65V3.67l-.74-.65h78.85l.74.65.98,20.68Z" />
    <Polygon fill="#268ad8" points="322.07 153.38 323.72 154.95 332.67 170.25 421.13 170.25 421.81 169.23 323.72 1.57 322.07 0 320.15 2.2 222.48 169.37 223.01 170.25 311.59 170.25 320.15 155.58 322.07 153.38" />
    <Rect fill="#268ad8" x="626.89" y="3.02" width="80.33" height="167.23" />
  </Svg>
);

const BlueCheck = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 13, height: 13, marginRight: 8, marginTop: 2 }}>
    <Path fill="none" stroke="#268ad8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
  </Svg>
);

const ClockIcon = () => (
  <Svg viewBox="0 0 24 24" style={styles.clockIcon}>
    <Path fill="none" stroke="#268ad8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Svg>
);

function cleanDisplayString(str: string | undefined): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/^[\u2018\u2019\u201C\u201D'"]+/, '')
    .replace(/[\u2018\u2019\u201C\u201D'"]+$/, '')
    .trim();
}

function getStatusColor(status: string, value?: number) {
  if (status === 'pass') return '#16a34a'; // green
  if (status === 'fail') return '#dc2626'; // red
  if (value && value >= 50 && value < 90) return '#d97706'; // yellow
  return '#d97706'; // yellow fallback
}

function getDifficultyText(impact: string) {
  if (impact.includes('High') || impact.includes('-1.')) return 'Advanced';
  if (impact.includes('Medium')) return 'Medium';
  return 'Easy';
}

function getEstimatedTime(impact: string, headline: string) {
  // If it already contains a digit, assume it's a valid time estimate
  if (/\d/.test(impact)) {
    return impact.replace(/^(Could save |Impact: )/i, '').replace(/^-/, '');
  }

  // Fallbacks based on fix type
  const h = headline.toLowerCase();
  if (h.includes('render-blocking')) return '0.3–0.7s LCP';
  if (h.includes('css')) return '0.2–0.5s LCP';
  if (h.includes('lazy load') || h.includes('offscreen')) return '0.3–0.6s LCP';
  if (h.includes('font')) return '0.2–0.4s LCP';
  if (h.includes('main thread') || h.includes('javascript') || h.includes('js')) return '100–300ms INP';
  if (h.includes('server response') || h.includes('ttfb')) return '0.5–1.5s LCP';
  if (h.includes('compression') || h.includes('brotli') || h.includes('gzip')) return '0.2–0.5s on load';

  // Generic fallback if unknown
  return '100–300ms';
}

const PDFDocument = ({ report, businessName, date }: { report: AuditResult; businessName: string; date: string }) => {
  const { lcp, inp, cls } = report.cwvScores;
  const siteInfo = report.siteInfo || { detectedPlatform: report.detectedPlatform || 'unknown' };
  
  const resources = report.topFixes.filter(f => f.resourceUrl && f.resourceLabel).slice(0, 4);

  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.coverPage}>
        <MakiLogo />
        <Text style={styles.coverName}>{report.url}</Text>
        <Text style={styles.coverKit}>Core Web Vitals Performance Report</Text>
        <Text style={styles.coverDate}>Generated on {date}</Text>
        
        <View style={styles.coverBox}>
          <Text style={styles.coverBoxTitle}>This report includes</Text>
          {[
            'LCP, INP & CLS Scores',
            'Lighthouse Performance Scores',
            'Top 7 Ranked Fixes (by impact)',
            'Code Snippets & Plugin Links',
            'Technology & Stack Detection',
            'SEO Snippets (copy-paste ready)',
            'Quick Win (under 10 minutes)'
          ].map(item => (
            <View style={styles.coverItem} key={item}>
              <BlueCheck />
              <Text>{item}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.coverFooterText}>
          Copy and paste these fixes directly into your codebase or hand this PDF to your developer.
        </Text>
      </Page>

      {/* Page 1: Performance Scores */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topAccent} />
        <Text style={styles.pageLabel}>Section 1 of 5</Text>
        <Text style={styles.pageTitle}>Your Core Web Vitals Scores</Text>
        
        <Text style={styles.howTo}>
          <Text style={styles.howToBold}>These scores come directly from Google PageSpeed Insights using real Chrome user data.</Text> Green = passing, Red = failing, Yellow = needs improvement.
        </Text>
        
        <View style={[styles.grid, { marginBottom: 24 }]}>
          {[
            { key: 'LCP', label: 'Largest Contentful Paint', metric: lcp, target: '≤2.5s' },
            { key: 'INP', label: 'Interaction to Next Paint', metric: inp, target: '≤200ms' },
            { key: 'CLS', label: 'Cumulative Layout Shift', metric: cls, target: '≤0.1' },
          ].map(({ key, label, metric, target }) => (
            <View key={key} style={[styles.gridCol3, styles.scoreBox]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(metric.status) }]} />
                <Text style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{key}</Text>
              </View>
              <Text style={[styles.scoreValue, { color: getStatusColor(metric.status) }]}>{metric.value}</Text>
              <Text style={{ fontSize: 10, color: '#111827', fontWeight: 500, textAlign: 'center' }}>{metric.status === 'pass' ? 'Good' : 'Needs Work'}</Text>
              <Text style={styles.scoreTarget}>Target {target}</Text>
            </View>
          ))}
        </View>

        <View style={styles.subTitle}>
          <View style={styles.subDot} />
          <Text>Lighthouse Scores</Text>
        </View>

        <View style={styles.grid}>
          {[
            { label: 'Performance', score: report.mobileScore },
            { label: 'Accessibility', score: report.lighthouseCategories?.accessibility || 0 },
            { label: 'Best Practices', score: report.lighthouseCategories?.bestPractices || 0 },
            { label: 'SEO', score: report.lighthouseCategories?.seo || 0 }
          ].map(({ label, score }) => (
            <View key={label} style={[styles.gridCol2, styles.card, { alignItems: 'center', padding: '16px' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor('', score) }]} />
                <Text style={styles.cardLabel}>{label}</Text>
              </View>
              <Text style={[styles.scoreValue, { color: getStatusColor('', score), marginBottom: 0 }]}>{score || 'N/A'}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.howTo, { marginTop: 24, marginBottom: 0 }]}>
          <Text style={styles.howToBold}>ANALYSIS SUMMARY:</Text> {report.summaryParagraph}
        </Text>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>{businessName}</Text>
          <Text style={styles.pageFooterText}>Page 2</Text>
        </View>
      </Page>

      {/* Page 2: Your Top Fixes */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topAccent} />
        <Text style={styles.pageLabel}>Section 2 of 5</Text>
        <Text style={styles.pageTitle}>Top 7 Fixes — Ranked by Impact</Text>
        
        <Text style={styles.howTo}>
          <Text style={styles.howToBold}>These fixes are ranked by how much they'll improve your score.</Text> Start from #1. Each fix includes the exact steps to implement it.
        </Text>

        {report.topFixes.slice(0, 4).map((fix, i) => (
          <View key={i} style={styles.winCard} wrap={false}>
            <View style={styles.winNum}><Text>{fix.rank}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{fix.problemHeadline}</Text>
              <Text style={{ fontSize: 10, color: '#4b5563', marginBottom: 4 }}>{fix.whyItMatters}</Text>
              <Text style={{ fontSize: 10, color: '#15803d', fontWeight: 700, marginBottom: 8 }}>
                Could save {getEstimatedTime(fix.estimatedImpact, fix.problemHeadline)}
              </Text>
              
              <Text style={{ fontSize: 10, color: '#111827', fontWeight: 700, marginBottom: 4 }}>How to fix it:</Text>
              <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{fix.whatToDo}</Text>
              
              {fix.resourceUrl && (
                <Link src={cleanDisplayString(fix.resourceUrl)} style={{ fontSize: 9, color: '#268ad8', textDecoration: 'underline', marginTop: 8, marginBottom: 4 }}>
                  {cleanDisplayString(fix.resourceUrl).replace(/^https?:\/\//, '')}
                </Link>
              )}
              
              {fix.codeSnippet && (
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{fix.codeSnippet}</Text>
                </View>
              )}
              
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={styles.difficultyBadge}>{getDifficultyText(fix.estimatedImpact)}</Text>
                {fix.resourceUrl && !fix.resourceUrl.includes('web.dev') && !fix.resourceUrl.includes('developer.google.com') && (
                  <Text style={styles.pluginTag}>Recommended: {fix.resourceLabel || 'Plugin'}</Text>
                )}
              </View>
            </View>
          </View>
        ))}

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>{businessName}</Text>
          <Text style={styles.pageFooterText}>Page 3</Text>
        </View>
      </Page>

      {/* Page 2 Continued (if more than 4 fixes) */}
      {report.topFixes.length > 4 ? (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.topAccent} />
          <Text style={styles.pageLabel}>Section 2 of 5 (Continued)</Text>
          
          {report.topFixes.slice(4, 7).map((fix, i) => (
            <View key={i} style={styles.winCard} wrap={false}>
              <View style={styles.winNum}><Text>{fix.rank}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{fix.problemHeadline}</Text>
                <Text style={{ fontSize: 10, color: '#4b5563', marginBottom: 4 }}>{fix.whyItMatters}</Text>
                <Text style={{ fontSize: 10, color: '#15803d', fontWeight: 700, marginBottom: 8 }}>
                  Could save {getEstimatedTime(fix.estimatedImpact, fix.problemHeadline)}
                </Text>
                
                <Text style={{ fontSize: 10, color: '#111827', fontWeight: 700, marginBottom: 4 }}>How to fix it:</Text>
                <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{fix.whatToDo}</Text>
                
                {fix.resourceUrl && (
                  <Link src={cleanDisplayString(fix.resourceUrl)} style={{ fontSize: 9, color: '#268ad8', textDecoration: 'underline', marginTop: 8, marginBottom: 4 }}>
                    {cleanDisplayString(fix.resourceUrl).replace(/^https?:\/\//, '')}
                  </Link>
                )}
                
                {fix.codeSnippet && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{fix.codeSnippet}</Text>
                  </View>
                )}
                
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={styles.difficultyBadge}>{getDifficultyText(fix.estimatedImpact)}</Text>
                  {fix.resourceUrl && !fix.resourceUrl.includes('web.dev') && !fix.resourceUrl.includes('developer.google.com') && (
                    <Text style={styles.pluginTag}>Recommended: {fix.resourceLabel || 'Plugin'}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
          
          <View style={styles.pageFooter}>
            <Text style={styles.pageFooterText}>{businessName}</Text>
            <Text style={styles.pageFooterText}>Page 4</Text>
          </View>
        </Page>
      ) : null}

      {/* Page 3: Technology & SEO */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topAccent} />
        <Text style={styles.pageLabel}>Section 3 of 5</Text>
        <Text style={styles.pageTitle}>Your Stack & SEO Snippets</Text>
        
        <View style={styles.subTitle}>
          <View style={styles.subDot} />
          <Text>Stack Detection</Text>
        </View>
        
        <View style={styles.grid}>
          {/* Left card: CMS / Platform */}
          <View style={styles.gridCol2}>
            <View style={styles.catPrimary}>
              <Text style={styles.catPrimaryLabel}>CMS / Platform</Text>
              <Text style={styles.catPrimaryVal}>
                {siteInfo.detectedPlatform === 'unknown' ? 'Custom / Unknown' : 
                  siteInfo.detectedPlatform.charAt(0).toUpperCase() + siteInfo.detectedPlatform.slice(1)}
              </Text>
            </View>
          </View>
          
          {/* Right card: Server / Hosting */}
          <View style={styles.gridCol2}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Server / Hosting</Text>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                {siteInfo.serverSoftware || 'Unknown'} {siteInfo.cdnDetected ? `(+ ${siteInfo.cdnDetected})` : ''}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Full width: Key Technologies tags */}
        <Text style={[styles.cardLabel, { marginBottom: 6, marginTop: 4 }]}>Key Technologies</Text>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
          {(siteInfo.technologies && siteInfo.technologies.length > 0) ? (
            siteInfo.technologies.map((tech: string, i: number) => (
              <Text key={i} style={styles.catTag}>{tech}</Text>
            ))
          ) : (
            <Text style={{ fontSize: 10, color: '#6b7280' }}>No specific technologies detected.</Text>
          )}
        </View>
        
        <View style={{ height: 1, backgroundColor: '#E4E4E4', marginBottom: 24 }} />
        
        {/* PART B - SEO Snippets */}
        <View style={[styles.subTitle, { marginTop: 0 }]}>
          <View style={styles.subDot} />
          <Text>SEO Snippets</Text>
        </View>
        
        <Text style={styles.howTo}>
          <Text style={styles.howToBold}>Copy and paste these</Text> into your site's &lt;head&gt; section or SEO plugin.
        </Text>
        
        {report.seoSnippets && report.seoSnippets.length > 0 ? (
          report.seoSnippets.map((snippet, i) => (
            <View key={i} style={styles.card} wrap={false}>
              <Text style={styles.cardLabel}>{snippet.title}</Text>
              <View style={[styles.codeBlock, { marginTop: 0 }]}>
                <Text style={styles.codeText}>{snippet.code}</Text>
              </View>
              <Text style={styles.charNote}>{snippet.code.length} characters</Text>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 10, color: '#6b7280' }}>No SEO snippets generated for this report.</Text>
        )}

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>{businessName}</Text>
          <Text style={styles.pageFooterText}>Page {report.topFixes.length > 4 ? 5 : 4}</Text>
        </View>
      </Page>

      {/* Page 4: Quick Win & Resources */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topAccent} />
        <Text style={styles.pageLabel}>Section 4 of 5</Text>
        <Text style={styles.pageTitle}>Your Quick Win</Text>
        
        <View style={[styles.card, { backgroundColor: '#e0f0fb', borderColor: '#268ad8', padding: 24 }]}>
          <ClockIcon />
          <Text style={{ fontSize: 12, fontWeight: 700, color: '#268ad8', textTransform: 'uppercase', marginBottom: 8 }}>Do this in under 10 minutes</Text>
          <Text style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{report.quickWin.title}</Text>
          
          {report.quickWin.steps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: 700, color: '#268ad8', marginRight: 8 }}>{i + 1}.</Text>
              <Text style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, flex: 1 }}>{step}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.subTitle}>
          <View style={styles.subDot} />
          <Text>Helpful Resources</Text>
        </View>
        
        <View style={styles.grid}>
          {resources.length > 0 ? (
            resources.map((res, i) => (
              <View key={i} style={[styles.gridCol2, styles.winCard]} wrap={false}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{res.resourceLabel}</Text>
                  <Text style={{ fontSize: 10, color: '#4b5563', marginBottom: 8, lineHeight: 1.4 }}>Helps with: {res.problemHeadline}</Text>
                  <Link src={cleanDisplayString(res.resourceUrl)} style={{ fontSize: 10, color: '#268ad8', textDecoration: 'none', fontWeight: 600 }}>
                    View Resource &gt;
                  </Link>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 10, color: '#6b7280' }}>Review the top fixes for specific plugin and tool recommendations.</Text>
          )}
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>{businessName}</Text>
          <Text style={styles.pageFooterText}>Page {report.topFixes.length > 4 ? 6 : 5}</Text>
        </View>
      </Page>

      {/* General Infrastructure */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topAccent} />
        <Text style={styles.pageLabel}>GENERAL INFRASTRUCTURE</Text>
        <Text style={styles.pageTitle}>Not in your top fixes, but every fast site does these.</Text>

        <View style={{ marginTop: 16 }}>
          {[
            {
              title: "Put a CDN in front of your site",
              desc: "Use Cloudflare (free plan works) or Fastly. A CDN serves pages from a server near your visitor instead of your origin, cutting hundreds of milliseconds off the first byte. Point your domain's nameservers to Cloudflare, enable the orange cloud, and turn on Auto Minify and Brotli in the Speed tab."
            },
            {
              title: "Serve images through an image CDN",
              desc: "Images are usually 60–80% of a page's weight. Use Cloudflare Images, Imgix, Cloudinary, or Bunny Optimizer to auto-convert to WebP or AVIF and resize to screen size. A 2MB hero image becomes ~200KB with zero visible quality loss."
            },
            {
              title: "Turn on HTTP/2 or HTTP/3",
              desc: "HTTP/2 lets the browser download dozens of assets over a single connection instead of queuing them. Most hosts enable it with one checkbox — check your host panel for HTTP/2, HTTP/3, or QUIC. Cloudflare enables both by default."
            },
            {
              title: "Set aggressive cache headers on static assets",
              desc: "Static files (JS, CSS, fonts, hashed images) should have Cache-Control: public, max-age=31536000, immutable. Repeat visitors won't re-download them. HTML should be no-cache so updates ship instantly."
            },
            {
              title: "Enable Brotli or gzip compression",
              desc: "Compressing HTML, JS, CSS, and JSON shrinks them by 70–90% over the wire. Brotli beats gzip by ~15–25% and is supported by all modern browsers. Cloudflare, Netlify, and Vercel enable Brotli with one setting. For self-hosted nginx: add brotli on; to your server block."
            },
            {
              title: "Minify and tree-shake JS and CSS",
              desc: "Raw source contains whitespace, comments, and long variable names the browser doesn't need. Bundlers like Vite, esbuild, and webpack minify in production builds automatically. Make sure you're deploying the production build, not the dev build."
            }
          ].map((tip, i) => (
            <View key={i} style={[styles.card, { marginBottom: 12 }]}>
              <Text style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{i + 1}. {tip.title}</Text>
              <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{tip.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>{businessName}</Text>
          <Text style={styles.pageFooterText}>Page {report.topFixes.length > 4 ? 7 : 6}</Text>
        </View>
      </Page>

      {/* Glossary Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topAccent} />
        <Text style={styles.pageLabel}>GLOSSARY</Text>
        <Text style={styles.pageTitle}>Terms used in this report.</Text>

        <View style={{ marginTop: 16 }}>
          {[
            { term: 'LCP', title: 'Largest Contentful Paint', def: 'How long it takes for the largest visible element to fully load. Target: ≤ 2.5 seconds.' },
            { term: 'INP', title: 'Interaction to Next Paint', def: 'How quickly the page responds when a user clicks, taps, or types. Target: ≤ 200ms.' },
            { term: 'CLS', title: 'Cumulative Layout Shift', def: 'How much page elements jump around as the page loads. Target: ≤ 0.1.' },
            { term: 'CrUX', title: 'Chrome User Experience Report', def: 'Real-world performance data collected from actual Chrome users visiting your site over the past 28 days.' },
            { term: 'Lighthouse', title: '', def: 'Google\'s audit engine that simulates and scores page performance, accessibility, best practices, and SEO.' },
            { term: 'TTFB', title: 'Time to First Byte', def: 'How long it takes for the browser to receive the first byte of data from your server. Target: ≤ 800ms.' },
            { term: 'FCP', title: 'First Contentful Paint', def: 'When the browser renders the first piece of DOM content. Good indicator of perceived load speed.' }
          ].map((item, i) => (
            <View key={i} style={[styles.card, { marginBottom: 12 }]}>
              <Text style={{ fontSize: 12, fontWeight: 700, color: '#268ad8', marginBottom: 4 }}>
                {item.term}{item.title ? ` — ${item.title}` : ''}
              </Text>
              <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{item.def}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>{businessName}</Text>
          <Text style={styles.pageFooterText}>Page {report.topFixes.length > 4 ? 8 : 7}</Text>
        </View>
      </Page>

      {/* Page 5: Summary */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topAccent} />
        <Text style={styles.pageLabel}>Section 5 of 5</Text>
        <Text style={styles.pageTitle}>What to Do Next</Text>
        
        <View style={styles.subTitle}>
          <View style={styles.subDot} />
          <Text>Top 3 Priorities</Text>
        </View>
        
        {report.topFixes.slice(0, 3).map((fix, i) => (
          <View key={i} style={styles.winCard} wrap={false}>
            <View style={styles.winNum}><Text>{fix.rank}</Text></View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{fix.problemHeadline}</Text>
              <Text style={{ fontSize: 10, color: '#15803d', fontWeight: 600 }}>Could save {getEstimatedTime(fix.estimatedImpact, fix.problemHeadline)}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.card, { marginTop: 16, marginBottom: 20 }]}>
          <Text style={[styles.cardLabel, { marginBottom: 12 }]}>USE THIS CHECKLIST TO CONFIRM EVERYTHING WORKS</Text>
          <Text style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 12 }}>After You Apply the Fixes</Text>
          {[
            'Re-run PageSpeed Insights and compare new scores',
            'Verify Core Web Vitals in Google Search Console',
            'Check that browser caching is active (DevTools > Network > check response headers)',
            'Confirm images are serving in WebP or AVIF format',
            'Test on a real mobile device, not just desktop',
            'Share updated scores with your developer'
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
              <View style={{ width: 12, height: 12, border: '1px solid #9ca3af', borderRadius: 2, marginRight: 8, marginTop: 1 }} />
              <Text style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.closingCard}>
          <Text style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 12 }}>Hand this to your developer</Text>
          <Text style={{ fontSize: 12, color: '#374151', textAlign: 'center', lineHeight: 1.6 }}>
            Everything in this report is written so your developer can implement it without any back-and-forth. Share the PDF and they'll know exactly what to do.
          </Text>
        </View>
        
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <Text style={{ color: '#202124', fontSize: 16, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>
            Good luck, {report.url.replace(/^https?:\/\//, '').split('/')[0]}!
          </Text>
          <Text style={{ color: '#5f6368', fontSize: 12, textAlign: 'center', paddingHorizontal: 40, lineHeight: 1.5 }}>
            Fix these issues and your site will be faster, rank higher, and convert better.
          </Text>
          <Text style={{ marginTop: 20, fontSize: 10, color: '#9ca3af' }}>Generated on {date}</Text>
        </View>

        <View style={{ marginTop: 'auto', paddingTop: 20 }}>
          <Text style={{ fontSize: 8, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>
            Important: Google's field data (CrUX) updates on a 28-day rolling cycle. Results depend on many factors including hosting quality and implementation. No specific ranking improvement is guaranteed. All sales are final.
          </Text>
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>{businessName}</Text>
          <Text style={styles.pageFooterText}>Page {report.topFixes.length > 4 ? 9 : 8}</Text>
        </View>
      </Page>
    </Document>
  );
};

export const generateMakiPdfBlob = async (report: AuditResult, url: string): Promise<Blob> => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  
  const businessName = url.replace(/^https?:\/\//, '').split('/')[0];
  
  const doc = <PDFDocument report={report} businessName={businessName} date={date} />;
  const asPdf = pdf();
  asPdf.updateContainer(doc);
  return await asPdf.toBlob();
};
