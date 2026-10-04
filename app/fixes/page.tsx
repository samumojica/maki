import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageShell, ScanCta } from "@/components/site/PageShell";
import { WP_FIX_LIBRARY } from "@/lib/wp-fixes";
import { fixMetric, fixVariantNames } from "@/lib/seo/fix-meta";

export const metadata: Metadata = {
  title: "WordPress Core Web Vitals Fix Library",
  description:
    "Step-by-step fixes for the most common WordPress performance problems — LCP, INP, CLS and TTFB — with exact settings for WP Rocket, Perfmatters, LiteSpeed Cache and more.",
  alternates: { canonical: "/fixes" },
};

const METRIC_STYLE: Record<string, string> = {
  LCP: "bg-maki text-white",
  INP: "bg-deep text-white",
  CLS: "bg-mint text-ink",
  TTFB: "bg-ink text-mint",
  Speed: "bg-paper text-ink",
};

export default function FixesIndex() {
  return (
    <PageShell>
      <PageHero
        crumbs={[{ name: "Fix library", href: "/fixes" }]}
        eyebrow="Fix library"
        title="Every WordPress speed fix, step by step."
        lead="The same playbooks Maki uses to build your fix plan — with exact instructions for the most popular caching, optimization and image plugins."
      />
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WP_FIX_LIBRARY.map((fix) => {
            const metric = fixMetric(fix);
            const variants = fixVariantNames(fix);
            return (
              <Link
                key={fix.id}
                href={`/fixes/${fix.id}`}
                className="group rounded-[24px] border border-ink/10 p-7 flex flex-col hover:border-ink hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${METRIC_STYLE[metric]}`}>{metric}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-ink/40">{fix.category}</span>
                </div>
                <h2 className="font-display text-xl font-extrabold mt-5 leading-snug">{fix.title}</h2>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed line-clamp-3">{fix.whyItMatters}</p>
                {variants.length > 0 && (
                  <p className="mt-auto pt-5 text-xs text-ink/50">
                    Steps for: <span className="font-semibold text-ink/70">{variants.join(", ")}</span>
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
      <ScanCta />
    </PageShell>
  );
}
