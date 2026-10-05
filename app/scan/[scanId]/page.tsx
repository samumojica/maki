import type { Metadata } from "next";
import { getScan } from "@/lib/scan-store";
import { ScanExpired, ScanResultsView } from "@/components/scan/ScanResultsView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your scan results",
  robots: { index: false, follow: false },
};

export default async function ScanTeaserPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const entry = await getScan(scanId);

  if (!entry) return <ScanExpired />;
  return <ScanResultsView audit={entry.audit} scanId={scanId} />;
}
