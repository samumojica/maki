"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

type Tier = "basic" | "pro";

function validateUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function ScanForm({ tone = "dark", id = "url-input" }: { tone?: "dark" | "light"; id?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const dark = tone === "dark";

  async function handleScan(tier: Tier) {
    setUrlError("");

    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter a website URL.");
      document.getElementById(id)?.focus();
      return;
    }

    const normalized =
      trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;

    if (!validateUrl(normalized)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com).");
      document.getElementById(id)?.focus();
      return;
    }

    setLoading(true);
    setScanProgress(0);
    track("scan_started", { form_location: id });

    const interval = setInterval(() => {
      setScanProgress((p) => (p >= 90 ? 90 : p + Math.random() * 3.5));
    }, 600);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, tier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");

      clearInterval(interval);
      setScanProgress(100);
      track("scan_completed", { form_location: id });
      await new Promise((r) => setTimeout(r, 400));
      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      clearInterval(interval);
      setScanProgress(0);
      console.error(err);
      track("scan_failed", { form_location: id, error_message: String((err as Error).message).slice(0, 100) });
      setUrlError((err as Error).message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        className={`rounded-2xl p-5 bg-white text-ink text-left ${
          dark ? "shadow-[0_20px_60px_-15px_rgba(158,225,154,0.35)]" : "border-2 border-ink"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 border-2 border-maki/20 border-t-maki rounded-full animate-spin shrink-0" />
          <span className="text-sm font-medium">
            {scanProgress < 30
              ? "Fetching PageSpeed data from Google…"
              : scanProgress < 60
                ? "Detecting your WordPress setup…"
                : scanProgress < 90
                  ? "Identifying performance problems…"
                  : "Almost done…"}
          </span>
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden bg-ink/10">
          <div
            className="bg-maki h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${scanProgress}%` }}
          />
        </div>
        <p className="text-xs mt-2 text-ink/55">This usually takes about a minute</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleScan("basic");
      }}
    >
      <label htmlFor={id} className="sr-only">
        Your WordPress site URL
      </label>
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 rounded-2xl p-2 transition-all ${
          dark
            ? "bg-white shadow-[0_20px_60px_-15px_rgba(158,225,154,0.35)] focus-within:ring-4 focus-within:ring-mint/40"
            : "bg-white border-2 border-ink focus-within:ring-4 focus-within:ring-maki/20"
        }`}
      >
        <span className="hidden sm:inline pl-4 text-ink/40 text-base select-none shrink-0">https://</span>
        <input
          id={id}
          type="text"
          inputMode="url"
          autoComplete="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setUrlError("");
          }}
          placeholder="yourwordpresssite.com"
          className="flex-1 min-w-0 py-3 px-3 sm:px-1 text-ink placeholder-ink/35 outline-none text-base bg-transparent"
        />
        <button
          type="submit"
          className="px-6 py-3.5 rounded-xl bg-maki text-white text-base font-bold hover:bg-maki-dark transition-colors shrink-0"
        >
          Scan my site free →
        </button>
      </div>
      {urlError && (
        <p className={`text-sm mt-2 text-left ${dark ? "text-red-300" : "text-red-600"}`} role="alert">
          {urlError}
        </p>
      )}
    </form>
  );
}
