import Link from "next/link";
import Image from "next/image";
import mascot from "@/public/mascot.svg";
import { SiteHeader } from "../site/SiteHeader";
import { SiteFooter } from "../site/SiteFooter";
import { HeroBackdrop } from "../heroes/shared";
import UnlockButton, { Speedometer } from "@/app/scan/[scanId]/unlock-button";
import { verdictLabel, verdictSublabel } from "@/lib/verdict";
import type { AuditResult, CWVMetric, Verdict } from "@/lib/types";

const VERDICT_TEXT: Record<Verdict, string> = {
  poor: "text-[#ff7a7a]",
  "needs-work": "text-[#ffb547]",
  good: "text-mint",
  excellent: "text-mint",
};

const METRICS: { key: "lcp" | "inp" | "cls"; label: string; name: string }[] = [
  { key: "lcp", label: "LCP", name: "Largest Contentful Paint" },
  { key: "inp", label: "INP", name: "Interaction to Next Paint" },
  { key: "cls", label: "CLS", name: "Cumulative Layout Shift" },
];

function statusStyle(m: CWVMetric) {
  if (m.value.includes("N/A")) return { pill: "bg-ink/5 text-ink/50", text: "text-ink/50", label: "Field data only" };
  const s = m.status as string;
  if (s === "pass") return { pill: "bg-mint-soft text-[#2f7d32]", text: "text-[#2f7d32]", label: "Good" };
  if (s === "needs-improvement") return { pill: "bg-amber-50 text-amber-700", text: "text-amber-600", label: "Needs improvement" };
  return { pill: "bg-red-50 text-red-600", text: "text-red-600", label: "Poor" };
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ScanResultsView({ audit, scanId }: { audit: AuditResult; scanId: string }) {
  const verdict = audit.verdict;
  const wp = audit.siteInfo?.wordpressContext;
  const eligible = wp?.eligible !== false;
  const fixes = audit.structuredFixes ?? [];
  const highCount = fixes.filter((f) => f.impact === "high").length;
  const preview = fixes.slice(0, 3);
  const lockedCount = Math.max(fixes.length - preview.length, 0);
  const stack = wp?.allDetected?.map((t) => t.name) ?? [];
  const site = hostname(audit.url);

  return (
    <main className="min-h-screen flex flex-col bg-white text-ink">
      <SiteHeader />

      {/* ───────── Verdict hero ───────── */}
      <section className="relative overflow-hidden bg-ink text-white px-6 pt-12 sm:pt-16 pb-28">
        <HeroBackdrop focus="70% 40%" />
        <div className="relative max-w-5xl mx-auto grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Free scan results</p>
            <p className="mt-3 text-white/60 truncate">
              <span className="font-mono text-white/85">{site}</span>
              {wp?.status === "confirmed" || wp?.status === "likely" ? (
                <span className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/80 align-middle">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                  WordPress {wp.status === "likely" ? "likely" : "detected"}
                </span>
              ) : null}
            </p>
            <h1 className={`font-display font-extrabold tracking-[-0.03em] leading-[0.95] text-6xl sm:text-7xl mt-5 ${VERDICT_TEXT[verdict]}`}>
              {verdictLabel(verdict)}.
            </h1>
            <p className="mt-4 text-xl text-white/75 max-w-md">{verdictSublabel(verdict)}</p>
          </div>

          <div className="flex flex-col items-center">
            <Speedometer verdict={verdict} score={audit.mobileScore} tone="dark" />
            <div className="mt-1 flex gap-3">
              {[
                { label: "Mobile", score: audit.mobileScore },
                { label: "Desktop", score: audit.desktopScore },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 px-5 py-3 text-center min-w-[110px]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{s.label}</p>
                  <p className="font-display text-3xl font-extrabold leading-none mt-1">{s.score}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Core Web Vitals (overlapping the hero) ───────── */}
      <section className="px-6 -mt-16 relative z-10">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4">
          {METRICS.map((m) => {
            const metric = audit.cwvScores[m.key];
            const st = statusStyle(metric);
            return (
              <div key={m.key} className="rounded-[24px] bg-white border border-ink/10 shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-extrabold">{m.label}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${st.pill}`}>{st.label}</span>
                </div>
                <p className={`font-display text-4xl font-extrabold mt-4 ${st.text}`}>{metric.value}</p>
                <p className="text-xs text-ink/50 mt-1">{m.name}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── Findings + unlock ───────── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
          <div>
            {audit.summaryParagraph && (
              <div className="rounded-[24px] bg-paper p-6 sm:p-7 mb-6 flex gap-4">
                <Image src={mascot} alt="" sizes="40px" className="w-10 h-auto shrink-0 self-start" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-ink/45 mb-1.5">Maki&apos;s take</p>
                  <p className="text-ink/80 leading-relaxed">{audit.summaryParagraph}</p>
                </div>
              </div>
            )}

            {eligible ? (
              <>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  We found {fixes.length} fixes
                  {highCount > 0 && <span className="text-maki"> — {highCount} high impact</span>}
                </h2>
                {stack.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {stack.slice(0, 8).map((t) => (
                      <span key={t} className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-ink/70">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <ol className="mt-6 space-y-3">
                  {preview.map((f, i) => (
                    <li key={f.fixId} className="rounded-2xl border border-ink/10 p-5 flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-ink text-mint font-display font-extrabold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold leading-snug">{f.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                          <span
                            className={`rounded-full px-2 py-0.5 uppercase tracking-wide ${
                              f.impact === "high" ? "bg-red-50 text-red-600" : f.impact === "medium" ? "bg-amber-50 text-amber-700" : "bg-ink/5 text-ink/60"
                            }`}
                          >
                            {f.impact} impact
                          </span>
                          {f.context.plugin && (
                            <span className="rounded-full bg-maki/10 text-maki px-2 py-0.5">Steps for {f.context.plugin}</span>
                          )}
                        </div>
                      </div>
                      <svg aria-hidden className="w-5 h-5 text-ink/25 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </li>
                  ))}
                  {lockedCount > 0 && (
                    <li className="relative rounded-2xl border border-dashed border-ink/20 p-5 overflow-hidden">
                      <div aria-hidden className="space-y-2 blur-[3px] select-none">
                        <div className="h-3 w-3/4 rounded bg-ink/15" />
                        <div className="h-3 w-1/2 rounded bg-ink/10" />
                      </div>
                      <p className="absolute inset-0 flex items-center justify-center font-bold text-ink/70">
                        + {lockedCount} more fixes in your plan
                      </p>
                    </li>
                  )}
                </ol>
              </>
            ) : (
              <div className="rounded-[24px] bg-amber-50 border border-amber-200 p-7">
                <h2 className="font-display text-2xl font-extrabold text-amber-900">We couldn&apos;t confidently detect WordPress.</h2>
                <p className="mt-2 text-amber-900/80">
                  Maki&apos;s fix plans are built specifically for WordPress, so the paid plan isn&apos;t available for this site.
                </p>
              </div>
            )}
          </div>

          {/* Sticky unlock card */}
          <aside className="lg:sticky lg:top-6 space-y-4">
            {eligible && (
              <div className="rounded-[28px] bg-ink text-white p-7 sm:p-8 shadow-2xl">
                <span className="rounded-full bg-mint text-ink text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5">
                  WordPress fix plan
                </span>
                <p className="font-display text-6xl font-extrabold tracking-tight mt-6">$9</p>
                <p className="text-white/50 text-sm">one-time · no subscription</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    `All ${fixes.length} fixes, step by step`,
                    "Exact settings for your plugins",
                    "The files causing each problem",
                    "Progress checklist + re-tests",
                  ].map((x) => (
                    <li key={x} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-mint shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/85">{x}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <UnlockButton scanId={scanId} score={audit.mobileScore} />
                </div>
                <p className="mt-4 text-center text-xs text-white/40">
                  Secure checkout via <span className="font-bold italic text-white/70">stripe</span>
                </p>
              </div>
            )}

            <div className="rounded-[24px] bg-mint p-6 text-ink">
              <p className="font-display text-xl font-extrabold">
                {eligible ? "Rather not do it yourself?" : "Want a fast WordPress site instead?"}
              </p>
              <p className="mt-1 text-sm text-ink/70">
                {eligible
                  ? "We can apply every fix for you. Fixed quote, backups first."
                  : "We build WordPress sites that pass Core Web Vitals from day one."}
              </p>
              <Link
                href={`/done-for-you?type=${eligible ? "fix" : "build"}&from=scan&scan=${scanId}#quote`}
                className="mt-4 inline-block rounded-xl bg-ink text-white font-bold px-5 py-3 text-sm"
              >
                {eligible ? "Have Maki's team fix it →" : "Talk to us about a new site →"}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

export function ScanExpired() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-ink">
      <SiteHeader />
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-md text-center">
          <Image src={mascot} alt="" sizes="120px" className="w-[120px] h-auto mx-auto" />
          <h1 className="font-display text-4xl font-extrabold tracking-tight mt-6">This scan has expired</h1>
          <p className="text-ink/60 mt-3 mb-8">Run a fresh scan to see your latest results — it&apos;s free.</p>
          <Link href="/#scan" className="inline-block rounded-2xl bg-maki text-white font-bold px-6 py-3.5 hover:bg-maki-dark transition-colors">
            Run a new scan →
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
