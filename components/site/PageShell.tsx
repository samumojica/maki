import Link from "next/link";
import Image from "next/image";
import mascot from "@/public/mascot.svg";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ScanForm } from "./ScanForm";
import { SITE_URL, jsonLd } from "@/lib/seo/site";

export interface Crumb {
  name: string;
  href: string;
}

/** Visible breadcrumbs + BreadcrumbList JSON-LD. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.href === "/" ? "" : c.href}`,
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-white/50">
      <ol className="flex flex-wrap items-center gap-2">
        {all.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {i === all.length - 1 ? (
              <span className="text-white/80">{c.name}</span>
            ) : (
              <Link href={c.href} className="hover:text-mint transition-colors">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
    </nav>
  );
}

/** Dark hero band used by every SEO page. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white px-6 pt-8 pb-20">
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] w-[560px] h-[560px] rounded-full bg-maki/25 blur-[120px]" />
      <div className="relative max-w-6xl mx-auto">
        <Breadcrumbs items={crumbs} />
        <div className="max-w-3xl mt-12">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint mb-4">{eyebrow}</p>}
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] leading-[1]">{title}</h1>
          {lead && <p className="mt-6 text-lg sm:text-xl text-white/65 leading-relaxed">{lead}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}

/** Conversion block placed at the end of every SEO page. */
export function ScanCta({ heading = "Find out which of these your site has." }: { heading?: string }) {
  return (
    <section className="px-6 py-20 bg-mint">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1] text-ink">{heading}</h2>
          <p className="mt-4 text-lg text-ink/70">Free scan with real Google data. Exact fixes for your plugins.</p>
          <div className="mt-8">
            <ScanForm tone="light" id="url-input-cta" />
          </div>
        </div>
        <Image src={mascot} alt="" sizes="170px" className="hidden md:block w-[170px] h-auto" />
      </div>
    </section>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col bg-white text-ink">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
