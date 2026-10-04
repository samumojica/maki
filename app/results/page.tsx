"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import ResultsPage from "@/components/ResultsPage";
import { AuditResult } from "@/lib/types";
import { FIX_PLAN_ITEM, track } from "@/lib/analytics";

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found. Please complete a purchase first.");
      return;
    }

    async function runAudit() {
      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Audit failed");
        }

        // Payment verified by /api/audit. GA4 de-duplicates purchases by transaction_id,
        // so a reload of this page won't double count.
        track("purchase", {
          transaction_id: sessionId,
          currency: "USD",
          value: FIX_PLAN_ITEM.price,
          items: [FIX_PLAN_ITEM],
        });

        if (data.scanId) {
          // Give gtag a moment to send the purchase before navigating away
          await new Promise((r) => setTimeout(r, 300));
          // Redirect to the clean permanent URL
          window.location.href = `/report/${data.scanId}`;
        } else {
          setAudit(data);
        }
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please contact support."
        );
      }
    }

    runAudit();
  }, [sessionId]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[#282f42] mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-[#268ad8] text-white text-sm font-medium rounded-lg hover:bg-[#1e6fb0] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!audit) {
    return <LoadingScreen />;
  }

  return <ResultsPage audit={audit} />;
}

export default function Results() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResultsContent />
    </Suspense>
  );
}
