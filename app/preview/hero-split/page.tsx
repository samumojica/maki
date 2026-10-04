import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

// Previous hero (version A: headline left, mascot on a mint blob right), kept for reference.
// Not indexed; canonical points home.
export const metadata: Metadata = {
  title: "Hero A preview",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function HeroSplitPreview() {
  return <LandingPage hero="split" />;
}
