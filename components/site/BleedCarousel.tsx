"use client";

import { useRef, type ReactNode } from "react";

/**
 * Horizontal carousel whose left edge lines up with the page container and whose
 * right edge bleeds off the viewport — hinting there is more to scroll.
 */
export function BleedCarousel({
  eyebrow,
  title,
  description,
  tone = "light",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  tone?: "light" | "dark";
  children: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dark = tone === "dark";

  function scrollBy(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  const btn = `w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
    dark ? "border-white/20 text-white hover:bg-white hover:text-ink" : "border-ink text-ink hover:bg-ink hover:text-white"
  }`;

  return (
    <div>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-3 ${dark ? "text-mint" : "text-maki"}`}>{eyebrow}</p>
          <h2 className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] ${dark ? "text-white" : "text-ink"}`}>
            {title}
          </h2>
          {description && <p className={`mt-4 text-lg ${dark ? "text-white/60" : "text-ink/60"}`}>{description}</p>}
        </div>
        <div className="flex gap-3 shrink-0">
          <button type="button" aria-label="Previous" onClick={() => scrollBy(-1)} className={btn}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button type="button" aria-label="Next" onClick={() => scrollBy(1)} className={btn}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={track}
        className="bleed-right no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
      >
        {children}
        {/* spacer so the last card can snap with breathing room */}
        <div aria-hidden className="shrink-0 w-px" />
      </div>
    </div>
  );
}
