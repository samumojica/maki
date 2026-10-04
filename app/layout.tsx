import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { SITE_NAME, SITE_URL, jsonLd } from "@/lib/seo/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      email: "support@getmaki.app",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Maki — Fix what's slowing down your WordPress site",
    template: "%s | Maki",
  },
  description:
    "See what's slowing down your WordPress site, then get step-by-step fixes tailored to your setup. No account or subscription required.",
  keywords: [
    "wordpress performance",
    "core web vitals",
    "pagespeed insights",
    "wordpress speed optimization",
    "speed up wordpress site",
    "wordpress lcp fix",
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
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${bricolage.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationSchema)} />
      </body>
    </html>
  );
}
