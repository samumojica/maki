import Link from "next/link";
import { Logo } from "../Logo";
import { MobileMenu } from "./MobileMenu";
import { STACK_PAGES } from "@/lib/seo/stacks";

const NAV = [
  { href: "/fixes", label: "Fix library" },
  { href: "/guides", label: "Guides" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <header className={`px-6 py-5 ${dark ? "bg-ink text-white" : "bg-white text-ink border-b border-ink/10"}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
        <Link href="/" aria-label="Maki home">
          <Logo className="h-7 w-auto" color={dark ? "#ffffff" : "#268ad8"} />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hidden sm:inline-block px-3 py-2 rounded-lg transition-colors ${
                dark ? "text-white/70 hover:text-white" : "text-ink/60 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#scan"
            className="ml-2 px-4 py-2 rounded-xl bg-mint text-ink font-bold hover:brightness-95 transition"
          >
            Free scan
          </Link>
          <MobileMenu
            nav={NAV}
            stacks={STACK_PAGES.map((s) => ({ href: `/wordpress/${s.slug}`, label: s.name }))}
            tone={tone}
          />
        </nav>
      </div>
    </header>
  );
}
