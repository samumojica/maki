import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageShell, ScanCta } from "@/components/site/PageShell";
import { GUIDES } from "@/lib/seo/guides";

export const metadata: Metadata = {
  title: "WordPress Speed Guides",
  description:
    "Plain-English guides to WordPress performance and Core Web Vitals: why sites are slow, how to fix LCP, INP and CLS, and what the thresholds mean.",
  alternates: { canonical: "/guides" },
};

const TILE = ["bg-ink text-white", "bg-maki text-white", "bg-mint text-ink", "bg-deep text-white"];

export default function GuidesIndex() {
  return (
    <PageShell>
      <PageHero
        crumbs={[{ name: "Guides", href: "/guides" }]}
        eyebrow="Guides"
        title="Make WordPress fast. In plain English."
        lead="No jargon walls. What's slowing your site down, why it matters, and what to do about it."
      />
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDES.map((g, i) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className={`group rounded-[28px] p-8 min-h-[320px] flex flex-col hover:-translate-y-1 transition-transform ${TILE[i % TILE.length]}`}
            >
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                {g.tag} · {g.readingMinutes} min read
              </span>
              <h2 className="font-display text-2xl font-extrabold leading-tight mt-auto">{g.title}</h2>
              <p className="mt-3 text-sm leading-relaxed opacity-75 line-clamp-3">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <ScanCta heading="Skip the reading. Scan your site." />
    </PageShell>
  );
}
