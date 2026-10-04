"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../Logo";

interface NavLink {
  href: string;
  label: string;
}

export function MobileMenu({
  nav,
  stacks,
  tone = "dark",
}: {
  nav: NavLink[];
  stacks: NavLink[];
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when navigating to another page
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className={`ml-1 w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
          tone === "dark" ? "border-white/15 text-white hover:bg-white/10" : "border-ink/15 text-ink hover:bg-ink/5"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          {open ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 bg-ink text-white overflow-y-auto px-6 pb-10"
        >
          <div className="flex items-center justify-between h-20 border-b border-white/10">
            <Link href="/" onClick={close} aria-label="Maki home">
              <Logo className="h-7 w-auto" color="#ffffff" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/15 text-white hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="pt-4" />
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex items-center justify-between py-4 font-display text-2xl font-extrabold border-b border-white/10 hover:text-mint transition-colors"
                  >
                    {item.label}
                    <span aria-hidden className="text-white/30">→</span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-8 mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/40">Speed up</p>
            <ul className="flex flex-wrap gap-2">
              {stacks.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={close}
                    className="inline-block rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-mint hover:text-mint transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/#scan"
            onClick={close}
            className="mt-10 block text-center rounded-2xl bg-mint text-ink font-bold py-4 text-lg"
          >
            Scan my site free →
          </Link>
          <a href="mailto:support@getmaki.app" className="mt-6 block text-center text-sm text-white/50">
            support@getmaki.app
          </a>
        </div>
      )}
    </div>
  );
}
