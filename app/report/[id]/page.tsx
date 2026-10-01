import { getScan } from "@/lib/scan-store";
import ResultsPage from "@/components/ResultsPage";
import Dashboard from "@/components/Dashboard";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your WordPress Performance Plan | Maki",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getScan(id);

  if (!entry) {
    notFound();
  }

  if (!entry.unlocked) {
    // Redirect to the free scan page where they can unlock it
    redirect(`/scan/${id}`);
  }

  if (entry.audit.structuredFixes && entry.audit.structuredFixes.length >= 0 && entry.audit.siteInfo?.wordpressContext?.eligible) {
    return <Dashboard audit={entry.audit} scanId={id} initialRetests={entry.retests || []} />;
  }

  // Legacy fallback
  return <ResultsPage audit={entry.audit} />;
}
