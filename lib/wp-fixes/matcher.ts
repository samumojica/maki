import { WordPressFixRecommendation, WordPressFix } from "./types";
import { WP_FIX_LIBRARY } from "./index";
import { WordPressContext } from "../types";

export function matchWordPressFixes(
  psiData: { mobile: unknown },
  wpContext: WordPressContext
): WordPressFixRecommendation[] {
  const recommendations: WordPressFixRecommendation[] = [];
  
  const raw = psiData.mobile as Record<string, unknown>;
  const lh = raw?.lighthouseResult as Record<string, unknown> | undefined;
  const audits = (lh?.audits ?? {}) as Record<string, Record<string, unknown>>;
  
  // Extract specific dynamic resources
  const getAuditItems = (auditId: string): Array<Record<string, unknown>> => {
    const details = audits[auditId]?.details as Record<string, unknown>;
    return (details?.items as Array<Record<string, unknown>>) || [];
  };

  const hasAuditFailed = (auditId: string): boolean => {
    const audit = audits[auditId];
    if (!audit) return false;
    // score < 0.9 usually means warning or failure
    return typeof audit.score === "number" && audit.score < 0.9;
  };

  for (const fix of WP_FIX_LIBRARY) {
    let triggered = false;
    let dynamicResource: string | string[] | undefined = undefined;

    // 1. Evaluate triggers
    if (fix.id === "lcp-image-lazy-loaded") {
      const lcpElemAudit = audits["largest-contentful-paint-element"];
      const items = (lcpElemAudit?.details as any)?.items || [];
      if (items.length > 0 && items[0].node?.snippet) {
        const snippet = items[0].node.snippet;
        if (snippet.includes("loading=\"lazy\"") || snippet.includes("lazyload")) {
          triggered = true;
          // Extract src if possible
          const match = snippet.match(/src="([^"]+)"/);
          if (match) dynamicResource = match[1];
        }
      }
    } else if (fix.id === "layout-shift-images") {
      const items = getAuditItems("layout-shift-elements");
      if (items.length > 0) {
        const imageShifts = items.filter(i => (i.node as any)?.snippet?.includes("<img"));
        if (imageShifts.length > 0) {
          triggered = true;
          dynamicResource = (imageShifts[0].node as any)?.snippet;
        }
      }
    } else if (fix.appliesWhen.lighthouseAuditIds) {
      for (const auditId of fix.appliesWhen.lighthouseAuditIds) {
        if (hasAuditFailed(auditId)) {
          triggered = true;
          const items = getAuditItems(auditId);
          if (items.length > 0 && items[0].url) {
            dynamicResource = items[0].url as string;
          }
          break;
        }
      }
    }

    if (!triggered) continue;

    // 2. Select Variant based on wpContext
    let selectedPluginName: string | undefined = undefined;
    let selectedPluginSlug: string | undefined = undefined;
    let selectedSteps = fix.genericWordPressSteps;
    let confidence: "confirmed" | "likely" | "unknown" = "unknown";

    if (fix.variants) {
      // Check performance plugins
      for (const plugin of wpContext.performancePlugins) {
        if (plugin.slug && fix.variants[plugin.slug as keyof typeof fix.variants]) {
          selectedPluginName = plugin.name;
          selectedPluginSlug = plugin.slug;
          selectedSteps = fix.variants[plugin.slug as keyof typeof fix.variants]!.steps;
          confidence = plugin.confidence;
          break;
        }
      }

      // Check image plugins if no perf plugin picked it up
      if (!selectedPluginName) {
        for (const plugin of wpContext.imagePlugins) {
          if (plugin.slug && fix.variants[plugin.slug as keyof typeof fix.variants]) {
            selectedPluginName = plugin.name;
            selectedPluginSlug = plugin.slug;
            selectedSteps = fix.variants[plugin.slug as keyof typeof fix.variants]!.steps;
            confidence = plugin.confidence;
            break;
          }
        }
      }

      // Check builder/theme
      if (!selectedPluginName && wpContext.pageBuilder && wpContext.pageBuilder.slug) {
        const slug = wpContext.pageBuilder.slug;
        if (fix.variants[slug as keyof typeof fix.variants]) {
          selectedPluginName = wpContext.pageBuilder.name;
          selectedPluginSlug = slug;
          selectedSteps = fix.variants[slug as keyof typeof fix.variants]!.steps;
          confidence = wpContext.pageBuilder.confidence;
        }
      }
    }

    recommendations.push({
      fixId: fix.id,
      impact: fix.impact,
      title: fix.title,
      resource: dynamicResource,
      context: {
        plugin: selectedPluginName,
        pluginSlug: selectedPluginSlug,
        confidence
      },
      steps: selectedSteps.map(s => s.instruction),
      verification: fix.verification,
      caution: fix.caution
    });
  }

  // Deduplication / Prioritization
  // High impact first, then medium, then low
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.impact] - priorityOrder[b.impact]);

  return recommendations;
}
