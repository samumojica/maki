"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Verifying payment…", duration: 1500 },
  { label: "Fetching PageSpeed data from Google…", duration: 8000 },
  { label: "Running analysis…", duration: 3000 },
  { label: "Generating your report…", duration: 4000 },
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-[#268ad8] rounded-full animate-spin" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-opacity duration-500 ${
                i < currentStep
                  ? "opacity-40"
                  : i === currentStep
                  ? "opacity-100"
                  : "opacity-20"
              }`}
            >
              <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                {i < currentStep ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === currentStep ? (
                  <div className="w-2 h-2 bg-[#268ad8] rounded-full animate-pulse" />
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                )}
              </span>
              <span className={i === currentStep ? "text-[#282f42] font-medium" : "text-gray-500"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8">
          This usually takes 15–25 seconds.
        </p>
      </div>
    </div>
  );
}
