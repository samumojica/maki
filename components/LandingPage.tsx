"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";

type Tier = "basic" | "pro";

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loading, setLoading] = useState<Tier | null>(null);

  function validateUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }

  async function handleScan(tier: Tier) {
    setUrlError("");

    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter a website URL.");
      return;
    }

    const normalized =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    if (!validateUrl(normalized)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com).");
      return;
    }

    setLoading(tier);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, tier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");

      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      console.error(err);
      setUrlError((err as Error).message || "Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col text-[#282f42]">
      {/* Nav */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
          </div>
          <a
            href="#pricing"
            className="text-sm text-gray-600 hover:text-[#282f42] transition-colors"
          >
            Pricing
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-28">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white mb-8">
            <span className="relative flex items-center justify-center">
              <span className="absolute w-3 h-3 bg-green-500 rounded-full opacity-60 animate-ping" />
              <span className="relative w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_2px_rgba(34,197,94,0.7)]" />
            </span>
            <span className="text-xs font-medium text-gray-700">
              Live data from Google PageSpeed Insights
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            Your site&apos;s real
            <br />
            performance score.
            <br />
            <span className="text-[#268ad8]">Explained like a human.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            We pull your Core Web Vitals straight from Google&apos;s servers and
            translate them into fixes your developer — or you — can actually
            apply today.
          </p>

          {/* URL Input + CTA */}
          <div className="w-full max-w-xl mx-auto">
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-[#e8f3fb] focus-within:border-[#268ad8] bg-white shadow-sm transition-all">
              <span className="pl-5 text-gray-400 text-base select-none shrink-0">
                https://
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError("");
                }}
                placeholder="yourwebsite.com"
                className="flex-1 py-4 px-2 text-[#282f42] placeholder-gray-400 outline-none text-base"
                onKeyDown={(e) => e.key === "Enter" && handleScan("basic")}
              />
              <button
                onClick={() => handleScan("basic")}
                disabled={loading !== null}
                className="m-1.5 px-6 py-2.5 rounded-lg bg-[#268ad8] text-white text-sm font-semibold hover:bg-[#1e6fb0] transition-colors disabled:opacity-60 shrink-0"
              >
                {loading === "basic" ? "Scanning…" : "Audit my site →"}
              </button>
            </div>
            {urlError && (
              <p className="text-red-500 text-sm mt-2 text-left">{urlError}</p>
            )}
            <p className="text-xs text-gray-400 mt-4">
              Free scan · See your verdict first · Pay $9 only if you want the full fix list
            </p>
          </div>
        </div>

        {/* Mock preview dashboard */}
        <div className="max-w-4xl mx-auto mt-20 relative">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Browser chrome */}
            <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-2 bg-gray-50">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="w-3 h-3 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                getmaki.app/results
              </div>
            </div>

            {/* Mock report */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    yourwebsite.com
                  </p>
                  <h3 className="text-xl font-bold">Performance Report</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Needs Work
                </span>
              </div>

              {/* CWV metrics preview */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "LCP", value: "4.2s", status: "fail", color: "text-red-600" },
                  { label: "INP", value: "320ms", status: "fail", color: "text-red-600" },
                  { label: "CLS", value: "0.05", status: "pass", color: "text-green-600" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        {m.label}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${m.status === "pass" ? "bg-green-500" : "bg-red-500"
                          }`}
                      />
                    </div>
                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Mock fix card */}
              <div className="mt-4 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#268ad8] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">
                      Hero image is loading too slowly
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your visitors see a blank page for 2.3 extra seconds.
                      Install <span className="font-medium text-[#282f42]">Smush</span> or{" "}
                      <span className="font-medium text-[#282f42]">ShortPixel</span>{" "}
                      to compress it down from 850KB to ~120KB.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 shrink-0">
                    −1.5s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="hidden sm:flex absolute -bottom-4 -right-4 items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs font-medium">Real Chrome user data</span>
          </div>
        </div>
      </section>

      {/* AI can't do this */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              The honest truth
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold max-w-2xl mx-auto leading-tight">
              ChatGPT, Claude, and Gemini can&apos;t do this.
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              We know because we tried. Here&apos;s what happens when you ask
              them for your site&apos;s real performance score:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* ChatGPT fake response */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#268ad8] flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-[#268ad8]">
                  ChatGPT / Claude / Gemini
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
                <p className="bg-gray-50 border border-gray-100 rounded-lg p-3 italic">
                  &ldquo;I&apos;m sorry, I can&apos;t browse the web or access
                  real-time performance data. You&apos;ll need to check
                  PageSpeed Insights manually…&rdquo;
                </p>
                <p className="text-xs text-gray-400 pt-2">
                  Or worse — they hallucinate scores that look real but
                  aren&apos;t.
                </p>
              </div>
            </div>

            {/* Our real response */}
            <div className="bg-[#282f42] text-white rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold">Maki</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-gray-300 mb-2">
                    Pulled from Google&apos;s servers just now:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-400">LCP</p>
                      <p className="font-bold text-red-400">4.2s</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">INP</p>
                      <p className="font-bold text-red-400">320ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">CLS</p>
                      <p className="font-bold text-green-400">0.05</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 pt-2">
                  Measured from real Chrome users, not guessed.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-10 max-w-xl mx-auto">
            We&apos;re the bridge: we pull the official Google data, then use AI
            to translate it into plain English fixes. The best of both.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-100 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              From URL to PDF in 30 seconds.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Enter your URL",
                desc: "We fetch your real performance data directly from Google PageSpeed Insights.",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                ),
              },
              {
                n: "02",
                title: "Pay $9 once",
                desc: "Secure checkout via Stripe. No recurring charges. No account needed. Ever.",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                ),
              },
              {
                n: "03",
                title: "Download your PDF",
                desc: "Plain-English fixes ranked by impact. Hand it to your dev, or DIY in 10 minutes.",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                ),
              },
            ].map((step) => (
              <div
                key={step.n}
                className="relative border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-colors"
              >
                <span className="text-xs font-bold text-gray-300 mb-4 block">
                  {step.n}
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#268ad8] text-white flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-base mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-gray-100 bg-gray-50 px-6 py-24"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              One-time payment. No subscription.
            </h2>
            <p className="text-gray-500 mt-4">
              Pay for what you need. Nothing more.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Basic */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 mb-2">
                  Basic
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">$9</span>
                  <span className="text-gray-400">/ once</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Perfect for a single site audit
                </p>
              </div>
              <ul className="text-sm text-gray-700 space-y-3 mb-8 flex-1">
                {[
                  "1 URL audited",
                  "LCP, INP, CLS scores",
                  "Top 5 ranked fixes",
                  "Quick win (under 10 min)",
                  "Downloadable PDF report",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-green-600 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleScan("basic")}
                disabled={loading !== null}
                className="w-full py-3 rounded-xl bg-white border border-[#268ad8] text-[#268ad8] text-sm font-semibold hover:bg-[#e8f3fb] transition-colors disabled:opacity-60"
              >
                {loading === "basic" ? "Scanning…" : "Get Basic — $9"}
              </button>
            </div>

            {/* Pro */}
            <div className="bg-[#282f42] text-white rounded-2xl p-8 flex flex-col relative ring-4 ring-[#268ad8]/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Best value
              </span>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-400 mb-2">Pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">$29</span>
                  <span className="text-gray-500">/ once</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  For agencies & multi-page sites
                </p>
              </div>
              <ul className="text-sm text-gray-200 space-y-3 mb-8 flex-1">
                {[
                  "5 URLs audited",
                  "Everything in Basic",
                  "Mobile + Desktop scores",
                  "Compare pages side-by-side",
                  "Priority data refresh",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-green-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleScan("pro")}
                disabled={loading !== null}
                className="w-full py-3 rounded-xl bg-[#268ad8] text-white text-sm font-semibold hover:bg-[#1e6fb0] transition-colors disabled:opacity-60"
              >
                {loading === "pro" ? "Scanning…" : "Get Pro — $29"}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-10">
            No account. No subscription. No email required. Just a PDF.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Questions
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">Good to know.</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How is this different from running PageSpeed Insights myself?",
                a: "PSI gives you a wall of technical jargon. We translate it into ranked, actionable fixes — with exact plugin names, settings, and steps. Ready for you or your developer.",
              },
              {
                q: "Do I need a WordPress site?",
                a: "No. This works for any website — WordPress, Shopify, Webflow, custom code, whatever. The fixes are tailored to your stack.",
              },
              {
                q: "Will this actually improve my Google ranking?",
                a: "Core Web Vitals are a confirmed Google ranking signal. Fixing them won't guarantee a ranking boost, but failing them definitely hurts. This report tells you exactly what to fix first.",
              },
              {
                q: "What if the report doesn't help me?",
                a: "Email us within 7 days and we'll refund you, no questions asked.",
              },
              {
                q: "Do you store my data?",
                a: "No. We don't keep your URL, report, or any personal info. Once you download the PDF, it's gone from our end.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-xl bg-white"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <span className="font-medium text-[#282f42]">{item.q}</span>
                  <svg
                    className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-100 px-6 py-24 bg-[#282f42] text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ready to see your real score?
          </h2>
          <p className="text-gray-400 mb-8">
            Enter your URL above — PDF in your hands in 30 seconds.
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => {
                document.querySelector("input")?.focus();
              }, 500);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#268ad8] text-white rounded-xl text-sm font-semibold hover:bg-[#1e6fb0] transition-colors"
          >
            Audit my site
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e2435] bg-[#282f42] text-gray-500 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-auto" color="white" />
            <span className="text-xs">
              © {new Date().getFullYear()} Maki
            </span>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms
            </a>
            <a
              href="mailto:hello@getmaki.app"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
