import { FAQ_ITEMS } from "@/lib/faq-data";

export function SchemaMarkup() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Maki",
    url: "https://getmaki.app",
    description: "WordPress performance fixer that gives you tailored, step-by-step instructions to improve your Core Web Vitals.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    brand: {
      "@type": "Brand",
      "name": "Maki",
      "logo": "https://getmaki.app/assets/lighthouse.svg"
    },
    offers: {
      "@type": "Offer",
      price: "9.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: {
      "@type": "Organization",
      "name": "Maki",
      "url": "https://getmaki.app"
    },
    browserRequirements: "Requires Chrome, Firefox, Safari, or Edge",
    featureList: [
      "Core Web Vitals Audit (LCP, INP, CLS)",
      "Lighthouse Performance Scoring",
      "Tailored WordPress Fixes",
      "Interactive Dashboard",
      "Manual Re-testing"
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    </>
  );
}
