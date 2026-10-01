import { NextRequest, NextResponse } from "next/server";
import type { AuditRequest } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const [{ stripe }, { getScan, markScanUnlocked }] = await Promise.all([
      import("@/lib/stripe-client"),
      import("@/lib/scan-store"),
    ]);

    const body: AuditRequest = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const scanId = session.metadata?.scanId;
    const url = session.metadata?.url;

    if (scanId) {
      const entry = await getScan(scanId);
      if (entry) {
        console.log(`[audit] scan-store hit for ${scanId}`);
        await markScanUnlocked(scanId);
        // Add scanId to the returned audit to allow redirection
        return NextResponse.json({ ...entry.audit, scanId });
      }
      console.log(`[audit] scan-store miss for ${scanId}, falling back to re-scan`);
    }

    if (!url) {
      return NextResponse.json({ error: "No URL found in session" }, { status: 400 });
    }

    const { fetchBothStrategies, detectServerGeo, extractSiteInfo } = await import("@/lib/psi-client");
    const { translatePSIWithFallback } = await import("@/lib/gemini-client");
    const { detectWordPressContext } = await import("@/lib/wp-detection");

    const [psiData, serverCountry] = await Promise.all([
      fetchBothStrategies(url),
      detectServerGeo(url),
    ]);

    const siteInfoExtracted = extractSiteInfo(psiData);
    const wordpressContext = detectWordPressContext(psiData);

    const serverContext = {
      serverCountry,
      serverSoftware: siteInfoExtracted.serverSoftware,
      cdnDetected: siteInfoExtracted.cdnDetected,
      technologies: siteInfoExtracted.technologies,
      wordpressContext,
    };

    const auditResult = await translatePSIWithFallback(psiData, url, serverContext);

    if (scanId) {
      const { putScan } = await import("@/lib/scan-store");
      await putScan({ scanId, url, tier: "basic", audit: auditResult, createdAt: Date.now(), unlocked: true });
    }

    return NextResponse.json({ ...auditResult, scanId });
  } catch (err) {
    console.error("Audit error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Audit failed: ${message}` }, { status: 500 });
  }
}
