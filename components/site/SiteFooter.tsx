import Link from "next/link";
import { Logo } from "../Logo";
import { LegalLinks } from "./LegalLinks";
import { STACK_PAGES } from "@/lib/seo/stacks";
import { GUIDES } from "@/lib/seo/guides";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white/60 px-6 pt-16 pb-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 flex flex-col gap-4">
          <Link href="/" aria-label="Maki home" className="self-start">
            <Logo className="h-6 w-auto" color="#ffffff" />
          </Link>
          <p className="text-sm max-w-xs">
            WordPress performance fixer. Free Core Web Vitals scan, then exact fixes for your theme and plugins.
          </p>
          <p className="text-[11px] text-white/40 max-w-xs mt-2">
            Not affiliated with, endorsed by, or associated with Google or WordPress.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <h3 className="text-white font-semibold mb-1">Speed up</h3>
          {STACK_PAGES.map((s) => (
            <Link key={s.slug} href={`/wordpress/${s.slug}`} className="hover:text-mint transition-colors">
              {s.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <h3 className="text-white font-semibold mb-1">Learn</h3>
          <Link href="/fixes" className="hover:text-mint transition-colors">
            Fix library
          </Link>
          <Link href="/guides" className="hover:text-mint transition-colors">
            All guides
          </Link>
          {GUIDES.slice(0, 3).map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="hover:text-mint transition-colors">
              {g.title.split(":")[0].split("?")[0]}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <h3 className="text-white font-semibold mb-1">Company</h3>
          <Link href="/#pricing" className="hover:text-mint transition-colors">
            Pricing
          </Link>
          <LegalLinks />
          <a href="mailto:support@getmaki.app" className="hover:text-mint transition-colors">
            support@getmaki.app
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-14 pt-8 border-t border-white/10 text-xs">
        © {new Date().getFullYear()} Maki. All rights reserved.
      </div>
    </footer>
  );
}
