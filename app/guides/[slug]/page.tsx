import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, PageShell, ScanCta } from "@/components/site/PageShell";
import { GUIDES, getGuide } from "@/lib/seo/guides";
import { SITE_URL, jsonLd } from "@/lib/seo/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/guides/${guide.slug}`,
      publishedTime: guide.published,
      modifiedTime: guide.updated,
    },
  };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const more = GUIDES.filter((g) => g.slug !== guide.slug);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    url: `${SITE_URL}/guides/${guide.slug}`,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <PageShell>
      <PageHero
        crumbs={[
          { name: "Guides", href: "/guides" },
          { name: guide.tag, href: `/guides/${guide.slug}` },
        ]}
        eyebrow={`${guide.tag} · ${guide.readingMinutes} min read`}
        title={guide.title}
        lead={guide.description}
      >
        <p className="mt-6 text-sm text-white/40">
          Updated{" "}
          <time dateTime={guide.updated}>
            {new Date(guide.updated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
          </time>
        </p>
      </PageHero>

      <article className="px-6 py-16">
        <div className="max-w-3xl mx-auto prose-maki text-lg">{guide.body}</div>
      </article>

      {more.length > 0 && (
        <section className="px-6 pb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-extrabold mb-5">Keep reading</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {more.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="rounded-[20px] bg-paper p-6 font-display text-lg font-extrabold hover:bg-mint-soft transition-colors">
                  {g.title} →
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ScanCta />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
    </PageShell>
  );
}
