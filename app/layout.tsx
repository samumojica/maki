import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://getmaki.app"),
  title: "Maki — Core Web Vitals Checker & Performance Report for $9",
  description:
    "Check your Core Web Vitals for free. Get a tailored, plain-English performance report with exact fixes — no account, no login, no subscription. Better than GTmetrix and DebugBear. One-time $9 payment, instant PDF.",
  keywords: [
    "core web vitals",
    "core web vitals checker",
    "improve core web vitals",
    "pagespeed insights report",
    "website performance audit",
    "LCP INP CLS checker",
    "GTmetrix alternative",
    "DebugBear alternative",
    "web performance report",
  ],
  openGraph: {
    title: "Maki — Check Your Core Web Vitals for Free",
    description:
      "Real data from Google PageSpeed Insights, translated into plain English fixes. No account. No subscription. Tailored to your site.",
    type: "website",
    url: "https://getmaki.app",
    siteName: "Maki",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maki — Core Web Vitals Checker",
    description:
      "Check your Core Web Vitals for free. Get a tailored performance report with exact fixes — no account needed.",
  },
  alternates: {
    canonical: "https://getmaki.app",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.className}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
