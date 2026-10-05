import Image from "next/image";
import Link from "next/link";
import celebrate from "@/public/celebrate.svg";
import { SchemaMarkup } from "./SchemaMarkup";
import { ScanForm } from "./site/ScanForm";
import { HeroSplit } from "./heroes/HeroSplit";
import { HeroCentered } from "./heroes/HeroCentered";
import { SiteHeader } from "./site/SiteHeader";
import { SiteFooter } from "./site/SiteFooter";
import { BleedCarousel } from "./site/BleedCarousel";
import { FAQ_ITEMS } from "@/lib/faq-data";
import { WP_FIX_LIBRARY } from "@/lib/wp-fixes";
import { STACK_PAGES } from "@/lib/seo/stacks";
import { GUIDES } from "@/lib/seo/guides";
import { fixMetric, fixVariantNames } from "@/lib/seo/fix-meta";

// Card colour rotation for the carousels — the four brand colours.
const CARD_THEMES = [
  { card: "bg-ink text-white", badge: "bg-mint text-ink", muted: "text-white/60", chip: "bg-white/10 text-white" },
  { card: "bg-maki text-white", badge: "bg-white text-maki", muted: "text-white/75", chip: "bg-white/15 text-white" },
  { card: "bg-mint text-ink", badge: "bg-ink text-mint", muted: "text-ink/65", chip: "bg-ink/10 text-ink" },
  { card: "bg-deep text-white", badge: "bg-mint text-ink", muted: "text-white/65", chip: "bg-white/10 text-white" },
];

const pluginCount = new Set(WP_FIX_LIBRARY.flatMap((f) => Object.keys(f.variants ?? {}))).size;

const STEPS = [
  { n: "01", title: "Paste your URL", desc: "Maki runs a fresh Google PageSpeed test and pulls real Chrome user data for your site." },
  { n: "02", title: "We fingerprint your stack", desc: "Theme, page builder, caching and image plugins — detected from the outside. Nothing to install." },
  { n: "03", title: "Get your fix plan", desc: "For $9 once: prioritized fixes with the exact settings for the plugins you already use." },
  { n: "04", title: "Fix, re-test, compare", desc: "Tick off fixes, re-run the test, and see before vs. after for every Core Web Vital." },
];

export default function LandingPage({ hero = "centered" }: { hero?: "split" | "centered" }) {
  return (
    <main className="min-h-screen flex flex-col bg-white text-ink">
      <SiteHeader />

      {hero === "centered" ? <HeroCentered /> : <HeroSplit />}

      {/* ───────────────────────── Fix carousel ───────────────────────── */}
      <section className="py-24 lg:py-32 bg-white overflow-hidden">
        <BleedCarousel
          eyebrow="The fix library"
          title={
            <>
              Not &ldquo;reduce unused JS&rdquo;.
              <br />
              <span className="text-maki">The exact setting.</span>
            </>
          }
          description={`${WP_FIX_LIBRARY.length} WordPress fix playbooks with plugin-specific steps for ${pluginCount} popular plugins. Maki only shows the ones your site actually fails.`}
        >
          {WP_FIX_LIBRARY.map((fix, i) => {
            const t = CARD_THEMES[i % CARD_THEMES.length];
            const variants = fixVariantNames(fix);
            return (
              <Link
                key={fix.id}
                href={`/fixes/${fix.id}`}
                data-card
                className={`group snap-start shrink-0 w-[300px] sm:w-[340px] min-h-[400px] rounded-[28px] p-7 flex flex-col transition-transform hover:-translate-y-1.5 ${t.card}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-wide ${t.badge}`}>
                    {fixMetric(fix)}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-widest ${t.muted}`}>{fix.impact} impact</span>
                </div>
                <h3 className="font-display text-2xl font-extrabold leading-tight mt-8">{fix.title}</h3>
                <p className={`mt-3 text-sm leading-relaxed line-clamp-4 ${t.muted}`}>{fix.whyItMatters}</p>
                <div className="mt-auto pt-6">
                  {variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {variants.slice(0, 3).map((v) => (
                        <span key={v} className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${t.chip}`}>
                          {v}
                        </span>
                      ))}
                      {variants.length > 3 && (
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${t.chip}`}>
                          +{variants.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="inline-flex items-center gap-2 font-bold text-sm">
                    Read the fix
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </BleedCarousel>
      </section>

      {/* ───────────────────────── How it works ───────────────────────── */}
      <section className="px-6 py-24 lg:py-32 bg-paper">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-maki mb-3">How it works</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              From red scores to a clear to-do list in 30 seconds.
            </h2>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <li key={s.n} className="relative rounded-[24px] bg-white border border-ink/10 p-7">
                <span
                  className={`inline-flex w-12 h-12 items-center justify-center rounded-2xl font-display text-lg font-extrabold ${
                    ["bg-ink text-mint", "bg-maki text-white", "bg-mint text-ink", "bg-deep text-white"][i]
                  }`}
                >
                  {s.n}
                </span>
                <h3 className="font-display text-xl font-extrabold mt-6 mb-2">{s.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────────────── Generic vs Maki ───────────────────────── */}
      <section className="px-6 py-24 lg:py-32 bg-deep text-white relative overflow-hidden">
        <div aria-hidden className="absolute -right-40 -top-40 w-[520px] h-[520px] rounded-full bg-mint/10 blur-[100px]" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint mb-3">Why Maki is different</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Other tools tell you what&apos;s wrong. Maki tells you{" "}
              <span className="text-mint">what to click.</span>
            </h2>
            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Generic speed test</p>
                <p className="text-lg text-white/50 line-through decoration-red-400/70">&ldquo;Reduce unused JavaScript.&rdquo;</p>
              </div>
              <div className="rounded-2xl bg-mint text-ink p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-ink/55 mb-2">Maki</p>
                <p className="text-lg font-semibold">
                  &ldquo;Perfmatters is installed. Open Script Manager and disable <code className="font-mono text-base">contact-form-7.js</code> on every page except /contact.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Mock report */}
          <div className="rounded-[28px] bg-white text-ink shadow-2xl overflow-hidden">
            <div className="border-b border-ink/10 px-5 py-3 flex items-center gap-2 bg-paper">
              <span className="w-3 h-3 rounded-full bg-ink/15" />
              <span className="w-3 h-3 rounded-full bg-ink/15" />
              <span className="w-3 h-3 rounded-full bg-ink/15" />
              <span className="flex-1 mx-4 rounded-md bg-white border border-ink/10 px-3 py-1 text-xs text-ink/50 text-center">
                getmaki.app/results
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs text-ink/50 mb-1">yourwordpresssite.com · example report</p>
                  <h3 className="font-display text-xl font-extrabold">Performance report</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold shrink-0">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Needs work
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "LCP", value: "4.2s", pass: false },
                  { label: "INP", value: "320ms", pass: false },
                  { label: "CLS", value: "0.05", pass: true },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-ink/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-ink/50">{m.label}</span>
                      <span className={`w-2 h-2 rounded-full ${m.pass ? "bg-[#2f9e44]" : "bg-red-500"}`} />
                    </div>
                    <p className={`font-display text-xl font-extrabold ${m.pass ? "text-[#2f9e44]" : "text-red-600"}`}>{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-ink/10 p-4 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-maki text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1">Your hero image is lazy-loaded</p>
                  <p className="text-xs text-ink/55 leading-relaxed">
                    Settings → <span className="font-semibold text-ink">Perfmatters</span> → Lazy Load → exclude{" "}
                    <span className="font-mono bg-paper border border-ink/10 px-1 rounded">hero-home.webp</span>
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#2f9e44] shrink-0">−2.3s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Stack carousel ───────────────────────── */}
      <section className="py-24 lg:py-32 bg-white overflow-hidden">
        <BleedCarousel
          eyebrow="Built for your stack"
          title={
            <>
              Whatever you built it with,
              <br />
              we speak its settings.
            </>
          }
        >
          {STACK_PAGES.map((s, i) => {
            const t = CARD_THEMES[(i + 2) % CARD_THEMES.length];
            return (
              <Link
                key={s.slug}
                href={`/wordpress/${s.slug}`}
                data-card
                className={`group snap-start shrink-0 w-[280px] sm:w-[320px] min-h-[300px] rounded-[28px] p-7 flex flex-col transition-transform hover:-translate-y-1.5 ${t.card}`}
              >
                <span className={`self-start rounded-full px-3 py-1 text-xs font-bold ${t.chip}`}>{s.kind}</span>
                <h3 className="font-display text-4xl font-extrabold tracking-tight mt-auto">{s.name}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${t.muted}`}>{s.painPoints[0].title}.</p>
                <span className="mt-5 inline-flex items-center gap-2 font-bold text-sm">
                  Speed up {s.name}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            );
          })}
        </BleedCarousel>
      </section>

      {/* ───────────────────────── Pricing ───────────────────────── */}
      <section id="pricing" className="px-6 py-24 lg:py-32 bg-mint-soft relative overflow-hidden scroll-mt-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-maki mb-3">Pricing</p>
            <h2 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1]">
              $9. Once.
              <br />
              <span className="text-deep">No subscription.</span>
            </h2>
            <p className="mt-6 text-lg text-ink/60 max-w-md">
              Scan for free. Pay only if you want the full WordPress fix plan for your site.
            </p>
            <Image
              src={celebrate}
              alt=""
              sizes="420px"
              className="hidden lg:block w-[420px] h-auto mt-4 -mb-32"
            />
          </div>

          <div className="rounded-[32px] bg-ink text-white p-8 sm:p-10 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-mint text-ink text-xs font-extrabold uppercase tracking-widest px-3 py-1.5">
                WordPress fix plan
              </span>
              <span className="text-sm text-white/50">one-time</span>
            </div>
            <p className="font-display text-7xl font-extrabold tracking-tight mt-8">$9</p>
            <ul className="mt-8 space-y-4">
              {[
                "Prioritized WordPress fixes",
                "Plugin & theme-specific instructions",
                "Affected files pinpointed",
                "Progress checklist",
                "Re-tests with before / after comparison",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-mint/15 text-mint flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="font-medium text-white/85">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/#scan"
              className="mt-10 block text-center w-full py-4 rounded-2xl bg-maki text-white text-base font-bold hover:bg-maki-dark transition-colors"
            >
              Start with a free scan →
            </Link>
            <p className="text-center text-xs text-white/40 mt-4">
              Secure checkout via <span className="font-bold italic text-white/70">stripe</span>
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Done for you ───────────────────────── */}
      <section className="px-6 py-24 lg:py-28 bg-ink text-white relative overflow-hidden">
        <div aria-hidden className="absolute -left-40 -bottom-40 w-[520px] h-[520px] rounded-full bg-maki/20 blur-[110px]" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint mb-3">Done for you</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Rather not touch your settings? <span className="text-mint">We&apos;ll do it.</span>
            </h2>
            <p className="mt-5 text-lg text-white/65 max-w-xl">
              Send us your site and we&apos;ll fix your Core Web Vitals for you. No website yet? We build fast WordPress
              sites from scratch.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/done-for-you?type=fix&from=home#quote"
                className="rounded-2xl bg-mint text-ink font-bold px-6 py-3.5 hover:brightness-95 transition"
              >
                Fix my site for me →
              </Link>
              <Link
                href="/done-for-you?type=build&from=home#quote"
                className="rounded-2xl border border-white/20 text-white font-bold px-6 py-3.5 hover:bg-white/10 transition"
              >
                I need a new website
              </Link>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Backups first", d: "Every change is reversible." },
              { t: "Fixed quote", d: "Know the price before we start." },
              { t: "Before / after", d: "Real PageSpeed data, not promises." },
              { t: "WordPress experts", d: "Elementor, Divi, WooCommerce and more." },
            ].map((x) => (
              <li key={x.t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-display text-lg font-extrabold">{x.t}</p>
                <p className="mt-1 text-sm text-white/60">{x.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────────────── FAQ + Guides ───────────────────────── */}
      <section className="px-6 py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-maki mb-3">Questions</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">Good to know.</h2>
            <div className="mt-10 rounded-[24px] bg-paper p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-ink/45 mb-4">From the guides</p>
              <ul className="space-y-3">
                {GUIDES.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`} className="group flex items-start justify-between gap-3 font-semibold hover:text-maki">
                      <span>{g.title}</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group py-1">
                <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer list-none">
                  <span className="font-display text-lg font-bold">{item.q}</span>
                  <span className="w-8 h-8 rounded-full bg-paper flex items-center justify-center shrink-0 transition-transform group-open:rotate-45">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="pb-6 pr-12 text-ink/65 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Final CTA ───────────────────────── */}
      <section className="px-6 py-24 lg:py-28 bg-mint text-ink relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1]">
            Ready to see your WordPress fixes?
          </h2>
          <p className="mt-6 text-lg text-ink/70">Free scan. Plain-English fixes. No account.</p>
          <div className="mt-10 max-w-xl mx-auto text-left">
            <ScanForm tone="light" id="url-input-footer" />
          </div>
        </div>
      </section>

      <SiteFooter />
      <SchemaMarkup />
    </main>
  );
}
