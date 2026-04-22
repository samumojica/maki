import type { AuditResult, DetectedPlatform, SiteInfo } from "./types";
import { deriveVerdict } from "./verdict";

const SYSTEM_PROMPT = `You are Maki, a high-end web performance and SEO engineer. You are writing a premium diagnostic report for a website owner.

Your job: translate raw Google PageSpeed Insights data into a professional, actionable Maki report.

Critical Guidelines for Snippets:
1. CODE SNIPPETS MUST BE REAL: For EACH fix, providing a 'codeSnippet' is mandatory if the platform allows it. These must be production-ready.
   - WordPress: Provide specific PHP snippets for functions.php or configuration for .htaccess.
   - Shopify: Provide specific Liquid code for theme.liquid.
   - Meta Tags: Provide the EXACT HTML tags pre-filled with the user's actual URL and data.
2. SEO SNIPPETS MUST BE PRE-FILLED: Do NOT provide placeholders like "Your description here". Use the site's actual URL (provided in the user prompt) and any info you can glean from the audit to generate REAL meta tags, JSON-LD Schema, and Open Graph tags that the user can paste immediately.
3. TAILOR TO PLATFORM: Detect the site's platform accurately. Set detectedPlatform to one of: "wordpress", "shopify", "webflow", "squarespace", "wix", "static", "custom", or "unknown".
   - WordPress -> resourceUrl: "https://wordpress.org/plugins/[slug]/".
   - Shopify -> resourceUrl: "https://apps.shopify.com/[slug]/".
4. EXPLAIN IMPACT: Always explain what the fix means for real human visitors (e.g., "This stops the page from jumping around while images load").
5. LANGUAGE: Return ONLY valid JSON. No markdown blocks.

Structure of seoSnippets:
- Meta Description: Generate a professional 155-character description based on the site.
- JSON-LD: Generate a valid Schema.org script for a WebSite or Organization.
- Open Graph: Generate the <meta property="og:..."> tags with the site's URL.

Rank the 7 topFixes by impact. Include one "quick win" (under 10 mins).`;

// Keep only the audits & fields that matter. Raw PSI responses are ~1MB each;
// the slimmed version is typically <50KB — safely inside any model's context.
const RELEVANT_AUDITS = [
  "largest-contentful-paint",
  "largest-contentful-paint-element",
  "interaction-to-next-paint",
  "cumulative-layout-shift",
  "layout-shift-elements",
  "first-contentful-paint",
  "speed-index",
  "total-blocking-time",
  "server-response-time",
  "render-blocking-resources",
  "unused-javascript",
  "unused-css-rules",
  "unminified-javascript",
  "unminified-css",
  "uses-webp-images",
  "uses-optimized-images",
  "uses-responsive-images",
  "offscreen-images",
  "uses-text-compression",
  "uses-long-cache-ttl",
  "dom-size",
  "mainthread-work-breakdown",
  "third-party-summary",
  "legacy-javascript",
  "modern-image-formats",
  "efficient-animated-content",
  "bootup-time",
  "network-requests",
  "total-byte-weight",
  // Additional audits for richer tech detection
  "diagnostics",
  "resource-summary",
  "script-treemap-data",
];

interface LighthouseAudit {
  id?: string;
  title?: string;
  description?: string;
  score?: number | null;
  displayValue?: string;
  numericValue?: number;
  details?: {
    items?: Array<Record<string, unknown>>;
    [key: string]: unknown;
  };
}

function slimAudit(a: LighthouseAudit | undefined): object | null {
  if (!a) return null;
  const items = a.details?.items?.slice(0, 8).map((item) => {
    // Keep only string/number fields from each item (drop nested nodes/snippets)
    const slim: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(item)) {
      if (typeof v === "string" && v.length < 300) slim[k] = v;
      else if (typeof v === "number") slim[k] = v;
      else if (v && typeof v === "object" && "selector" in v) {
        slim[k] = (v as { selector: string }).selector;
      }
    }
    return slim;
  });
  return {
    title: a.title,
    score: a.score,
    displayValue: a.displayValue,
    numericValue: a.numericValue,
    ...(items && items.length ? { items } : {}),
  };
}

function slimStrategy(raw: unknown): object {
  const r = raw as Record<string, unknown>;
  const lh = r?.lighthouseResult as Record<string, unknown> | undefined;
  const categories = lh?.categories as Record<string, { score?: number }> | undefined;
  const audits = (lh?.audits ?? {}) as Record<string, LighthouseAudit>;
  const loading = r?.loadingExperience as Record<string, unknown> | undefined;
  const stackPacks = lh?.stackPacks as Array<{ id: string; title: string }> | undefined;

  const slimAudits: Record<string, object | null> = {};
  for (const id of RELEVANT_AUDITS) {
    const slim = slimAudit(audits[id]);
    if (slim) slimAudits[id] = slim;
  }

  return {
    performanceScore: categories?.performance?.score ?? null,
    seoScore: categories?.seo?.score ?? null,
    accessibilityScore: categories?.accessibility?.score ?? null,
    bestPracticesScore: categories?.["best-practices"]?.score ?? null,
    fieldData: loading?.metrics ?? null,
    fieldOverallCategory: loading?.overall_category ?? null,
    audits: slimAudits,
    stackPacks: stackPacks?.map((sp) => ({ id: sp.id, title: sp.title })) ?? [],
  };
}

function slimPSI(psiData: { mobile: unknown; desktop: unknown }): object {
  return {
    mobile: slimStrategy(psiData.mobile),
    desktop: slimStrategy(psiData.desktop),
  };
}

function buildPrompt(
  url: string,
  psiData: object,
  serverContext: { serverCountry?: string | null; serverSoftware?: string; cdnDetected?: string; technologies?: string[] }
): string {
  const slim = slimPSI(psiData as { mobile: unknown; desktop: unknown });

  let contextBlock = "";
  if (serverContext.serverCountry) {
    contextBlock += `\nOrigin server country: ${serverContext.serverCountry}`;
  }
  if (serverContext.serverSoftware) {
    contextBlock += `\nServer software: ${serverContext.serverSoftware}`;
  }
  if (serverContext.cdnDetected) {
    contextBlock += `\nCDN detected: ${serverContext.cdnDetected}`;
  }
  if (serverContext.technologies?.length) {
    contextBlock += `\nDetected technologies: ${serverContext.technologies.join(", ")}`;
  }

  return `Here is the Google PageSpeed Insights data for: ${url}
${contextBlock ? `\nAdditional server context:${contextBlock}\n` : ""}
${JSON.stringify(slim)}

Analyze this data and return ONLY a valid JSON object with this exact structure:

{
  "overallVerdict": "pass" | "fail",
  "detectedPlatform": "wordpress" | "shopify" | "webflow" | "squarespace" | "wix" | "static" | "custom" | "unknown",
  "summaryParagraph": "Plain English paragraph about what this means for their visitors",
  "cwvScores": {
    "lcp": { "value": "X.X s", "status": "pass" | "fail", "meaning": "Plain English" },
    "inp": { "value": "X ms", "status": "pass" | "fail", "meaning": "Plain English" },
    "cls": { "value": "X", "status": "pass" | "fail", "meaning": "Plain English" }
  },
  "topFixes": [
    {
      "rank": 1,
      "problemHeadline": "Short headline",
      "whyItMatters": "Plain English explanation of impact on real visitors",
      "whatToDo": "Exact steps: 1. Go to [location], 2. Change [setting] to [value], 3. Install [plugin name]",
      "codeSnippet": "// Ready-to-paste code\\n// Multiple lines allowed",
      "snippetLang": "javascript",
      "resourceUrl": "https://example.com/plugin-or-guide",
      "resourceLabel": "Plugin Name on WordPress.org",
      "estimatedImpact": "Could save X seconds on page load"
    }
  ],
  "quickWin": {
    "title": "Thing you can do in under 10 minutes",
    "steps": ["Step 1", "Step 2", "Step 3"]
  },
  "seoSnippets": [
    {
      "title": "Add a proper meta description",
      "description": "This tells Google what your page is about in search results.",
      "code": "<meta name=\\"description\\" content=\\"Your description here\\">",
      "lang": "html"
    }
  ],
  "checklistAfter": [
    "Verify X still works",
    "Check Y score in PageSpeed Insights again"
  ]
}

IMPORTANT:
- Return exactly 7 items in topFixes, ranked by impact.
- Each fix MUST include codeSnippet and resourceUrl when applicable (set to null if not applicable).
- Include 3-4 items in seoSnippets with ready-to-paste code.
- Tailor ALL fixes to the detected platform.`;
}

function extractScores(psiData: { mobile: unknown; desktop: unknown }): {
  mobileScore: number;
  desktopScore: number;
} {
  const m = (psiData.mobile as Record<string, unknown>)?.lighthouseResult as Record<string, unknown>;
  const d = (psiData.desktop as Record<string, unknown>)?.lighthouseResult as Record<string, unknown>;

  const mCats = (m?.categories as Record<string, { score: unknown }>) ?? {};
  const dCats = (d?.categories as Record<string, { score: unknown }>) ?? {};

  const mScore = mCats?.performance?.score;
  const dScore = dCats?.performance?.score;

  return {
    mobileScore: mScore != null ? Math.round((mScore as number) * 100) : 0,
    desktopScore: dScore != null ? Math.round((dScore as number) * 100) : 0,
  };
}

function extractAllCategoryScores(psiData: { mobile: unknown; desktop: unknown }): {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
} {
  // Use mobile scores as the primary (Google prioritizes mobile)
  const m = (psiData.mobile as Record<string, unknown>)?.lighthouseResult as Record<string, unknown>;
  const cats = (m?.categories as Record<string, { score: unknown }>) ?? {};

  const getScore = (cat: string) => {
    const s = cats[cat]?.score;
    return s != null ? Math.round((s as number) * 100) : 0;
  };

  return {
    performance: getScore("performance"),
    accessibility: getScore("accessibility"),
    bestPractices: getScore("best-practices"),
    seo: getScore("seo"),
  };
}

function cleanJSON(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
}

async function callGemini(
  psiData: object,
  url: string,
  model: string,
  serverContext: { serverCountry?: string | null; serverSoftware?: string; cdnDetected?: string; technologies?: string[] }
): Promise<AuditResult> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY is not set");

  // Dynamic import so the module isn't evaluated at build time
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const client = new GoogleGenerativeAI(apiKey);
  const genModel = client.getGenerativeModel({
    model,
    systemInstruction: SYSTEM_PROMPT,
  });

  const audit = await genModel.generateContent(buildPrompt(url, psiData, serverContext));
  const parsed = JSON.parse(cleanJSON(audit.response.text()));
  const psi = psiData as { mobile: unknown; desktop: unknown };
  const scores = extractScores(psi);
  
  console.log(`[audit] Result for ${url}: mobile=${scores.mobileScore}, desktop=${scores.desktopScore}, platform=${parsed.detectedPlatform}`);

  const verdict = deriveVerdict(scores.mobileScore, scores.desktopScore);
  const lighthouseCategories = extractAllCategoryScores(psi);

  const detectedPlatform = (parsed.detectedPlatform as DetectedPlatform) ?? "unknown";

  const siteInfo: SiteInfo = {
    detectedPlatform,
    serverSoftware: serverContext.serverSoftware,
    serverCountry: serverContext.serverCountry ?? undefined,
    cdnDetected: serverContext.cdnDetected,
    technologies: serverContext.technologies,
  };

  // Detect if CrUX field data is available
  const loading = (psi.mobile as Record<string, unknown>)?.loadingExperience as Record<string, unknown> | undefined;
  const fieldDataAvailable = loading?.overall_category != null;

  return {
    url,
    auditDate: new Date().toISOString(),
    ...parsed,
    ...scores,
    verdict,
    siteInfo,
    lighthouseCategories,
    fieldDataAvailable,
    detectedPlatform, // backward compat
    // Ensure seoSnippets exists even if AI didn't return it
    seoSnippets: parsed.seoSnippets ?? [],
  } as AuditResult;
}

async function callLlama(
  psiData: object,
  url: string,
  serverContext: { serverCountry?: string | null; serverSoftware?: string; cdnDetected?: string; technologies?: string[] }
): Promise<AuditResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(url, psiData, serverContext) },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Llama API error: ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data.choices[0].message.content;
  const parsed = JSON.parse(cleanJSON(text));
  const psi = psiData as { mobile: unknown; desktop: unknown };
  const scores = extractScores(psi);

  console.log(`[audit][llama] Result for ${url}: mobile=${scores.mobileScore}, desktop=${scores.desktopScore}, platform=${parsed.detectedPlatform}`);

  const verdict = deriveVerdict(scores.mobileScore, scores.desktopScore);
  const lighthouseCategories = extractAllCategoryScores(psi);

  const detectedPlatform = (parsed.detectedPlatform as DetectedPlatform) ?? "unknown";

  const siteInfo: SiteInfo = {
    detectedPlatform,
    serverSoftware: serverContext.serverSoftware,
    serverCountry: serverContext.serverCountry ?? undefined,
    cdnDetected: serverContext.cdnDetected,
    technologies: serverContext.technologies,
  };

  const loading = (psi.mobile as Record<string, unknown>)?.loadingExperience as Record<string, unknown> | undefined;
  const fieldDataAvailable = loading?.overall_category != null;

  return {
    url,
    auditDate: new Date().toISOString(),
    ...parsed,
    ...scores,
    verdict,
    siteInfo,
    lighthouseCategories,
    fieldDataAvailable,
    detectedPlatform,
    seoSnippets: parsed.seoSnippets ?? [],
  } as AuditResult;
}

export async function translatePSIWithFallback(
  psiData: object,
  url: string,
  serverContext: { serverCountry?: string | null; serverSoftware?: string; cdnDetected?: string; technologies?: string[] } = { technologies: [] }
): Promise<AuditResult> {
  try {
    console.log("[audit] Trying Gemini 2.5 Flash...");
    return await callGemini(psiData, url, "gemini-2.5-flash", serverContext);
  } catch (err) {
    console.warn("[audit] Gemini Flash failed:", (err as Error).message);
    try {
      console.log("[audit] Trying Gemini 2.5 Flash Lite...");
      return await callGemini(psiData, url, "gemini-2.5-flash-lite-preview-06-17", serverContext);
    } catch (err2) {
      console.warn("[audit] Gemini Lite failed:", (err2 as Error).message);
      console.log("[audit] Trying Groq Llama 3.3 70B...");
      return await callLlama(psiData, url, serverContext);
    }
  }
}
