"use client";

import { useEffect, useState } from "react";
import { AuditResult } from "@/lib/types";

export default function PdfPreviewPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    async function generate() {
      const { generateMakiPdfBlob } = await import("@/lib/makiPdfRenderer");
      
      const dummyAudit: AuditResult = {
        url: "yourdomain.com",
        auditDate: new Date().toISOString(),
        overallVerdict: "fail",
        verdict: "needs-work",
        summaryParagraph: "Your site has some performance issues that are affecting user experience. Addressing the top fixes will improve your Core Web Vitals and search rankings.",
        fieldDataAvailable: true,
        mobileScore: 58,
        desktopScore: 82,
        lighthouseCategories: {
          performance: 58,
          accessibility: 84,
          bestPractices: 91,
          seo: 76,
        },
        siteInfo: {
          detectedPlatform: "wordpress",
          serverSoftware: "Nginx / Cloudflare",
          technologies: ["PHP", "MySQL", "Yoast SEO"],
        },
        cwvScores: {
          lcp: { value: "4.2s", status: "fail", meaning: "Poor LCP" },
          inp: { value: "320ms", status: "fail", meaning: "Needs Improvement INP" },
          cls: { value: "0.05", status: "pass", meaning: "Good CLS" },
        },
        quickWin: {
          title: "Compress your hero image",
          steps: [
            "Download your main hero image.",
            "Run it through TinyPNG or Squoosh.app to reduce file size.",
            "Re-upload the compressed version to your media library.",
            "Ensure the new image is used on the homepage."
          ]
        },
        seoSnippets: [
          {
            title: "Meta Title",
            description: "Used by search engines to understand your page. (48 chars)",
            lang: "html",
            code: `<title>Your Business Name | Best Services in City</title>`
          },
          {
            title: "Meta Description",
            description: "! No meta description found on your site. This is hurting your SEO. Use this as a starting point: (138 chars)",
            lang: "html",
            code: `<meta name="description" content="Looking for top-rated services? We offer the best solutions with guaranteed satisfaction. Call us today for a free quote!" />`
          },
          {
            title: "Open Graph Tags",
            description: "Controls how your site appears when shared on social media.",
            lang: "html",
            code: `<meta property="og:title" content="Your Business Name | Best Services in City" />
<meta property="og:description" content="Looking for top-rated services? We offer the best solutions with guaranteed satisfaction." />
<meta property="og:url" content="https://yourdomain.com/" />`
          },
          {
            title: "Canonical URL",
            description: "Prevents duplicate content issues by telling Google your preferred URL.",
            lang: "html",
            code: `<link rel="canonical" href="https://yourdomain.com/" />`
          },
          {
            title: "JSON-LD Schema",
            description: "Helps Google understand your business and enables rich search results.",
            lang: "html",
            code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your Business Name",
  "url": "https://yourdomain.com/"
}
</script>`
          }
        ],
        checklistAfter: [
          "Clear your site cache and CDN cache.",
          "Check the site on a real mobile device.",
          "Run a new Lighthouse test to verify improvements."
        ],
        topFixes: [
          {
            rank: 1,
            problemHeadline: "Preload your LCP hero image",
            whyItMatters: "Your largest visible element is loading late because the browser doesn't know about it soon enough.",
            whatToDo: "Add a preload link tag to your document head for the main hero image.",
            codeSnippet: `<link rel="preload" as="image" href="/images/hero.webp" fetchpriority="high">`,
            snippetLang: "html",
            resourceUrl: "https://web.dev/optimize-lcp/",
            resourceLabel: "web.dev",
            estimatedImpact: "-1.2s LCP",
          },
          {
            rank: 2,
            problemHeadline: "Reduce unused JavaScript",
            whyItMatters: "Third-party scripts and plugins are blocking the main thread, causing poor interaction times.",
            whatToDo: "Delay the execution of non-essential scripts like live chat and analytics until user interaction.",
            codeSnippet: `// Defer non-critical scripts
document.addEventListener('DOMContentLoaded', function() {
  var script = document.createElement('script');
  script.src = '/js/analytics.js';
  document.body.appendChild(script);
});`,
            snippetLang: "javascript",
            resourceUrl: "https://web.dev/reduce-javascript-payloads-with-code-splitting/",
            resourceLabel: "web.dev",
            estimatedImpact: "-150ms INP",
          },
          {
            rank: 3,
            problemHeadline: "Enable text compression",
            whyItMatters: "Text-based resources are being served uncompressed, increasing transfer times.",
            whatToDo: "Enable GZIP or Brotli compression on your server to shrink file sizes by up to 80%.",
            codeSnippet: `# nginx.conf — enable Brotli
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript;`,
            snippetLang: "nginx",
            resourceUrl: "https://web.dev/uses-text-compression/",
            resourceLabel: "web.dev",
            estimatedImpact: "Easy",
          },
          {
            rank: 4,
            problemHeadline: "Serve images in next-gen formats",
            whyItMatters: "JPEG and PNG formats are larger than WebP or AVIF, wasting bandwidth.",
            whatToDo: "Convert existing images to WebP format and serve them to compatible browsers.",
            codeSnippet: `<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" width="800" height="600" loading="lazy">
</picture>`,
            snippetLang: "html",
            resourceUrl: "https://web.dev/serve-images-webp/",
            resourceLabel: "web.dev",
            estimatedImpact: "-0.5s LCP",
          },
          {
            rank: 5,
            problemHeadline: "Set explicit width and height on images",
            whyItMatters: "Images without dimensions cause the page content to jump when they load.",
            whatToDo: "Always include width and height attributes on your <img> tags to reserve space.",
            codeSnippet: `<img src="/logo.svg" width="200" height="50" alt="Logo">`,
            snippetLang: "html",
            resourceUrl: "https://web.dev/optimize-cls/#images-without-dimensions",
            resourceLabel: "web.dev",
            estimatedImpact: "Medium",
          },
          {
            rank: 6,
            problemHeadline: "Optimize CSS Delivery",
            whyItMatters: "Heavy CSS files are slowing down the rendering process.",
            whatToDo: "Minify your CSS files to remove unnecessary whitespace and comments.",
            codeSnippet: `/* Before: 50KB */
.hero { margin: 0; padding: 20px; }
/* After minification: 35KB */
.hero{margin:0;padding:20px}`,
            snippetLang: "css",
            resourceUrl: "https://web.dev/defer-non-critical-css/",
            resourceLabel: "web.dev",
            estimatedImpact: "Medium",
          },
          {
            rank: 7,
            problemHeadline: "Defer offscreen images",
            whyItMatters: "Images that are not visible immediately are slowing down the initial page load.",
            whatToDo: "Enable lazy loading for all images below the fold.",
            codeSnippet: `<img src="footer-bg.jpg" loading="lazy" width="1920" height="1080" alt="Footer">`,
            snippetLang: "html",
            resourceUrl: "https://web.dev/browser-level-image-lazy-loading/",
            resourceLabel: "web.dev",
            estimatedImpact: "Easy",
          }
        ]
      };

      try {
        const blob = await generateMakiPdfBlob(dummyAudit, dummyAudit.url);
        setPdfUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error("PDF generation error:", err);
      }
    }

    generate();
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return <div className="p-10 text-center text-gray-500">Not available in production.</div>;
  }

  if (!pdfUrl) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Generating preview...</div>;
  }

  return (
    <iframe 
      src={pdfUrl} 
      className="w-full h-screen border-none"
      title="PDF Preview"
    />
  );
}
