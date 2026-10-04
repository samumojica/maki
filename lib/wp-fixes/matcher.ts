/* eslint-disable @typescript-eslint/no-explicit-any -- walks untyped PageSpeed Insights JSON */
import { WordPressFixRecommendation } from "./types";
import { WP_FIX_LIBRARY } from "./index";
import { WordPressContext } from "../types";

type TriggerResult = { resource?: string | string[] } | null;

interface TriggerContext {
  audits: Record<string, Record<string, unknown>>;
  requestUrls: string[];
  pageUrl: string;
  wpContext: WordPressContext;
  hasAuditFailed: (auditId: string) => boolean;
}

const LCP_SRC = /src="([^"]+)"/;
const GOOGLE_TAGS = /Google (Tag Manager|Analytics)/i;

// Lighthouse 13 "insight" audits nest their data: details.items is a list of sub-tables/checklists/nodes.
function insightParts(audit: Record<string, unknown> | undefined): Array<Record<string, any>> {
  const details = audit?.details as Record<string, any> | undefined;
  if (!details) return [];
  return Array.isArray(details.items) ? details.items : [];
}

function lcpDiscovery(ctx: TriggerContext) {
  const parts = insightParts(ctx.audits["lcp-discovery-insight"]);
  const checklist = parts.find((p) => p.type === "checklist")?.items as Record<string, { value: boolean }> | undefined;
  const node = parts.find((p) => p.type === "node") as { snippet?: string } | undefined;
  return { checklist, snippet: node?.snippet };
}

function snippetSrc(snippet?: string) {
  return snippet?.match(LCP_SRC)?.[1];
}

/** URLs from the given audits' tables that are served from the scanned site's own domain (things the owner can fix). */
function firstPartyUrls(ctx: TriggerContext, auditIds: string[]): string[] {
  let host = "";
  try {
    host = new URL(ctx.pageUrl).hostname.replace(/^www\./, "");
  } catch {
    return [];
  }
  const urls = auditIds
    .filter((id) => ctx.hasAuditFailed(id))
    .flatMap((id) => insightParts(ctx.audits[id]))
    .map((i) => i.url)
    .filter((u): u is string => typeof u === "string");
  return urls.filter((u) => {
    try {
      return new URL(u).hostname.replace(/^www\./, "").endsWith(host);
    } catch {
      return false;
    }
  });
}

/**
 * Fix-specific detection that can't be expressed as "audit failed" or "request URL matches".
 * Supports both the legacy Lighthouse audits and the Lighthouse 13 insights PSI returns today.
 */
const CUSTOM_TRIGGERS: Record<string, (ctx: TriggerContext) => TriggerResult> = {
  "lcp-image-lazy-loaded": (ctx) => {
    const { checklist, snippet } = lcpDiscovery(ctx);
    if (checklist?.eagerlyLoaded?.value === false) return { resource: snippetSrc(snippet) };

    // Legacy (Lighthouse ≤12)
    const items = (ctx.audits["largest-contentful-paint-element"]?.details as any)?.items || [];
    const legacySnippet: string | undefined = items[0]?.node?.snippet ?? items[0]?.items?.[0]?.node?.snippet;
    if (legacySnippet && (legacySnippet.includes('loading="lazy"') || legacySnippet.includes("lazyload"))) {
      return { resource: snippetSrc(legacySnippet) };
    }
    return null;
  },

  "lcp-image-not-prioritized": (ctx) => {
    const { checklist, snippet } = lcpDiscovery(ctx);
    // Lazy-loading is the bigger problem and has its own fix — don't double up.
    if (checklist?.priorityHinted?.value === false && checklist?.eagerlyLoaded?.value !== false) {
      return { resource: snippetSrc(snippet) };
    }
    return null;
  },

  "layout-shift-images": (ctx) => {
    const fromInsight = insightParts(ctx.audits["cls-culprits-insight"])
      .flatMap((p) => (Array.isArray(p.items) ? p.items : []))
      .map((i: any) => i?.node?.snippet as string | undefined);
    const legacy = ((ctx.audits["layout-shift-elements"]?.details as any)?.items || []).map(
      (i: any) => i?.node?.snippet as string | undefined
    );
    const imgShift = [...fromInsight, ...legacy].find((snip) => snip?.includes("<img"));
    return imgShift ? { resource: imgShift } : null;
  },

  "third-party-javascript": (ctx) => {
    const entities = insightParts(ctx.audits["third-parties-insight"]) as Array<{ entity?: string; mainThreadTime?: number }>;
    // Google Tag Manager / Analytics have their own fix (heavy-analytics-tags)
    const heavy = entities.filter((e) => (e.mainThreadTime ?? 0) > 250 && !GOOGLE_TAGS.test(e.entity ?? ""));
    return heavy.length ? { resource: heavy.map((e) => e.entity ?? "Unknown") } : null;
  },

  "heavy-analytics-tags": (ctx) => {
    const entities = insightParts(ctx.audits["third-parties-insight"]) as Array<{ entity?: string; mainThreadTime?: number }>;
    const google = entities.filter((e) => GOOGLE_TAGS.test(e.entity ?? ""));
    const total = google.reduce((sum, e) => sum + (e.mainThreadTime ?? 0), 0);
    return total > 250 ? { resource: google.map((e) => `${e.entity} (${Math.round(e.mainThreadTime ?? 0)}ms)`) } : null;
  },

  "too-large-dom": (ctx) => {
    const stats = insightParts(ctx.audits["dom-size-insight"]) as Array<{ statistic?: string; value?: { value?: number } }>;
    const total = stats.find((s) => s.statistic === "Total elements")?.value?.value;
    return typeof total === "number" && total > 1500 ? { resource: `${total} DOM elements` } : null;
  },

  "server-response-time": (ctx) => {
    const details = ctx.audits["document-latency-insight"]?.details as any;
    if (details?.items?.serverResponseIsFast?.value === false) {
      return { resource: details.items.serverResponseIsFast.label };
    }
    return null;
  },

  "text-compression": (ctx) => {
    const details = ctx.audits["document-latency-insight"]?.details as any;
    return details?.items?.usesCompression?.value === false ? { resource: ctx.pageUrl } : null;
  },

  "critical-request-chains": (ctx) => {
    const sections = insightParts(ctx.audits["network-dependency-tree-insight"]);
    const duration = sections.find((p) => p.value?.longestChain)?.value?.longestChain?.duration as number | undefined;
    if (typeof duration === "number" && duration > 2000) return { resource: `Longest chain: ${Math.round(duration)}ms` };
    return null;
  },

  "static-cache-policy": (ctx) => {
    const urls = firstPartyUrls(ctx, ["cache-insight", "uses-long-cache-ttl"]);
    return urls.length ? { resource: urls.slice(0, 3) } : null;
  },

  "unminified-assets": (ctx) => {
    const urls = firstPartyUrls(ctx, ["unminified-css", "unminified-javascript"]);
    return urls.length ? { resource: urls.slice(0, 3) } : null;
  },

  "block-library-css": (ctx) => {
    if (!ctx.wpContext.pageBuilder) return null;
    const hits = ctx.requestUrls.filter((u) => u.includes("/block-library/style"));
    return hits.length ? { resource: hits } : null;
  },

  "woocommerce-assets-sitewide": (ctx) => {
    if (/\/(shop|product|products|cart|checkout|my-account|product-category|tienda|carrito)\b/i.test(ctx.pageUrl)) return null;
    const hits = ctx.requestUrls.filter((u) => u.includes("/plugins/woocommerce/"));
    return hits.length ? { resource: hits.slice(0, 3) } : null;
  },
};

export function matchWordPressFixes(
  psiData: { mobile: unknown },
  wpContext: WordPressContext
): WordPressFixRecommendation[] {
  const recommendations: WordPressFixRecommendation[] = [];

  const raw = psiData.mobile as Record<string, unknown>;
  const lh = raw?.lighthouseResult as Record<string, unknown> | undefined;
  const audits = (lh?.audits ?? {}) as Record<string, Record<string, unknown>>;

  const getAuditItems = (auditId: string): Array<Record<string, unknown>> => {
    const details = audits[auditId]?.details as Record<string, unknown>;
    const items = details?.items;
    return Array.isArray(items) ? (items as Array<Record<string, unknown>>) : [];
  };

  const hasAuditFailed = (auditId: string): boolean => {
    const audit = audits[auditId];
    if (!audit) return false;
    // score < 0.9 usually means warning or failure
    return typeof audit.score === "number" && audit.score < 0.9;
  };

  const requestUrls = getAuditItems("network-requests")
    .map((i) => i.url)
    .filter((u): u is string => typeof u === "string");

  const ctx: TriggerContext = {
    audits,
    requestUrls,
    pageUrl: String(lh?.finalDisplayedUrl ?? lh?.finalUrl ?? lh?.requestedUrl ?? ""),
    wpContext,
    hasAuditFailed,
  };

  for (const fix of WP_FIX_LIBRARY) {
    let triggered = false;
    let dynamicResource: string | string[] | undefined = undefined;

    // 1. Evaluate triggers — any of: custom detector, failing audit, matching request
    const custom = CUSTOM_TRIGGERS[fix.id]?.(ctx);
    if (custom) {
      triggered = true;
      dynamicResource = custom.resource;
    }

    if (!triggered && fix.appliesWhen.lighthouseAuditIds) {
      for (const auditId of fix.appliesWhen.lighthouseAuditIds) {
        if (hasAuditFailed(auditId)) {
          triggered = true;
          const items = getAuditItems(auditId);
          if (items.length > 0 && typeof items[0].url === "string") {
            dynamicResource = items[0].url;
          }
          break;
        }
      }
    }

    if (!triggered && fix.appliesWhen.requestPatterns) {
      const patterns = fix.appliesWhen.requestPatterns;
      const hits = requestUrls.filter((u) => patterns.some((p) => u.includes(p)));
      if (hits.length > 0) {
        triggered = true;
        dynamicResource = hits.length === 1 ? hits[0] : hits.slice(0, 3);
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
