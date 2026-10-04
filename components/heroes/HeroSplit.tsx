import Image from "next/image";
import mascot from "@/public/mascot.svg";
import { ScanForm } from "../site/ScanForm";
import { HeroBackdrop, HeroChecklist, HeroLead, HeroTitle, StackStrip } from "./shared";

/** Version A — headline left, mascot on a mint blob to the right. */
export function HeroSplit() {
  return (
    <section id="scan" className="relative overflow-hidden bg-ink text-white px-6 pt-16 sm:pt-20 lg:pt-28 pb-16 lg:pb-20 scroll-mt-4">
      <HeroBackdrop />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-14 lg:gap-6 items-center">
        <div>
          <HeroTitle />
          <HeroLead className="mt-8 max-w-xl" />
          <div className="mt-10 max-w-xl">
            <ScanForm tone="dark" />
            <HeroChecklist className="mt-5" />
          </div>
        </div>

        {/* Mascot composition */}
        <div className="relative mx-auto w-[300px] h-[360px] sm:w-[420px] sm:h-[480px]">
          <div
            aria-hidden
            className="absolute inset-0 bg-mint rounded-[58%_42%_47%_53%/50%_56%_44%_50%]"
          />
          <div
            aria-hidden
            className="absolute -inset-3 sm:-inset-4 rounded-full border-2 border-dashed border-maki/60 animate-spin-slow"
          />
          <Image
            src={mascot}
            alt="Maki, the WordPress speed mascot, walking with a thumbs up"
            loading="eager"
            sizes="(min-width: 640px) 270px, 195px"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[305px] sm:h-[420px] w-auto animate-floaty"
          />

          {/* Floating proof chips (illustrative example report) */}
          <div className="absolute -left-4 sm:-left-14 -top-2 sm:top-0 animate-floaty rounded-2xl bg-white text-ink shadow-2xl px-4 py-3 rotate-[-4deg]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/45">LCP</p>
            <p className="font-display text-2xl font-extrabold leading-none mt-1">
              <span className="text-red-500 line-through decoration-2">4.2s</span>{" "}
              <span className="text-ink/30">→</span> <span className="text-[#2f9e44]">1.8s</span>
            </p>
          </div>
          <div
            className="absolute -right-2 sm:-right-8 bottom-10 sm:bottom-16 animate-floaty rounded-2xl bg-maki text-white shadow-2xl px-4 py-3 rotate-[5deg]"
            style={{ animationDelay: "1.2s" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Performance</p>
            <p className="font-display text-3xl font-extrabold leading-none mt-1">
              38 <span className="text-white/50 text-xl">→</span> <span className="text-mint">94</span>
            </p>
          </div>
          <div
            className="absolute left-2 sm:-left-6 -bottom-4 animate-floaty rounded-full bg-white/95 text-ink shadow-xl px-3.5 py-2 text-xs font-bold flex items-center gap-2"
            style={{ animationDelay: "2.4s" }}
          >
            <span className="w-2 h-2 rounded-full bg-maki" />
            Perfmatters detected
          </div>
        </div>
      </div>

      <StackStrip />
    </section>
  );
}
