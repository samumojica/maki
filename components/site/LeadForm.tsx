"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BUDGETS, type LeadType } from "@/lib/services";
import { track } from "@/lib/analytics";

const field =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder-ink/35 outline-none focus:border-maki focus:ring-4 focus:ring-maki/15 transition";
const label = "block text-sm font-semibold text-ink mb-1.5";

export function LeadForm() {
  const params = useSearchParams();
  const [type, setType] = useState<LeadType>(params.get("type") === "build" ? "build" : "fix");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const scanId = params.get("scan") ?? "";
  const source = params.get("from") ?? "direct";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type, scanId, source }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      track("generate_lead", { lead_type: type, lead_source: source });
      setStatus("sent");
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-[28px] bg-mint p-8 sm:p-10 text-ink" role="status">
        <p className="font-display text-3xl font-extrabold">Got it — thanks!</p>
        <p className="mt-3 text-ink/70 text-lg">
          We&apos;ll review your {type === "fix" ? "site" : "project"} and reply within 1–2 business days with next
          steps and a quote.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative rounded-[28px] bg-white border border-ink/10 shadow-xl p-6 sm:p-10">
      <fieldset>
        <legend className={label}>What do you need?</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              { value: "fix", title: "Fix my site", sub: "I have a WordPress site that's slow" },
              { value: "build", title: "Build me a site", sub: "I don't have a website yet" },
            ] as const
          ).map((o) => (
            <label
              key={o.value}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-colors ${
                type === o.value ? "border-maki bg-maki/5" : "border-ink/10 hover:border-ink/25"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={o.value}
                checked={type === o.value}
                onChange={() => setType(o.value)}
                className="sr-only"
              />
              <span className="block font-display text-lg font-extrabold text-ink">{o.title}</span>
              <span className="block text-sm text-ink/60 mt-0.5">{o.sub}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div>
          <label htmlFor="lead-name" className={label}>Name</label>
          <input id="lead-name" name="name" required autoComplete="name" className={field} />
        </div>
        <div>
          <label htmlFor="lead-email" className={label}>Email</label>
          <input id="lead-email" name="email" type="email" required autoComplete="email" className={field} />
        </div>
      </div>

      {type === "fix" ? (
        <div className="mt-4">
          <label htmlFor="lead-website" className={label}>Your website</label>
          <input
            id="lead-website"
            name="website"
            required={!scanId}
            inputMode="url"
            placeholder={scanId ? "Taken from your Maki scan — or type another URL" : "yourwordpresssite.com"}
            className={field}
          />
          {scanId && <p className="mt-2 text-xs text-ink/50">Your Maki scan is attached, so we can quote faster.</p>}
        </div>
      ) : (
        <div className="mt-4">
          <label htmlFor="lead-business" className={label}>What&apos;s your business?</label>
          <input
            id="lead-business"
            name="businessType"
            placeholder="e.g. dental clinic, bakery, consulting"
            className={field}
          />
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="lead-budget" className={label}>Budget</label>
        <select id="lead-budget" name="budget" defaultValue="" className={field}>
          <option value="" disabled>
            Select a range
          </option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="lead-message" className={label}>
          {type === "fix" ? "What's going on with your site?" : "Tell us about the site you need"}
        </label>
        <textarea
          id="lead-message"
          name="message"
          required
          rows={4}
          placeholder={
            type === "fix"
              ? "e.g. Mobile score is 35, the homepage takes 6 seconds to load, we use Elementor + WP Rocket…"
              : "e.g. 5 pages, contact form, booking, need it live in a month…"
          }
          className={field}
        />
      </div>

      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>
          Company website
          <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-2xl bg-maki text-white font-bold text-lg py-4 hover:bg-maki-dark transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : type === "fix" ? "Get my quote →" : "Start my project →"}
      </button>
      <p className="mt-3 text-center text-xs text-ink/45">No spam. We reply within 1–2 business days.</p>
    </form>
  );
}
