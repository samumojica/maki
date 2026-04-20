"use client";

import { useState } from "react";
import type { Tier } from "@/lib/types";

const PRICE_LABEL: Record<Tier, string> = {
  basic: "$9",
  pro: "$29",
};

export default function UnlockButton({
  scanId,
  tier,
}: {
  scanId: string;
  tier: Tier;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="w-full bg-[#268ad8] text-white px-6 py-5 rounded-full text-lg font-semibold hover:bg-[#1e6fb0] transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Redirecting to checkout..."
          : `Unlock full report — ${PRICE_LABEL[tier]}`}
      </button>
      {error && (
        <p className="text-center text-sm text-red-600 mt-3">{error}</p>
      )}
    </>
  );
}
