"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { SchemaMarkup } from "./SchemaMarkup";
import { PrivacyModal, TermsModal } from "./LegalModals";
import { FAQ_ITEMS } from "@/lib/faq-data";

type Tier = "basic" | "pro";

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loading, setLoading] = useState<Tier | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

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
      document.getElementById("url-input")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("url-input")?.focus({ preventScroll: true });
      return;
    }

    const normalized =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    if (!validateUrl(normalized)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com).");
      document.getElementById("url-input")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("url-input")?.focus({ preventScroll: true });
      return;
    }

    setLoading(tier);
    setScanProgress(0);

    // Animate progress bar
    const interval = setInterval(() => {
      setScanProgress((p) => (p >= 90 ? 90 : p + Math.random() * 15));
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
      await new Promise((r) => setTimeout(r, 400));
      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      clearInterval(interval);
      setScanProgress(0);
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
            className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 hover:text-[#282f42] transition-colors shadow-sm"
          >
            Pricing
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-28">
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
            {loading ? (
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#268ad8] rounded-full animate-spin shrink-0" />
                  <span className="text-sm font-medium text-[#282f42]">
                    {scanProgress < 30 ? "Fetching PageSpeed data from Google…" : scanProgress < 60 ? "Analyzing your Core Web Vitals…" : scanProgress < 90 ? "Generating your tailored report…" : "Almost done…"}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#268ad8] h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">This usually takes 15–25 seconds</p>
              </div>
            ) : (
              <>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-[#e8f3fb] focus-within:border-[#268ad8] bg-white shadow-sm transition-all">
                  <span className="pl-5 text-gray-400 text-base select-none shrink-0">
                    https://
                  </span>
                  <input
                    id="url-input"
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
                    Audit my site →
                  </button>
                </div>
                {urlError && (
                  <p className="text-red-500 text-sm mt-2 text-left">{urlError}</p>
                )}
              </>
            )}
            <p className="text-xs text-gray-400 mt-4">
              Free scan · No account needed · Pay $9 only if you want the full fix list
            </p>
          </div>
        </div>

        {/* Mock preview dashboard */}
        <div className="max-w-4xl mx-auto mt-20 relative group">
          <img
            src="/mascot.png"
            alt="Maki Mascot"
            className="absolute -top-[120px] right-8 sm:right-16 w-32 sm:w-48 h-auto z-[9] -mr-[50px] transition-transform duration-500 group-hover:-translate-y-4"
          />
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden relative z-10">
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
          <div className="hidden sm:flex absolute -bottom-4 -right-4 items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-4 py-2 z-[11]">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs font-medium">Real Chrome user data</span>
          </div>
        </div>
      </section>

      {/* Powered by / Browser compatibility strip */}
      <section className="border-t border-gray-100 px-6 py-12 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered By</p>
            <div className="flex items-center gap-2 text-gray-600 font-semibold">
              <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 20 80 A 40 40 0 1 1 80 80" stroke="#EFF6FF" strokeWidth="14" strokeLinecap="round" />
                <path d="M 20 80 A 40 40 0 0 1 65 21" stroke="#0057E7" strokeWidth="14" strokeLinecap="round" />
                <path d="M 65 21 A 40 40 0 0 1 80 80" stroke="#A855F7" strokeWidth="14" strokeLinecap="round" />
                <path d="M 42 63 L 75 25 L 58 67 Z" fill="#38BDF8" />
                <circle cx="50" cy="65" r="14" fill="#38BDF8" />
                <circle cx="50" cy="65" r="6" fill="#0057E7" />
              </svg>
              PageSpeed Insights
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-gray-200" />
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Works with data from all major browsers</p>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/chrome/chrome-original.svg" alt="Chrome" className="w-5 h-5" />
                Chrome
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firefox/firefox-original.svg" alt="Firefox" className="w-5 h-5" />
                Firefox
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/safari/safari-original.svg" alt="Safari" className="w-5 h-5" />
                Safari
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opera/opera-original.svg" alt="Opera" className="w-5 h-5" />
                Opera
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What are Core Web Vitals? */}
      <section className="px-6 py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Understanding the metrics
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold max-w-2xl mx-auto leading-tight">
              What are Core Web Vitals?
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              Core Web Vitals are three metrics Google uses to measure how fast and smooth your website feels to real visitors. Since 2021, they directly affect your Google search ranking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                code: "LCP",
                name: "Largest Contentful Paint",
                desc: "How fast the biggest element loads. Think: your hero image or main heading appearing on screen.",
                good: "≤ 2.5s",
                poor: "> 4.0s",
                color: "#268ad8",
              },
              {
                code: "INP",
                name: "Interaction to Next Paint",
                desc: "How quickly your page responds when someone clicks, taps, or types. Slow INP = buttons feel frozen.",
                good: "≤ 200ms",
                poor: "> 500ms",
                color: "#16a34a",
              },
              {
                code: "CLS",
                name: "Cumulative Layout Shift",
                desc: "How much stuff jumps around as the page loads. High CLS = visitors accidentally click the wrong thing.",
                good: "≤ 0.1",
                poor: "> 0.25",
                color: "#d97706",
              },
            ].map((metric) => (
              <div key={metric.code} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: metric.color }}
                  >
                    {metric.code}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#282f42]">{metric.name}</p>
                    <p className="text-[10px] font-mono text-gray-400">{metric.code}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{metric.desc}</p>
                <div className="flex gap-2">
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1 font-medium">
                    Good: {metric.good}
                  </span>
                  <span className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-1 font-medium">
                    Poor: {metric.poor}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Failing these metrics means Google may rank your site lower — and visitors bounce before they see your content.{" "}
              <strong className="text-[#282f42]">Maki tells you exactly how to fix them.</strong>
            </p>
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


      {/* Why not GTmetrix / DebugBear? */}
      <section className="bg-white border-b border-gray-100 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-[#268ad8] uppercase tracking-widest mb-3">
              The alternative
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl mx-auto leading-tight text-[#282f42]">
              Skip the accounts, caps, and monthly fees.
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
              Most performance tools force you to create an account, limit your free scans, or charge monthly. Maki doesn&apos;t.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-4 text-xs sm:text-sm md:text-base">
              {/* Header */}
              <div className="p-3 sm:p-5 md:p-6 font-semibold text-gray-400 border-b border-r border-gray-100 bg-gray-50 flex items-center">Feature</div>
              <div className="p-3 sm:p-5 md:p-6 font-semibold text-gray-500 text-center border-b border-r border-gray-100 bg-gray-50 flex items-center justify-center">GTmetrix</div>
              <div className="p-3 sm:p-5 md:p-6 font-semibold text-gray-500 text-center border-b border-r border-gray-100 bg-gray-50 flex items-center justify-center">DebugBear</div>
              <div className="p-3 sm:p-5 md:p-6 font-bold text-white text-center border-b bg-[#282f42] flex items-center justify-center">Maki</div>

              {/* Rows */}
              {[
                { label: "Account required", gt: "Yes", db: "Yes", mk: "No", good: true },
                { label: "Payment model", gt: "Subscription", db: "Subscription", mk: "Pay per report", good: true },
                { label: "Cost", gt: "$14.95+/mo", db: "$19+/mo", mk: "$9 once", good: true },
                { label: "Tailored fixes", gt: "No", db: "Limited", mk: "Yes", good: true },
                { label: "Instant PDF", gt: "No", db: "No", mk: "Yes", good: true },
              ].map((row, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <React.Fragment key={i}>
                    <div className={`p-3 sm:p-4 md:p-6 text-gray-700 font-medium border-r border-gray-100 flex items-center ${!isLast ? 'border-b' : ''}`}>{row.label}</div>
                    <div className={`p-3 sm:p-4 md:p-6 text-gray-500 text-center border-r border-gray-100 flex items-center justify-center ${!isLast ? 'border-b' : ''}`}>{row.gt}</div>
                    <div className={`p-3 sm:p-4 md:p-6 text-gray-500 text-center border-r border-gray-100 flex items-center justify-center ${!isLast ? 'border-b' : ''}`}>{row.db}</div>
                    <div className={`p-3 sm:p-4 md:p-6 text-[#268ad8] text-center font-bold bg-[#e8f3fb] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${!isLast ? 'border-b border-[#d1e7f6]' : ''}`}>
                      {row.mk}
                      {row.good && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#268ad8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-gray-100 bg-gray-50 px-6 py-24 overflow-hidden relative group"
      >
        {/* Celebrate mascot */}
        <img
          src="/celebrate.png"
          alt="Celebrate Mascot"
          className="absolute top-[324px] left-[114px] w-[476px] h-auto z-[9] transition-transform duration-500 group-hover:-rotate-2 group-hover:-translate-y-2 pointer-events-none opacity-100 hidden md:block"
        />

        <div className="max-w-4xl mx-auto relative z-10">
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

          <div className="max-w-md mx-auto relative z-10">
            {/* Single Tier */}
            <div className="bg-[#282f42] text-white border border-[#1e2435] rounded-3xl p-8 flex flex-col shadow-2xl relative ring-4 ring-[#268ad8]/20 z-10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#268ad8] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                Full Report
              </span>
              <div className="mb-8 mt-2 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-extrabold tracking-tight text-white">$9</span>
                  <span className="text-gray-400 font-medium">/ once</span>
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Everything you need to fix your Core Web Vitals
                </p>
              </div>
              <ul className="text-sm text-gray-200 space-y-4 mb-8 flex-1 px-4">
                {[
                  "Complete performance audit",
                  "LCP, INP, CLS + Lighthouse scores",
                  "Top 7 ranked fixes with code snippets",
                  "Technology & server detection",
                  "Plugin links & resource guides",
                  "SEO snippets (copy-paste ready)",
                  "Quick win (under 10 min)",
                  "Instant PDF download",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[#268ad8] shrink-0"
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
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleScan("basic")}
                disabled={loading !== null}
                className="w-full py-4 rounded-xl bg-[#268ad8] text-white text-base font-bold hover:bg-[#1e6fb0] transition-colors disabled:opacity-60 shadow-lg shadow-[#268ad8]/30"
              >
                {loading === "basic" ? "Scanning…" : "Audit my site now"}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-4 opacity-80">
                <span className="text-xs text-gray-400">Secure checkout via</span>
                <span className="font-bold tracking-tight italic text-[#635BFF] text-[15px] font-sans">stripe</span>
              </div>
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
            {FAQ_ITEMS.map((item, i) => (
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

      {/* No fuss strip */}
      <section className="px-6 py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
              label: "No account", sub: "Zero signup required"
            },
            {
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>,
              label: "No login", sub: "Just paste your URL"
            },
            {
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
              label: "One-time $9", sub: "No subscription ever"
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#268ad8] text-white flex items-center justify-center mb-1 shadow-sm">
                {item.icon}
              </div>
              <div>
                <p className="text-base font-bold text-[#282f42]">{item.label}</p>
                <p className="text-sm text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
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
      <footer className="border-t border-[#1e2435] bg-[#282f42] text-gray-500 px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-auto" color="white" />
              <span className="text-sm font-medium text-white hidden">Maki</span>
            </div>
            <span className="text-xs text-gray-400 max-w-sm">
              Instant Core Web Vitals audits and tailored performance reports.
            </span>
            <span className="text-[10px] text-gray-500 max-w-sm mt-4">
              Not affiliated with, endorsed by, or associated with Google or Alphabet Inc.
            </span>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <h4 className="text-white font-semibold mb-1">Product</h4>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="https://developers.google.com/speed/docs/insights/v5/about" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">PageSpeed Insights API</a>
            <a href="https://web.dev/vitals/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">About Core Web Vitals</a>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <h4 className="text-white font-semibold mb-1">Legal & Contact</h4>
            <button
              onClick={() => setPrivacyOpen(true)}
              className="text-left hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setTermsOpen(true)}
              className="text-left hover:text-white transition-colors"
            >
              Terms & Conditions
            </button>
            <a
              href="mailto:support@getmaki.app"
              className="hover:text-white transition-colors"
            >
              support@getmaki.app
            </a>

          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <span>© {new Date().getFullYear()} Maki. All rights reserved.</span>
          <div className="flex gap-4">
            {/* Backlinks for SEO */}
            <a href="https://getmaki.app" className="hover:text-white transition-colors">Core Web Vitals Checker</a>
            <a href="https://getmaki.app" className="hover:text-white transition-colors">PageSpeed Report</a>
            <a href="https://getmaki.app" className="hover:text-white transition-colors">GTmetrix Alternative</a>
          </div>
        </div>
      </footer>

      {/* Modals & Schema */}
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
      <SchemaMarkup />
    </main>
  );
}
