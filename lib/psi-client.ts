const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export interface PSIResponse {
  mobile: object;
  desktop: object;
}

export interface ExtractedSiteInfo {
  serverSoftware?: string;
  cdnDetected?: string;
  technologies: string[];
  stackPacks: Array<{ id: string; title: string }>;
}

async function fetchPSI(url: string, strategy: "mobile" | "desktop"): Promise<object> {
  const params = new URLSearchParams({ url, strategy, category: "performance" });
  // Also request SEO + accessibility + best-practices categories
  params.append("category", "seo");
  params.append("category", "accessibility");
  params.append("category", "best-practices");

  if (process.env.GOOGLE_PSI_API_KEY) {
    params.set("key", process.env.GOOGLE_PSI_API_KEY);
  }

  // PSI's Lighthouse sandbox occasionally crashes (500) on the first try — retry a couple times.
  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${PSI_BASE}?${params}`, { next: { revalidate: 0 } });
    if (res.ok) return res.json();

    const text = await res.text();
    lastError = `${res.status} ${text.slice(0, 200)}`;
    // Only retry on 5xx (server-side Lighthouse flakiness). 4xx means bad input, don't retry.
    if (res.status < 500) break;
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error(`PSI API error (${strategy}): ${lastError}`);
}

export async function fetchBothStrategies(url: string): Promise<PSIResponse> {
  const [mobile, desktop] = await Promise.all([
    fetchPSI(url, "mobile"),
    fetchPSI(url, "desktop"),
  ]);
  return { mobile, desktop };
}

/**
 * Detect the origin server's country by resolving the domain's IP.
 * Uses the free ip-api.com service. Returns ISO country code or null.
 */
export async function detectServerGeo(url: string): Promise<string | null> {
  try {
    const hostname = new URL(url).hostname;
    const res = await fetch(
      `http://ip-api.com/json/${hostname}?fields=status,countryCode`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === "success" ? (data.countryCode ?? null) : null;
  } catch {
    // Non-critical — don't let this break the scan
    console.warn("[geo] Server geo detection failed, skipping");
    return null;
  }
}

/**
 * Extract server info, CDN, and technology signals from the raw PSI response.
 */
export function extractSiteInfo(psiData: { mobile: unknown; desktop: unknown }): ExtractedSiteInfo {
  const result: ExtractedSiteInfo = {
    technologies: [],
    stackPacks: [],
  };

  // Use mobile data (richer in some cases)
  const raw = psiData.mobile as Record<string, unknown>;
  const lh = raw?.lighthouseResult as Record<string, unknown> | undefined;

  // Extract response headers from server-response-time audit
  const audits = (lh?.audits ?? {}) as Record<string, Record<string, unknown>>;
  const serverResponse = audits?.["server-response-time"];
  if (serverResponse?.details) {
    const details = serverResponse.details as Record<string, unknown>;
    const items = details?.items as Array<Record<string, unknown>> | undefined;
    if (items?.[0]) {
      const headers = items[0];
      // Some PSI responses include response headers
      if (typeof headers.responseTime === "number") {
        // TTFB info available
      }
    }
  }

  // Extract environment info (user agent, server headers)
  const environment = lh?.environment as Record<string, unknown> | undefined;
  if (environment?.hostUserAgent && typeof environment.hostUserAgent === "string") {
    const ua = environment.hostUserAgent.toLowerCase();
    if (ua.includes("nginx")) result.serverSoftware = "nginx";
    else if (ua.includes("apache")) result.serverSoftware = "Apache";
    else if (ua.includes("cloudflare")) result.serverSoftware = "Cloudflare";
  }

  // Extract stack packs (WordPress, Joomla, Drupal, etc.)
  const stackPacks = lh?.stackPacks as Array<{ id: string; title: string }> | undefined;
  if (stackPacks?.length) {
    result.stackPacks = stackPacks.map((sp) => ({ id: sp.id, title: sp.title }));

    for (const sp of stackPacks) {
      const id = sp.id.toLowerCase();
      if (id.includes("wordpress") || id === "wp") result.technologies.push("WordPress");
      else if (id.includes("react")) result.technologies.push("React");
      else if (id.includes("angular")) result.technologies.push("Angular");
      else if (id.includes("vue")) result.technologies.push("Vue");
      else if (id.includes("next")) result.technologies.push("Next.js");
      else if (id.includes("amp")) result.technologies.push("AMP");
      else result.technologies.push(sp.title);
    }
  }

  // Detect CDN from audit data
  const thirdParty = audits?.["third-party-summary"];
  if (thirdParty?.details) {
    const details = thirdParty.details as Record<string, unknown>;
    const items = details?.items as Array<Record<string, unknown>> | undefined;
    if (items) {
      for (const item of items) {
        const entity = (item.entity as string) ?? "";
        const entityLower = entity.toLowerCase();
        if (entityLower.includes("cloudflare")) result.cdnDetected = "Cloudflare";
        else if (entityLower.includes("fastly")) result.cdnDetected = "Fastly";
        else if (entityLower.includes("cloudfront") || entityLower.includes("amazon")) result.cdnDetected = "AWS CloudFront";
        else if (entityLower.includes("akamai")) result.cdnDetected = "Akamai";
        else if (entityLower.includes("google cdn") || entityLower.includes("gstatic")) result.cdnDetected = "Google CDN";
      }
    }
  }

  // Detect technologies from network requests
  const networkRequests = audits?.["network-requests"];
  if (networkRequests?.details) {
    const details = networkRequests.details as Record<string, unknown>;
    const items = details?.items as Array<Record<string, unknown>> | undefined;
    if (items) {
      const urls = items.map((i) => (i.url as string) ?? "").join(" ").toLowerCase();
      if (urls.includes("wp-content") || urls.includes("wp-includes")) {
        if (!result.technologies.includes("WordPress")) result.technologies.push("WordPress");
      }
      if (urls.includes("cdn.shopify.com") || urls.includes("myshopify.com")) {
        if (!result.technologies.includes("Shopify")) result.technologies.push("Shopify");
      }
      if (urls.includes("assets-global.website-files.com") || urls.includes("webflow.com")) {
        if (!result.technologies.includes("Webflow")) result.technologies.push("Webflow");
      }
      if (urls.includes("squarespace.com") || urls.includes("sqsp.com")) {
        if (!result.technologies.includes("Squarespace")) result.technologies.push("Squarespace");
      }
      if (urls.includes("wix.com") || urls.includes("parastorage.com")) {
        if (!result.technologies.includes("Wix")) result.technologies.push("Wix");
      }
      if (urls.includes("jquery")) {
        if (!result.technologies.includes("jQuery")) result.technologies.push("jQuery");
      }
      if (urls.includes("react")) {
        if (!result.technologies.includes("React")) result.technologies.push("React");
      }
      if (urls.includes("_next/")) {
        if (!result.technologies.includes("Next.js")) result.technologies.push("Next.js");
      }
      if (urls.includes("googletagmanager.com") || urls.includes("gtag")) {
        if (!result.technologies.includes("Google Tag Manager")) result.technologies.push("Google Tag Manager");
      }
      if (urls.includes("google-analytics.com") || urls.includes("analytics.js")) {
        if (!result.technologies.includes("Google Analytics")) result.technologies.push("Google Analytics");
      }

      // CDN detection from request URLs
      if (!result.cdnDetected) {
        if (urls.includes("cloudflare")) result.cdnDetected = "Cloudflare";
        else if (urls.includes("cloudfront.net")) result.cdnDetected = "AWS CloudFront";
        else if (urls.includes("fastly.net")) result.cdnDetected = "Fastly";
        else if (urls.includes("vercel.app") || urls.includes("vercel-")) result.cdnDetected = "Vercel Edge";
        else if (urls.includes("netlify")) result.cdnDetected = "Netlify";
      }
    }
  }

  return result;
}

/**
 * Extract all Lighthouse category scores from the PSI response.
 */
export function extractLighthouseCategories(
  psiData: { mobile: unknown; desktop: unknown }
): { mobile: Record<string, number>; desktop: Record<string, number> } {
  function getCategories(raw: unknown): Record<string, number> {
    const r = raw as Record<string, unknown>;
    const lh = r?.lighthouseResult as Record<string, unknown> | undefined;
    const cats = lh?.categories as Record<string, { score?: number }> | undefined;
    if (!cats) return {};
    const result: Record<string, number> = {};
    for (const [key, val] of Object.entries(cats)) {
      if (val?.score != null) result[key] = Math.round(val.score * 100);
    }
    return result;
  }
  return {
    mobile: getCategories(psiData.mobile),
    desktop: getCategories(psiData.desktop),
  };
}

/**
 * Check if PSI returned real field data (CrUX) or only lab data.
 */
export function hasFieldData(psiData: { mobile: unknown }): boolean {
  const raw = psiData.mobile as Record<string, unknown>;
  const loading = raw?.loadingExperience as Record<string, unknown> | undefined;
  const origin = loading?.overall_category;
  // If overall_category exists, CrUX data is available
  return origin != null;
}
