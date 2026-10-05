// "Done for you" services: we fix the site, or build a new fast WordPress site.

export type LeadType = "fix" | "build";

export interface ServiceOffer {
  type: LeadType;
  name: string;
  tagline: string;
  /** Entry price in USD. null shows "Custom quote" until a price is set. */
  fromPrice: number | null;
  includes: string[];
}

export const SERVICES: Record<LeadType, ServiceOffer> = {
  fix: {
    type: "fix",
    name: "We fix your WordPress site",
    tagline: "You keep running your business. We get your Core Web Vitals into the green.",
    fromPrice: null,
    includes: [
      "Full audit with Maki + manual review",
      "Caching, image, CSS and JavaScript optimization",
      "Plugin cleanup and safe configuration",
      "Before / after report with real PageSpeed data",
      "Backup before every change",
    ],
  },
  build: {
    type: "build",
    name: "We build you a fast WordPress site",
    tagline: "No website yet? Launch on WordPress, fast from day one.",
    fromPrice: null,
    includes: [
      "Lightweight theme set up for speed",
      "Mobile-first design that passes Core Web Vitals",
      "On-page SEO basics: titles, schema, sitemap",
      "Caching, image optimization and security configured",
      "Training so you can edit your own content",
    ],
  },
};

export const BUDGETS = ["Under $300", "$300 – $1,000", "$1,000 – $3,000", "$3,000+", "Not sure yet"] as const;

export function priceLabel(offer: ServiceOffer) {
  return offer.fromPrice === null ? "Custom quote" : `From $${offer.fromPrice.toLocaleString("en-US")}`;
}
