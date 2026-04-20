import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Maki — Core Web Vitals Report for $9",
  description:
    "Google already measured your site. We just tell you what it found. Get a plain English Core Web Vitals report with exact fixes. One-time payment, instant PDF.",
  openGraph: {
    title: "Maki — Core Web Vitals Report for $9",
    description:
      "Real data from Google PageSpeed Insights, translated into plain English fixes. No account. No subscription.",
    type: "website",
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
