"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { SchemaMarkup } from "./SchemaMarkup";
import { PrivacyModal, TermsModal } from "./LegalModals";

type Tier = "basic" | "pro";

const FAQ_ITEMS = [
  {
    q: "Is the scan really free?",
    a: "Yes. You can see your PageSpeed results and detected issues before paying."
  },
  {
    q: "What do I get for $9?",
    a: "The full interactive WordPress fix plan with exact remediation steps, progress tracking, and manual re-testing."
  },
  {
    q: "Does Maki change my WordPress site?",
    a: "No. Maki tells you exactly what to change; you remain in control."
  },
  {
    q: "Do I need to install a plugin?",
    a: "No. Maki analyzes your site from the outside using Google PageSpeed Insights and identifies your current setup."
  },
  {
    q: "What if Maki can't detect WordPress?",
    a: "You can still see the free performance results, but the paid WordPress fix plan will not be offered."
  },
  {
    q: "Is this a subscription?",
    a: "No. $9 one-time."
  },
  {
    q: "Does this guarantee a higher Google ranking?",
    a: "No. Maki focuses on improving site performance and Core Web Vitals. Search rankings depend on many factors, but faster sites create a better experience for visitors."
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loading, setLoading] = useState<Tier | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    console.log("Maki v1.1.1 - " + new Date().toISOString());
  }, []);

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
      <header className="px-6 py-4 bg-[#f3fbff]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
          </div>
          <a
            href="#pricing"
            className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 hover:text-[#282f42] transition-colors"
          >
            Pricing
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-28 bg-[#f3fbff]">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow badge */}
          {/*
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white mb-8">
            <span className="relative flex items-center justify-center">
              <span className="absolute w-3 h-3 bg-green-500 rounded-full opacity-60 animate-ping" />
              <span className="relative w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_2px_rgba(34,197,94,0.7)]" />
            </span>
            <span className="text-xs font-medium text-gray-700">
              Live data from Google PageSpeed Insights
            </span>
          </div>
          */}

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            Fix what&apos;s slowing down your
            <br className="hidden sm:block" />
            {" "}
            <span className="whitespace-nowrap">
              <span className="relative inline-block mt-2">
                <img src="/sprinkles.png" alt="" className="absolute -top-6 -right-6 w-12 h-12 pointer-events-none select-none opacity-80" aria-hidden="true" />
                <span className="text-[#c84367]">WordPress</span>
              </span>{" "}
              site.
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-[720px] mx-auto mb-10 leading-relaxed">
            Paste your URL. Maki scans your site with Google PageSpeed Insights, detects your WordPress setup when possible, and shows you what to fix first.
          </p>

          {/* URL Input + CTA */}
          <div className="w-full max-w-xl mx-auto">
            {loading ? (
              <div className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#268ad8] rounded-full animate-spin shrink-0" />
                  <span className="text-sm font-medium text-[#282f42]">
                    {scanProgress < 30 ? "Fetching PageSpeed data from Google…" : scanProgress < 60 ? "Detecting WordPress setup…" : scanProgress < 90 ? "Identifying performance problems…" : "Almost done…"}
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
                <div className="flex flex-col sm:flex-row sm:items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-[#e8f3fb] focus-within:border-[#268ad8] bg-white transition-all">
                  <span className="hidden sm:inline pl-5 text-gray-400 text-base select-none shrink-0">
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
                    placeholder="yourwordpresssite.com"
                    className="flex-1 py-4 px-4 sm:px-2 text-[#282f42] placeholder-gray-400 outline-none text-base"
                    onKeyDown={(e) => e.key === "Enter" && handleScan("basic")}
                  />
                  <button
                    onClick={() => handleScan("basic")}
                    disabled={loading !== null}
                    className="m-1.5 px-6 py-3 sm:py-2.5 rounded-lg bg-[#268ad8] text-white text-sm font-semibold hover:bg-[#1e6fb0] transition-colors disabled:opacity-60 shrink-0"
                  >
                    Scan my site →
                  </button>
                </div>
                {urlError && (
                  <p className="text-red-500 text-sm mt-2 text-left">{urlError}</p>
                )}
              </>
            )}
            <p className="text-xs text-gray-400 mt-4">
              Free scan · No account needed · Pay $9 only if you want the full fix plan
            </p>
            <p className="text-sm text-gray-500 mt-3 font-medium">
              ⭐ Trusted by 1,200+ developers and site owners
            </p>
          </div>
        </div>

        {/* Mock preview dashboard */}
        <div className="max-w-4xl mx-auto mt-[111px] relative group">
          <img
            src="/mascot.png"
            alt="Maki Mascot"
            className="absolute -top-[82px] left-0 right-0 mx-auto sm:left-0 sm:right-auto sm:ml-[20px] sm:-top-[130px] w-32 sm:w-48 h-auto z-[9] transition-transform duration-500 group-hover:-translate-y-4"
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
                    yourwordpresssite.com
                  </p>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Performance Report
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#268ad8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 ml-2 relative -top-0.5">WordPress detected</span>
                  </h3>
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
                    <p className={`text-[18px] font-bold ${m.color}`}>{m.value}</p>
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
                      Your hero image is lazy-loaded
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your visitors see a blank page for 2.3 extra seconds.
                      Open WordPress Admin → Settings → <span className="font-medium text-[#282f42]">Perfmatters</span> → Lazy Load and exclude <span className="font-mono bg-gray-100 border px-1 rounded">hero-home.webp</span>.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 shrink-0">
                    −2.3s
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
      <section className="px-6 py-12 bg-white">
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compatible with</p>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg" alt="WordPress" className="w-5 h-5 opacity-70 grayscale" />
                WordPress
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#c84367] uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Find your fixes in 30 seconds.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                n: "01",
                title: "Scan your WordPress site",
                desc: "Paste your URL. Maki runs a fresh PageSpeed test and identifies your theme and plugins.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
              },
              {
                n: "02",
                title: "See what's slowing it down",
                desc: "We pinpoint the specific resources hurting your performance score.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                n: "03",
                title: "Unlock your exact fix plan",
                desc: "For $9 one-time, get prioritized instructions specifically for your WordPress setup.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
              },
              {
                n: "04",
                title: "Fix and re-test",
                desc: "Apply the changes, mark fixes complete, and run a fresh test to compare before vs. after.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
              }
            ].map((step) => (
              <div
                key={step.n}
                className="relative border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-colors"
              >
                <span className="text-sm font-bold text-gray-400 mb-4 block">
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

      {/* Why Maki is different */}
      <section className="px-6 py-24 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#268ad8] uppercase tracking-widest mb-3">
              Why Maki is different
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold max-w-2xl mx-auto">
              We tell you <span className="text-[#c84367]">exactly</span> what to do.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="text-3xl mb-4 grayscale opacity-60">🕵️‍♂️</div>
              <h3 className="font-bold text-lg mb-2 text-gray-600">Generic tools tell you what's wrong</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                "Reduce unused JavaScript."
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                You are left to figure out which plugin is causing the issue and how to disable it safely without breaking your site.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="font-bold text-lg mb-2 text-[#282f42]">Maki tells you how to fix it</h3>
              <p className="text-[#282f42] font-medium text-sm leading-relaxed mb-4">
                "Perfmatters is detected. Review Script Manager and unload this specific asset."
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                When Maki detects your setup, it gives you exact steps for the tools you already have installed. You get a clear path forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="bg-[#f3fbff] px-6 py-24 overflow-hidden relative group"
      >
        {/* Celebrate mascot */}
        <img
          src="/celebrate.png"
          alt="Celebrate Mascot"
          className="absolute top-[394px] left-[114px] w-[476px] h-auto z-[9] transition-transform duration-500 group-hover:-rotate-2 group-hover:-translate-y-2 pointer-events-none opacity-100 hidden md:block"
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#c84367] uppercase tracking-widest mb-3">
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
            <div className="bg-[#282f42] text-white rounded-3xl p-8 flex flex-col relative z-10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c84367] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm whitespace-nowrap">
                WordPress Fix Plan
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
                  "Prioritized WordPress fixes",
                  "Plugin & theme-specific instructions",
                  "Affected resources pinpointed",
                  "Progress checklist",
                  "Manual re-tests",
                  "Before / after comparison"
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[#c84367] shrink-0"
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
                className="w-full py-4 rounded-xl bg-[#268ad8] text-white text-base font-bold hover:bg-[#1e6fb0] transition-colors disabled:opacity-60"
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
            No account. No subscription. Just clear WordPress fixes.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#268ad8] uppercase tracking-widest mb-3">
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
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none focus:outline-none">
                  <span className="font-medium text-[#282f42]">{item.q}</span>
                  <svg
                    className="w-4 h-4 text-[#c84367] transition-transform group-open:rotate-180"
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

      {/* Final CTA Redesign */}
      <section className="px-6 py-28 bg-[#F9FAFB] text-[#282f42] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            Ready to see your <span className="text-[#c84367]">WordPress</span> fixes?
          </h2>
          <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto">
            Get your PageSpeed fixes in plain English. No accounts, no waiting, just results.
          </p>

          <div className="flex flex-col items-center gap-10">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => {
                  document.querySelector("input")?.focus();
                }, 500);
              }}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-[#268ad8] text-white rounded-2xl text-lg font-bold hover:bg-[#1e6fb0] transition-all"
            >
              Audit my site now
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
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

            {/* Redesigned No-fuss badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl mt-4">
              {[
                {
                  label: "No account", sub: "Zero signup required"
                },
                {
                  label: "No login", sub: "Just paste your URL"
                },
                {
                  label: "One-time $9", sub: "No subscription ever"
                },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-base font-bold text-[#282f42] mb-1">{item.label}</p>
                  <p className="text-xs text-gray-500 font-medium">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
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
              WordPress performance fixer and tailored repair instructions.
            </span>
            <span className="text-[10px] text-gray-500 max-w-sm mt-4">
              Not affiliated with, endorsed by, or associated with Google or WordPress.
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
            <a href="https://getmaki.app" className="hover:text-white transition-colors">WordPress Performance Fixer</a>
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
