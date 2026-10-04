import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, PageShell, ScanCta } from "@/components/site/PageShell";
import { WP_FIX_LIBRARY } from "@/lib/wp-fixes";
import { PLUGIN_NAMES, fixMetric, getFix } from "@/lib/seo/fix-meta";
import { STACK_PAGES } from "@/lib/seo/stacks";
import { SITE_URL, jsonLd } from "@/lib/seo/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return WP_FIX_LIBRARY.map((f) => ({ slug: f.id }));
}

export async function generateMetadata({ params }: PageProps<"/fixes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const fix = getFix(slug);
  if (!fix) return {};
  const plugins = Object.keys(fix.variants ?? {}).map((k) => PLUGIN_NAMES[k] ?? k);
  return {
    title: `${fix.title} — WordPress Fix`,
    description: `${fix.whyItMatters} Step-by-step WordPress fix${plugins.length ? ` with exact settings for ${plugins.slice(0, 3).join(", ")}` : ""}.`,
    alternates: { canonical: `/fixes/${fix.id}` },
  };
}

export default async function FixPage({ params }: PageProps<"/fixes/[slug]">) {
  const { slug } = await params;
  const fix = getFix(slug);
  if (!fix) notFound();

  const variants = Object.entries(fix.variants ?? {});
  const relatedStacks = STACK_PAGES.filter((s) => s.fixIds.includes(fix.id));
  const related = WP_FIX_LIBRARY.filter((f) => f.id !== fix.id && fixMetric(f) === fixMetric(fix)).slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: fix.title,
    description: fix.whyItMatters,
    url: `${SITE_URL}/fixes/${fix.id}`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: ["WordPress", "Core Web Vitals", fixMetric(fix)],
  };

  return (
    <PageShell>
      <PageHero
        crumbs={[
          { name: "Fix library", href: "/fixes" },
          { name: fix.title, href: `/fixes/${fix.id}` },
        ]}
        eyebrow={`${fixMetric(fix)} · ${fix.impact} impact`}
        title={fix.title}
        lead={fix.problem}
      />

      <article className="px-6 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_300px] gap-14">
          <div className="prose-maki max-w-none">
            <h2>Why it matters</h2>
            <p>{fix.whyItMatters}</p>

            <h2>How to fix it in WordPress</h2>
            <ol>
              {fix.genericWordPressSteps.map((s) => (
                <li key={s.order}>{s.instruction}</li>
              ))}
            </ol>

            {variants.length > 0 && (
              <>
                <h2>Plugin-specific steps</h2>
                <p>Already using one of these plugins? Follow the exact steps for your setup.</p>
                {variants.map(([key, v]) => (
                  <section key={key} id={key} className="not-prose mt-6 rounded-[20px] border border-ink/10 p-6 scroll-mt-6">
                    <h3 className="font-display text-xl font-extrabold text-ink">{PLUGIN_NAMES[key] ?? key}</h3>
                    <ol className="mt-4 space-y-3">
                      {v!.steps.map((s) => (
                        <li key={s.order} className="flex gap-3 text-ink/75 leading-relaxed">
                          <span className="w-6 h-6 rounded-full bg-maki text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {s.order}
                          </span>
                          <span>{s.instruction}</span>
                        </li>
                      ))}
                    </ol>
                    {v!.notes?.map((n) => (
                      <p key={n} className="mt-4 text-sm text-ink/60 bg-paper rounded-xl px-4 py-3">
                        {n}
                      </p>
                    ))}
                  </section>
                ))}
              </>
            )}

            <h2>How to verify the fix</h2>
            <ul>
              {fix.verification.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>

            {fix.caution && fix.caution.length > 0 && (
              <>
                <h2>Be careful</h2>
                <ul>
                  {fix.caution.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 self-start">
            <div className="rounded-[24px] bg-ink text-white p-6">
              <p className="font-display text-xl font-extrabold">Does your site have this problem?</p>
              <p className="text-sm text-white/60 mt-2">Run a free scan and Maki will tell you — and which plugin setting fixes it.</p>
              <Link href="/#scan" className="mt-5 block text-center rounded-xl bg-mint text-ink font-bold py-3 hover:brightness-95">
                Scan my site free
              </Link>
            </div>
            {variants.length > 0 && (
              <nav className="rounded-[24px] border border-ink/10 p-6" aria-label="Jump to plugin">
                <p className="text-xs font-bold uppercase tracking-widest text-ink/45 mb-3">Jump to plugin</p>
                <ul className="space-y-2 text-sm font-semibold">
                  {variants.map(([key]) => (
                    <li key={key}>
                      <a href={`#${key}`} className="hover:text-maki">
                        {PLUGIN_NAMES[key] ?? key}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {relatedStacks.length > 0 && (
              <div className="rounded-[24px] border border-ink/10 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-ink/45 mb-3">Common on</p>
                <ul className="space-y-2 text-sm font-semibold">
                  {relatedStacks.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/wordpress/${s.slug}`} className="hover:text-maki">
                        {s.name} sites →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <div className="max-w-6xl mx-auto mt-20">
            <h2 className="font-display text-3xl font-extrabold mb-6">Related {fixMetric(fix)} fixes</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link key={r.id} href={`/fixes/${r.id}`} className="rounded-[20px] bg-paper p-6 font-display text-lg font-extrabold hover:bg-mint-soft transition-colors">
                  {r.title} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <ScanCta />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
    </PageShell>
  );
}
