"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const STEPS = [
  { label: "Verifying your access…", duration: 1500 },
  { label: "Unlocking Lighthouse performance data…", duration: 4000 },
  { label: "Generating stack-tailored fix snippets…", duration: 5000 },
  { label: "Preparing your actionable PDF report…", duration: 4000 },
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      const timer = setTimeout(() => {
        setCurrentStep(i);
      }, elapsed);
      timers.push(timer);
      elapsed += step.duration;
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 sm:p-12 shadow-2xl shadow-gray-200/50 text-center border border-gray-100">
        <Logo className="h-8 w-auto mx-auto mb-10 opacity-30" />
        
        {/* Modern Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-10">
          <div className="absolute inset-0 border-4 border-blue-50 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#268ad8] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#268ad8] uppercase tracking-tighter">
            Audit
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#282f42] mb-8 tracking-tight">
          Crafting your report
        </h1>

        {/* Steps */}
        <div className="space-y-4 text-left">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 text-sm transition-all duration-700 ${
                i < currentStep
                  ? "opacity-30 scale-95"
                  : i === currentStep
                  ? "opacity-100 scale-100"
                  : "opacity-10"
              }`}
            >
              <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                {i < currentStep ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : i === currentStep ? (
                  <div className="w-6 h-6 rounded-full border-2 border-[#268ad8] border-t-transparent animate-spin" />
                ) : (
                  <div className="w-2 h-2 bg-gray-200 rounded-full ml-2" />
                )}
              </div>
              <span className={i === currentStep ? "text-[#282f42] font-bold" : "text-gray-400 font-medium"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col items-center gap-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
            Analysis Powered By
          </p>
          <div className="flex items-center gap-6 grayscale opacity-40">
            <img 
              src="/assets/lighthouse.svg" 
              alt="Lighthouse" 
              className="h-6 w-auto"
            />
            <img 
              src="/assets/google.svg" 
              alt="Google" 
              className="h-4 w-auto"
            />
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mt-8 font-medium animate-pulse">
        Generating high-fidelity PDF fixes...
      </p>
    </div>
  );
}
