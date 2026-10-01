import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://getmaki.app"),
  title: "Maki — Fix what's slowing down your WordPress site.",
  description:
    "See what's slowing down your WordPress site, then get step-by-step fixes tailored to your setup. No account or subscription required.",
  keywords: [
    "wordpress performance",
    "core web vitals",
    "pagespeed insights",
    "wordpress speed optimization"
  ],
  openGraph: {
    title: "Maki — WordPress Performance Fixer",
    description:
      "Fix what's slowing down your WordPress site. Get exact step-by-step instructions for your specific setup.",
    type: "website",
    url: "https://getmaki.app",
    siteName: "Maki",
    images: [
      {
        url: "/social.png",
        width: 1200,
        height: 630,
        alt: "Maki — WordPress Performance Fixer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maki — WordPress Performance Fixer",
    description:
      "Fix what's slowing down your WordPress site. Get exact step-by-step instructions for your specific setup.",
    images: ["/social.png"],
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
