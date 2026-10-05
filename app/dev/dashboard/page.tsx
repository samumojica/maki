import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { buildMockAudit } from "@/lib/dev/mock-audit";

// Development-only preview of the paid dashboard. No Stripe, no Firestore.

export const metadata: Metadata = {
  title: "Dashboard preview (dev)",
  robots: { index: false, follow: false },
};

export default function DashboardPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Dashboard audit={buildMockAudit()} scanId="dev-preview" initialRetests={[]} />;
}
