import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import mascot from "@/public/mascot.svg";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { LeadForm } from "@/components/site/LeadForm";
import { SERVICES, priceLabel } from "@/lib/services";
import { SITE_URL, jsonLd } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "WordPress Speed Optimization Service — We Fix It For You",
  description:
    "Don't want to touch your WordPress settings? We'll fix your Core Web Vitals for you — or build you a fast new WordPress site from scratch. Get a quote.",
  alternates: { canonical: "/done-for-you" },
};

const STEPS = [
  { n: "01", title: "Tell us about your site", desc: "Fill in the form. If you already ran a Maki scan, we attach it automatically." },
  { n: "02", title: "Get a fixed quote", desc: "We review your setup and reply within 1–2 business days with scope, price and timeline." },
  { n: "03", title: "We do the work", desc: "Backups first, then fixes on your live site or a staging copy. You don't touch a thing." },
  { n: "04", title: "Before / after report", desc: "Real PageSpeed data showing exactly what improved." },
];

const FAQ = [
  {
    q: "Do you need my WordPress login?",
    a: "Yes — we'll ask for a temporary admin account once you approve the quote. You can delete it as soon as we're done.",
  },
  {
    q: "Will you break my site?",
    a: "We take a full backup before any change and test every page we touch. If anything looks off, we roll back.",
  },
  {
    q: "What if my site isn't WordPress?",
    a: "Our optimization service is WordPress-only. If you're on another platform, we can rebuild your site on fast WordPress.",
  },
  {
    q: "How long does it take?",
    a: "Most speed fixes take 3–7 business days. New sites usually take 2–4 weeks depending on scope.",
  },
];

export default function DoneForYouPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "WordPress speed optimization and website build",
    serviceType: "WordPress performance optimization",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "Worldwide",
    url: `${SITE_URL}/done-for-you`,
  };

  return (
    <PageShell>
      <PageHero
        crumbs={[{ name: "Done for you", href: "/done-for-you" }]}
        eyebrow="Done for you"
        title="Don't want to do it yourself? We'll fix it for you."
        lead="Send us your WordPress site and we'll get your Core Web Vitals into the green. No website yet? We'll build you a fast one."
      />

      {/* Offers */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5">
          {Object.values(SERVICES).map((s, i) => (
            <div key={s.type} className={`rounded-[28px] p-8 sm:p-10 ${i === 0 ? "bg-ink text-white" : "bg-mint text-ink"}`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${i === 0 ? "text-mint" : "text-deep"}`}>
                {s.type === "fix" ? "Have a site" : "No site yet"}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 leading-tight">{s.name}</h2>
              <p className={`mt-3 ${i === 0 ? "text-white/65" : "text-ink/70"}`}>{s.tagline}</p>
              <p className="font-display text-2xl font-extrabold mt-6">{priceLabel(s)}</p>
              <ul className="mt-6 space-y-3">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className={`w-5 h-5 shrink-0 mt-0.5 ${i === 0 ? "text-mint" : "text-deep"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={i === 0 ? "text-white/85" : "text-ink/80"}>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`?type=${s.type}#quote`}
                className={`mt-8 inline-block rounded-2xl px-6 py-3.5 font-bold ${i === 0 ? "bg-mint text-ink" : "bg-ink text-white"}`}
              >
                {s.type === "fix" ? "Fix my site →" : "Build my site →"}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="px-6 py-20 bg-paper">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl font-extrabold tracking-tight">How it works</h2>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-[24px] bg-white border border-ink/10 p-7">
                <span className="font-display text-3xl font-extrabold text-maki">{s.n}</span>
                <h3 className="font-display text-xl font-extrabold mt-4">{s.title}</h3>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Form */}
      <section id="quote" className="px-6 py-20 scroll-mt-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-start">
          <div className="lg:sticky lg:top-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-maki mb-3">Get a quote</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Tell us what you need.
            </h2>
            <p className="mt-4 text-lg text-ink/60">A real person reads every request. No sales calls unless you want one.</p>
            <Image src={mascot} alt="" sizes="160px" className="hidden lg:block w-[160px] h-auto mt-10" />
          </div>
          <Suspense fallback={<div className="rounded-[28px] bg-paper h-[640px]" />}>
            <LeadForm />
          </Suspense>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-extrabold tracking-tight">Questions</h2>
          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {FAQ.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="font-display text-lg font-bold">{f.q}</h3>
                <p className="mt-2 text-ink/65 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
    </PageShell>
  );
}
