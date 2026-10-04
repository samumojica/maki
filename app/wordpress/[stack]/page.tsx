import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, PageShell, ScanCta } from "@/components/site/PageShell";
import { ScanForm } from "@/components/site/ScanForm";
import { STACK_PAGES, getStack } from "@/lib/seo/stacks";
import { fixMetric, getFix } from "@/lib/seo/fix-meta";
import { SITE_URL, jsonLd } from "@/lib/seo/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return STACK_PAGES.map((s) => ({ stack: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/wordpress/[stack]">): Promise<Metadata> {
  const { stack } = await params;
  const page = getStack(stack);
  if (!page) return {};
  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: `/wordpress/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `${SITE_URL}/wordpress/${page.slug}` },
  };
}

const TILE = ["bg-ink text-white", "bg-maki text-white", "bg-mint text-ink", "bg-deep text-white"];

export default async function StackPage({ params }: PageProps<"/wordpress/[stack]">) {
  const { stack } = await params;
  const page = getStack(stack);
  if (!page) notFound();

  const fixes = page.fixIds.map(getFix).filter((f) => f !== undefined);
  const others = STACK_PAGES.filter((s) => s.slug !== page.slug);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <PageShell>
      <PageHero
        crumbs={[{ name: `${page.name} speed`, href: `/wordpress/${page.slug}` }]}
        eyebrow={`${page.kind} · WordPress`}
        title={page.h1}
        lead={page.intro}
      >
        <div className="mt-10 max-w-xl">
          <ScanForm tone="dark" />
        </div>
      </PageHero>

      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl font-extrabold tracking-tight max-w-2xl leading-[1.05]">
            What usually slows down {page.name} sites
          </h2>
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {page.painPoints.map((p, i) => (
              <div key={p.title} className={`rounded-[24px] p-7 ${TILE[i % TILE.length]}`}>
                <span className="font-display text-5xl font-extrabold opacity-40">0{i + 1}</span>
                <h3 className="font-display text-2xl font-extrabold mt-4">{p.title}</h3>
                <p className="mt-3 leading-relaxed opacity-80">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-paper">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl font-extrabold tracking-tight leading-[1.05]">Step-by-step fixes</h2>
          <p className="mt-3 text-ink/60 max-w-2xl">The fixes Maki most often recommends on {page.name} sites.</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {fixes.map((fix) => (
              <Link key={fix.id} href={`/fixes/${fix.id}`} className="group rounded-[20px] bg-white border border-ink/10 p-6 hover:border-ink transition-colors">
                <span className="text-xs font-extrabold text-maki">{fixMetric(fix)}</span>
                <h3 className="font-display text-lg font-extrabold mt-2 leading-snug">{fix.title}</h3>
                <span className="mt-4 inline-block text-sm font-bold group-hover:translate-x-1 transition-transform">Read the fix →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-extrabold tracking-tight">{page.name} speed FAQ</h2>
          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {page.faq.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="font-display text-lg font-bold">{f.q}</h3>
                <p className="mt-2 text-ink/65 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-ink/50">
            Also see:{" "}
            {others.map((o, i) => (
              <span key={o.slug}>
                <Link href={`/wordpress/${o.slug}`} className="font-semibold text-ink/70 hover:text-maki">
                  {o.name}
                </Link>
                {i < others.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </div>
      </section>

      <ScanCta heading={`Scan your ${page.name} site free.`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />
    </PageShell>
  );
}
