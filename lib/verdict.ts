import type { Verdict } from "./types";

export function deriveVerdict(mobileScore: number, desktopScore: number): Verdict {
  const avg = (mobileScore + desktopScore) / 2;
  const min = Math.min(mobileScore, desktopScore);

  if (mobileScore < 50) {
    return avg >= 50 ? "needs-work" : "poor";
  }
  if (avg >= 90 && min >= 75) return "excellent";
  if (avg >= 75 && min >= 50) return "good";
  if (avg >= 50) return "needs-work";
  return "poor";
}

export function verdictLabel(v: Verdict): string {
  switch (v) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "needs-work":
      return "Needs Work";
    case "poor":
      return "Poor";
  }
}

export function verdictSublabel(v: Verdict): string {
  switch (v) {
    case "excellent":
      return "Your site is faster than most of the web.";
    case "good":
      return "Solid performance with some room to improve.";
    case "needs-work":
      return "Real visitors are feeling the slowness.";
    case "poor":
      return "Your site is driving visitors away before they see it.";
  }
}

export function verdictColor(v: Verdict): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  switch (v) {
    case "excellent":
      return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", hex: "#16a34a" };
    case "good":
      return { bg: "bg-[#e8f3fb]", text: "text-[#1e6fb0]", border: "border-[#d1e7f6]", hex: "#268ad8" };
    case "needs-work":
      return { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", hex: "#d97706" };
    case "poor":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", hex: "#dc2626" };
  }
}
