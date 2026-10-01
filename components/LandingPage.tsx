"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import Image from "next/image";
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
    q: "Does Maki work with Shopify, Webflow, or Squarespace?",
    a: "Maki V1 is currently focused specifically on WordPress."
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
    console.log("Maki v1.1.0 - " + new Date().toISOString());
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
    <main className="min-h-screen bg-white flex flex-col text-[#282f42] font-sans">
      {/* Nav */}
      <header className="px-6 py-4 bg-[#f3fbff]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
          </div>
          <a
            href="#pricing"
            className="text-sm font-medium text-[#268ad8] hover:text-[#1e6fb0] transition-colors"
          >
            Pricing
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-12 pb-28 bg-[#f3fbff] relative overflow-hidden">
        {/* Decorative Background Assets */}
        <div className="absolute inset-0 bg-[url('/sprinkles.png')] opacity-10 bg-cover mix-blend-overlay animate-gentle-bg pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#268ad8] opacity-15 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[#c84367] opacity-10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Image src="/mascot.png" alt="Maki mascot" width={120} height={120} className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 drop-shadow-xl animate-bob" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Fix what&apos;s slowing down your WordPress site.
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Paste your URL. Maki scans your site with Google PageSpeed Insights, detects your WordPress setup when possible, and shows you what to fix first.
          </p>

          <div className="w-full max-w-xl mx-auto relative">
            {loading ? (
              <div className="border-2 border-[#268ad8]/30 rounded-2xl p-8 bg-white shadow-xl relative overflow-hidden animate-slide-up-fade">
                <div className="absolute inset-0 bg-[url('/sprinkles.png')] opacity-[0.03] bg-cover mix-blend-overlay animate-gentle-bg pointer-events-none"></div>
                <Image src="/mascot.png" alt="Maki is scanning" width={60} height={60} className="mx-auto mb-4 animate-bob drop-shadow-md" />
                <div className="text-center mb-6">
                  <h3 className="font-bold text-lg text-[#282f42] mb-1">
                    {scanProgress < 30 ? "Fetching PageSpeed data..." : scanProgress < 60 ? "Detecting WordPress setup..." : scanProgress < 90 ? "Identifying performance problems..." : "Almost done..."}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">This usually takes about 10-15 seconds.</p>
                </div>
                <div className="w-full bg-blue-50 rounded-full h-3 overflow-hidden shadow-inner relative z-10 border border-blue-100">
                  <div
                    className="bg-gradient-to-r from-[#268ad8] to-[#c84367] h-full rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${scanProgress}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[gentleBg_1s_linear_infinite]" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-[#e8f3fb] focus-within:border-[#268ad8] bg-white transition-all shadow-sm">
                  <input
                    id="url-input"
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setUrlError("");
                    }}
                    placeholder="https://yourwordpresssite.com"
                    className="flex-1 py-4 px-5 text-[#282f42] placeholder-gray-400 outline-none text-base w-full"
                    onKeyDown={(e) => e.key === "Enter" && handleScan("basic")}
                  />
                  <button
                    onClick={() => handleScan("basic")}
                    disabled={loading !== null}
                    className="m-1.5 px-6 py-3.5 sm:py-3 rounded-lg bg-[#268ad8] text-white text-sm font-bold hover:bg-[#1e6fb0] transition-colors disabled:opacity-60 shrink-0"
                  >
                    Scan my WordPress site
                  </button>
                </div>
                {urlError && (
                  <p className="text-red-500 text-sm mt-2 text-left">{urlError}</p>
                )}
              </>
            )}
            
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-5 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Uses Google PageSpeed Insights
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Free scan
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                No account required
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-[#268ad8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Full fix plan is $9 one-time
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              How it works
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                n: "STEP 1",
                title: "Scan your WordPress site",
                desc: "Paste your URL. Maki runs a fresh PageSpeed test.",
              },
              {
                n: "STEP 2",
                title: "See what's actually slowing it down",
                desc: "Maki identifies the biggest performance problems and detects your WordPress setup when possible.",
              },
              {
                n: "STEP 3",
                title: "Unlock your exact fix plan",
                desc: "For $9 one-time, get prioritized WordPress-specific instructions based on your detected setup.",
              },
              {
                n: "STEP 4",
                title: "Fix and re-test",
                desc: "Apply the changes, mark fixes complete, and run a fresh test to compare before vs. after.",
              }
            ].map((step) => (
              <div
                key={step.n}
                className="relative bg-[#f9fafb] border border-gray-100 rounded-2xl p-6"
              >
                <span className="text-[10px] font-extrabold text-[#268ad8] uppercase tracking-widest mb-3 block">
                  {step.n}
                </span>
                <h3 className="font-bold text-lg mb-2 text-gray-900 leading-snug">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 py-24 bg-[#F9FAFB] border-y border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Maki tells you exactly what to do.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You shouldn't need to understand Lighthouse reports. Maki turns performance data into specific WordPress actions.
            </p>
          </div>

          <div className="bg-white border-2 border-[#268ad8]/20 rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto relative">
            <div className="absolute inset-0 bg-[url('/sprinkles.png')] opacity-[0.02] bg-cover mix-blend-overlay pointer-events-none"></div>
            {/* Browser chrome */}
            <div className="border-b border-gray-100 px-5 py-3 flex items-center gap-2 bg-[#f9fafb] relative z-10">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                <span className="w-3.5 h-3.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 text-center font-mono shadow-inner">
                getmaki.app/report
              </div>
            </div>

            {/* Mock Dashboard */}
            <div className="p-6 sm:p-10 relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-[#282f42] mb-1">example.com</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#268ad8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">WordPress detected</span>
                </div>
                <div className="text-center bg-[#282f42] text-white px-5 py-3 rounded-2xl shadow-lg transform rotate-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Performance</p>
                  <p className="text-3xl font-black text-red-400">58</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="border-2 border-red-100 shadow-lg shadow-red-500/5 rounded-2xl overflow-hidden relative bg-white">
                  
                  <div className="bg-[#f9fafb] px-5 py-3 text-[10px] font-black text-[#c84367] uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Next Priority Fix
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border bg-[#c84367]/10 text-[#c84367] border-[#c84367]/20">High impact</span>
                    </div>
                    <h4 className="font-bold text-xl text-[#282f42] mb-3">Your main image is lazy-loaded</h4>
                    
                    <div className="mb-5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Affected resource</p>
                      <div className="bg-gray-100 border border-gray-200 rounded p-2 text-xs font-mono text-gray-600 truncate max-w-full inline-block">
                        hero-home.webp
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Detected Setup</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2.5 py-1 rounded-md">WordPress</span>
                        <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2.5 py-1 rounded-md">GeneratePress</span>
                        <span className="text-xs font-bold bg-blue-50 text-[#268ad8] border border-blue-100 px-2.5 py-1 rounded-md">Perfmatters</span>
                      </div>
                    </div>

                    <div className="bg-[#f9fafb] p-5 rounded-xl border border-gray-100 mb-6">
                      <p className="text-xs font-bold text-[#268ad8] uppercase tracking-widest mb-4">How to fix</p>
                      <div className="space-y-4 ml-1">
                        {[
                          "Open WordPress Admin.",
                          "Go to Settings → Perfmatters.",
                          "Open the Lazy Load tab.",
                          <span>Add <span className="font-mono bg-white border px-1.5 py-0.5 rounded text-[10px]">hero-home.webp</span> to the exclusion list.</span>,
                          "Clear cache."
                        ].map((step, idx, arr) => (
                          <div key={idx} className="flex gap-3 items-start relative">
                            {idx !== arr.length - 1 && <div className="absolute left-3 top-7 bottom-[-16px] w-0.5 bg-gray-200"></div>}
                            <div className="w-6 h-6 rounded-full bg-[#268ad8] text-white flex items-center justify-center text-xs font-bold shrink-0 relative z-10 shadow-sm">
                              {idx + 1}
                            </div>
                            <div className="pt-0.5 text-[#282f42] text-sm font-medium leading-relaxed">{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button className="text-sm px-6 py-2.5 rounded-full border-2 font-bold bg-white text-[#268ad8] border-[#268ad8] hover:bg-[#268ad8] hover:text-white transition-all shadow-sm">
                        Mark as fixed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Maki */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Maki is different
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
              We don't just tell you what's wrong. We tell you how to fix it in WordPress.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">Generic tools</span>
              <p className="text-lg font-medium text-gray-900 mb-4">"Reduce unused JavaScript."</p>
              <p className="text-sm text-gray-500">You are left to figure out which plugin is causing the issue and how to disable it safely without breaking your site.</p>
            </div>
            
            <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 relative">
              <span className="text-[10px] font-extrabold text-[#268ad8] uppercase tracking-widest mb-2 block">Maki</span>
              <p className="text-lg font-medium text-[#268ad8] mb-4">"Perfmatters is detected. Review Script Manager and unload this specific asset."</p>
              <p className="text-sm text-gray-600">When Maki detects your setup, it gives you exact steps for the tools you already have installed.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">Generic tools</span>
              <p className="text-lg font-medium text-gray-900 mb-4">"Improve LCP."</p>
              <p className="text-sm text-gray-500">You search Google for 30 minutes trying to understand what an LCP element even is.</p>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 relative">
              <span className="text-[10px] font-extrabold text-[#268ad8] uppercase tracking-widest mb-2 block">Maki</span>
              <p className="text-lg font-medium text-[#268ad8] mb-4">"Your hero image is the LCP element and appears to be lazy-loaded. Exclude it from lazy loading."</p>
              <p className="text-sm text-gray-600">Maki pinpoints the exact file and the exact reason it's failing, giving you a clear path forward.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="bg-[#111827] text-white px-6 py-24"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Simple pricing.
            </h2>
            <p className="text-gray-400 mt-4 text-lg">
              Start with the free scan.
            </p>
          </div>

          <div className="max-w-md mx-auto relative z-10">
            <div className="bg-white text-gray-900 rounded-3xl p-8 flex flex-col shadow-2xl">
              <div className="mb-2">
                <h3 className="text-xl font-extrabold">WordPress Fix Plan</h3>
              </div>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">$9</span>
                <span className="text-gray-500 font-medium">One-time</span>
              </div>
              
              <ul className="text-sm text-gray-600 space-y-4 mb-8 flex-1">
                {[
                  "Prioritized WordPress fixes",
                  "Plugin & theme-specific instructions (when detected)",
                  "Affected resources pinpointed",
                  "Progress checklist",
                  "Manual re-tests",
                  "Before / after comparison"
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => {
                    document.querySelector("input")?.focus();
                  }, 500);
                }}
                className="w-full py-4 rounded-xl bg-gray-900 text-white text-base font-bold hover:bg-gray-800 transition-colors"
              >
                Scan my site first
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">FAQ</h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-xl bg-gray-50"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none focus:outline-none">
                  <span className="font-bold text-gray-900">{item.q}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180"
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
                <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-200 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-gray-500 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto grayscale opacity-70" />
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <button onClick={() => setPrivacyOpen(true)} className="hover:text-gray-900 transition-colors">Privacy Policy</button>
            <button onClick={() => setTermsOpen(true)} className="hover:text-gray-900 transition-colors">Terms & Conditions</button>
            <a href="mailto:support@getmaki.app" className="hover:text-gray-900 transition-colors">Support</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 text-center md:text-left text-xs text-gray-400">
          © {new Date().getFullYear()} Maki. Not affiliated with Google or WordPress.
        </div>
      </footer>

      {/* Modals & Schema */}
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
      <SchemaMarkup />
    </main>
  );
}
