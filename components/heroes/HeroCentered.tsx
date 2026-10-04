import Image from "next/image";
import mascot from "@/public/mascot.svg";
import { ScanForm } from "../site/ScanForm";
import { HeroBackdrop, HeroChecklist, HeroLead, HeroTitle, StackStrip } from "./shared";

/**
 * Version B — everything centered. Maki peeks over the scan bar from behind a
 * morphing mint blob, circled by the same dashed orbit as version A.
 *
 * Geometry: the peek window is W wide and W/2 + OVERLAP tall, bottom-aligned
 * OVERLAP px below the top of the scan bar, so the bar hides the rest of the body.
 */
export function HeroCentered() {
  return (
    <section
      id="scan"
      className="relative overflow-hidden bg-ink text-white px-6 pt-16 sm:pt-20 lg:pt-24 pb-16 lg:pb-20 scroll-mt-4"
    >
      <HeroBackdrop focus="50% 30%" />

      <div className="relative max-w-4xl mx-auto text-center">
        <HeroTitle />
        <HeroLead className="mt-7 max-w-2xl mx-auto" />

        <div className="relative mt-[150px] sm:mt-[180px] max-w-2xl mx-auto text-left">
          {/* Dashed orbit — clipped at the bar so it only shows above it */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%-36px)] w-[640px] h-[296px] sm:h-[356px] overflow-hidden"
          >
            <span className="absolute left-1/2 bottom-0 w-[312px] sm:w-[376px] aspect-square -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-dashed border-maki/60 animate-spin-slow" />
          </div>

          {/* Peek window: mint sunrise + Maki */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%-36px)] w-[280px] h-[176px] sm:w-[340px] sm:h-[206px] overflow-hidden"
          >
            <div className="absolute left-0 bottom-0 w-full aspect-square translate-y-1/2 bg-mint rounded-[58%_42%_47%_53%/50%_56%_44%_50%] animate-blob" />
            <Image
              src={mascot}
              alt=""
              loading="eager"
              sizes="(min-width: 640px) 205px, 170px"
              className="absolute left-1/2 -translate-x-1/2 top-[40px] sm:top-[48px] h-[264px] sm:h-[320px] w-auto animate-peek"
            />
          </div>

          {/* Speech bubble */}
          <div className="hidden sm:block absolute left-1/2 ml-[150px] bottom-[calc(100%+96px)] rotate-[4deg] animate-floaty">
            <div className="relative rounded-2xl bg-white text-ink px-4 py-2.5 shadow-2xl font-display font-extrabold whitespace-nowrap">
              Psst… paste your URL
              <span aria-hidden className="absolute -bottom-1.5 left-5 w-4 h-4 bg-white rotate-45 rounded-sm" />
            </div>
          </div>

          {/* Proof chips (illustrative example report) */}
          <div className="hidden lg:block absolute -left-44 bottom-[calc(100%+40px)] rotate-[-6deg] animate-floaty rounded-2xl bg-white text-ink shadow-2xl px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/45">LCP</p>
            <p className="font-display text-2xl font-extrabold leading-none mt-1">
              <span className="text-red-500 line-through decoration-2">4.2s</span> <span className="text-ink/30">→</span>{" "}
              <span className="text-[#2f9e44]">1.8s</span>
            </p>
          </div>
          <div
            className="hidden lg:block absolute -right-48 bottom-[calc(100%-10px)] rotate-[5deg] animate-floaty rounded-2xl bg-maki text-white shadow-2xl px-4 py-3"
            style={{ animationDelay: "1.2s" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Performance</p>
            <p className="font-display text-3xl font-extrabold leading-none mt-1">
              38 <span className="text-white/50 text-xl">→</span> <span className="text-mint">94</span>
            </p>
          </div>

          <div className="relative z-10">
            <ScanForm tone="dark" />
          </div>
        </div>

        <HeroChecklist className="mt-6 justify-center" />
      </div>

      <StackStrip centered />
    </section>
  );
}
