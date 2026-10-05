import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScanResultsView } from "@/components/scan/ScanResultsView";
import { buildMockAudit } from "@/lib/dev/mock-audit";

// Development-only preview of the free scan results page. No Firestore.
export const metadata: Metadata = {
  title: "Scan results preview (dev)",
  robots: { index: false, follow: false },
};

export default function ScanPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ScanResultsView audit={buildMockAudit()} scanId="dev-preview" />;
}
