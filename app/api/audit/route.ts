import { NextRequest, NextResponse } from "next/server";
import type { AuditRequest } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const [{ stripe }, { getScan, deleteScan }] = await Promise.all([
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
      const entry = getScan(scanId);
      if (entry) {
        console.log(`[audit] scan-store hit for ${scanId}`);
        deleteScan(scanId);
        return NextResponse.json(entry.audit);
      }
      console.log(`[audit] scan-store miss for ${scanId}, falling back to re-scan`);
    }

    if (!url) {
      return NextResponse.json({ error: "No URL found in session" }, { status: 400 });
    }

    const { fetchBothStrategies } = await import("@/lib/psi-client");
    const { translatePSIWithFallback } = await import("@/lib/gemini-client");

    const psiData = await fetchBothStrategies(url);
    const auditResult = await translatePSIWithFallback(psiData, url);

    return NextResponse.json(auditResult);
  } catch (err) {
    console.error("Audit error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Audit failed: ${message}` }, { status: 500 });
  }
}
