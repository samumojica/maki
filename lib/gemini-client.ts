import type { AuditResult, DetectedPlatform } from "./types";
import { deriveVerdict } from "./verdict";

const SYSTEM_PROMPT = `You are Maki, a web performance consultant writing for a non-technical website owner.

Your job: translate raw Google PageSpeed Insights data into a plain English Maki report.

Guidelines:
1. NEVER use jargon without explaining it in plain English first.
2. Always explain WHAT the problem means for their real visitors.
3. DETECT the site's platform from the PSI data (look at generator meta tags, script hosts like cdn.shopify.com / wp-content / assets.webflow.com, response headers, CMS-specific audit items) before writing fixes. Set detectedPlatform to one of: "wordpress", "shopify", "webflow", "static", "custom", or "unknown".
4. TAILOR every fix to the detected platform:
   - WordPress  -> name specific plugins and theme/admin settings (e.g., "Install WP Rocket", "In Settings -> Media, uncheck...")
   - Shopify    -> name specific apps and theme.liquid edits (e.g., "Install the Hyperspeed app", "In your theme's theme.liquid, move the script tag...")
   - Webflow    -> name specific Webflow settings (e.g., "Project Settings -> Hosting -> enable Minify CSS")
   - Static / Custom -> give concrete build-tool, HTTP header, or CDN instructions (e.g., "Add 'Cache-Control: public, max-age=31536000, immutable' to your /_next/static/ route", "In vite.config.ts enable build.minify: 'esbuild'")
   - Unknown    -> give platform-neutral instructions using standard web concepts (HTTP headers, CDN provider names, file-level changes)
5. At least ONE of the 5 topFixes MUST be platform-neutral (works regardless of stack) as a safety net.
6. Rank the 5 biggest fixes by impact (what will improve their site the most).
7. Include one "quick win" they can do in under 10 minutes — also tailored to the detected platform.
8. Return ONLY valid JSON, no markdown, no code blocks, no explanation.`;

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
  const items = a.details?.items?.slice(0, 5).map((item) => {
    // Keep only string/number fields from each item (drop nested nodes/snippets)
    const slim: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(item)) {
      if (typeof v === "string" && v.length < 200) slim[k] = v;
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

  const slimAudits: Record<string, object | null> = {};
  for (const id of RELEVANT_AUDITS) {
    const slim = slimAudit(audits[id]);
    if (slim) slimAudits[id] = slim;
  }

  return {
    performanceScore: categories?.performance?.score ?? null,
    fieldData: loading?.metrics ?? null,
    audits: slimAudits,
  };
}

function slimPSI(psiData: { mobile: unknown; desktop: unknown }): object {
  return {
    mobile: slimStrategy(psiData.mobile),
    desktop: slimStrategy(psiData.desktop),
  };
}

function buildPrompt(url: string, psiData: object): string {
  const slim = slimPSI(psiData as { mobile: unknown; desktop: unknown });
  return `Here is the Google PageSpeed Insights data for: ${url}

${JSON.stringify(slim)}

Analyze this data and return ONLY a valid JSON object with this exact structure:

{
  "overallVerdict": "pass" | "fail",
  "detectedPlatform": "wordpress" | "shopify" | "webflow" | "static" | "custom" | "unknown",
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
      "estimatedImpact": "Could save X seconds on page load"
    }
  ],
  "quickWin": {
    "title": "Thing you can do in under 10 minutes",
    "steps": ["Step 1", "Step 2", "Step 3"]
  },
  "checklistAfter": [
    "Verify X still works",
    "Check Y score in PageSpeed Insights again"
  ]
}`;
}

function extractScores(psiData: { mobile: unknown; desktop: unknown }): {
  mobileScore: number;
  desktopScore: number;
} {
  const m = psiData.mobile as Record<string, unknown>;
  const d = psiData.desktop as Record<string, unknown>;
  const mPerf = (
    (m?.lighthouseResult as Record<string, unknown>)
      ?.categories as Record<string, unknown>
  )?.performance as Record<string, unknown>;
  const dPerf = (
    (d?.lighthouseResult as Record<string, unknown>)
      ?.categories as Record<string, unknown>
  )?.performance as Record<string, unknown>;
  return {
    mobileScore: Math.round(((mPerf?.score as number) ?? 0) * 100),
    desktopScore: Math.round(((dPerf?.score as number) ?? 0) * 100),
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
  model: string
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

  const result = await genModel.generateContent(buildPrompt(url, psiData));
  const parsed = JSON.parse(cleanJSON(result.response.text()));
  const scores = extractScores(psiData as { mobile: unknown; desktop: unknown });
  const verdict = deriveVerdict(scores.mobileScore, scores.desktopScore);

  return {
    url,
    auditDate: new Date().toISOString(),
    ...parsed,
    ...scores,
    verdict,
    detectedPlatform: (parsed.detectedPlatform as DetectedPlatform) ?? "unknown",
  } as AuditResult;
}

async function callLlama(psiData: object, url: string): Promise<AuditResult> {
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
        { role: "user", content: buildPrompt(url, psiData) },
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
  const scores = extractScores(psiData as { mobile: unknown; desktop: unknown });
  const verdict = deriveVerdict(scores.mobileScore, scores.desktopScore);

  return {
    url,
    auditDate: new Date().toISOString(),
    ...parsed,
    ...scores,
    verdict,
    detectedPlatform: (parsed.detectedPlatform as DetectedPlatform) ?? "unknown",
  } as AuditResult;
}

export async function translatePSIWithFallback(
  psiData: object,
  url: string
): Promise<AuditResult> {
  try {
    console.log("[audit] Trying Gemini 2.5 Flash...");
    return await callGemini(psiData, url, "gemini-2.5-flash");
  } catch (err) {
    console.warn("[audit] Gemini Flash failed:", (err as Error).message);
    try {
      console.log("[audit] Trying Gemini 2.5 Flash Lite...");
      return await callGemini(psiData, url, "gemini-2.5-flash-lite-preview-06-17");
    } catch (err2) {
      console.warn("[audit] Gemini Lite failed:", (err2 as Error).message);
      console.log("[audit] Trying Groq Llama 3.3 70B...");
      return await callLlama(psiData, url);
    }
  }
}
