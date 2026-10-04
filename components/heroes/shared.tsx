import Link from "next/link";
import { STACK_PAGES } from "@/lib/seo/stacks";

/** Navy glows + faint grid behind the hero. `focus` moves the grid's bright spot. */
export function HeroBackdrop({ focus = "60% 40%" }: { focus?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-40 right-[-10%] w-[640px] h-[640px] rounded-full bg-maki/30 blur-[120px]" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[520px] h-[520px] rounded-full bg-mint/15 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: `radial-gradient(ellipse at ${focus}, black 30%, transparent 75%)`,
        }}
      />
    </div>
  );
}

export function HeroTitle({ className = "" }: { className?: string }) {
  return (
    <h1
      className={`font-display font-extrabold tracking-[-0.035em] leading-[0.98] text-[2.6rem] sm:text-6xl lg:text-[4.6rem] ${className}`}
    >
      Fix what&apos;s slowing down your{" "}
      <span className="whitespace-nowrap">
        <span className="relative inline-block text-mint">
          WordPress
          <svg
            aria-hidden
            viewBox="0 0 300 20"
            preserveAspectRatio="none"
            className="absolute left-0 -bottom-2 w-full h-3 text-maki"
          >
            <path d="M2 14 C 60 2, 120 2, 160 10 S 260 18, 298 6" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
          </svg>
        </span>{" "}
        site.
      </span>
    </h1>
  );
}

export function HeroLead({ className = "" }: { className?: string }) {
  return (
    <p className={`text-lg sm:text-xl text-white/65 leading-relaxed ${className}`}>
      Paste your URL. Maki scans it with Google PageSpeed Insights, detects your theme and plugins, and tells you{" "}
      <strong className="text-white font-semibold">exactly which setting to change</strong> — in the tools you already
      use.
    </p>
  );
}

export function HeroChecklist({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55 ${className}`}>
      {["Free scan", "No account", "No plugin to install", "$9 once for the fix plan"].map((t) => (
        <li key={t} className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function StackStrip({ centered = false }: { centered?: boolean }) {
  return (
    <div
      className={`relative max-w-6xl mx-auto mt-10 lg:mt-12 pt-8 border-t border-white/10 flex flex-col gap-4 ${
        centered ? "items-center text-center" : "md:flex-row md:items-center md:gap-8"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 shrink-0">Exact steps for</p>
      <div className={`flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}>
        {STACK_PAGES.map((s) => (
          <Link
            key={s.slug}
            href={`/wordpress/${s.slug}`}
            className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-white/80 hover:border-mint hover:text-mint transition-colors"
          >
            {s.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
