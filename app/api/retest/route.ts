import { NextResponse } from "next/server";
import { getScan, addRetestToScan } from "@/lib/scan-store";
import { fetchBothStrategies } from "@/lib/psi-client";
import { extractRetestMetrics } from "@/lib/retest-utils";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scanId } = body;

    if (!scanId) {
      return NextResponse.json({ error: "Missing scanId" }, { status: 400 });
    }

    const scan = await getScan(scanId);

    if (!scan) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (!scan.unlocked) {
      return NextResponse.json({ error: "Report is not unlocked" }, { status: 403 });
    }

    if (scan.audit.siteInfo?.wordpressContext?.eligible === false) {
      return NextResponse.json({ error: "Site is not eligible for WordPress re-testing" }, { status: 400 });
    }

    // Cooldown check (60 seconds)
    if (scan.retests && scan.retests.length > 0) {
      const lastRetest = scan.retests[scan.retests.length - 1];
      const now = Date.now();
      if (now - lastRetest.createdAt < 60 * 1000) {
        return NextResponse.json({ error: "Please wait a moment before running another test." }, { status: 429 });
      }
    }

    // Run PSI
    // We use mobile only to save time, or both if needed. The Dashboard relies on mobileScore.
    // fetchBothStrategies fetches both, which is fine since legacy PSI client does this.
    const psiData = await fetchBothStrategies(scan.url);

    // Extract
    const metrics = extractRetestMetrics(psiData);

    const retestRecord = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...metrics
    };

    // Save
    await addRetestToScan(scanId, retestRecord);

    return NextResponse.json(retestRecord);
  } catch (error: any) {
    console.error("Retest error:", error);
    return NextResponse.json({ error: "Failed to run re-test" }, { status: 500 });
  }
}
