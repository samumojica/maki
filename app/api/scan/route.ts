import { NextRequest, NextResponse } from "next/server";
import type { ScanRequest, TeaserResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RateBucket = { hits: number[] };
type GlobalWithRate = typeof globalThis & {
  __cwvScanRate?: Map<string, RateBucket>;
};
function rateStore(): Map<string, RateBucket> {
  const g = globalThis as GlobalWithRate;
  if (!g.__cwvScanRate) g.__cwvScanRate = new Map();
  return g.__cwvScanRate;
}
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateStore().get(ip) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < WINDOW_MS);
  if (bucket.hits.length >= MAX_PER_WINDOW) {
    rateStore().set(ip, bucket);
    return true;
  }
  bucket.hits.push(now);
  rateStore().set(ip, bucket);
  return false;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const body: ScanRequest = await req.json();
    const { url, tier } = body;

    if (!url || !tier) {
      return NextResponse.json({ error: "Missing url or tier" }, { status: 400 });
    }
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (tier !== "basic") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const ip = clientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "You've run a lot of scans recently. Please try again in an hour." },
        { status: 429 }
      );
    }

    const [
      { fetchBothStrategies, detectServerGeo, extractSiteInfo },
      { translatePSIWithFallback },
      { putScan },
    ] = await Promise.all([
      import("@/lib/psi-client"),
      import("@/lib/gemini-client"),
      import("@/lib/scan-store"),
    ]);

    console.log(`[scan] Starting scan for ${url}`);

    // Fetch PSI data and geo in parallel
    const [psiData, serverCountry] = await Promise.all([
      fetchBothStrategies(url),
      detectServerGeo(url),
    ]);

    // Extract technology info from PSI response
    const siteInfoExtracted = extractSiteInfo(psiData);

    // Build server context for the AI prompt
    const serverContext = {
      serverCountry,
      serverSoftware: siteInfoExtracted.serverSoftware,
      cdnDetected: siteInfoExtracted.cdnDetected,
      technologies: siteInfoExtracted.technologies,
    };

    console.log(`[scan] Server context:`, serverContext);

    const audit = await translatePSIWithFallback(psiData, url, serverContext);

    const scanId = crypto.randomUUID();
    putScan({ scanId, url, tier, audit, createdAt: Date.now() });

    const teaser: TeaserResult = {
      url: audit.url,
      verdict: audit.verdict,
      mobileScore: audit.mobileScore,
      desktopScore: audit.desktopScore,
      summaryParagraph: audit.summaryParagraph,
      createdAt: Date.now(),
    };

    return NextResponse.json({ scanId, teaser });
  } catch (err) {
    const msg = (err as Error).message ?? "";
    console.error("Scan error:", msg);
    if (/429|rate limit|quota/i.test(msg)) {
      return NextResponse.json(
        { error: "Our AI translator is briefly overloaded. Please try again in a minute." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: `Scan failed: ${msg}` }, { status: 500 });
  }
}
