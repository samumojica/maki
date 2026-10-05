import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { WP_FIX_LIBRARY } from "@/lib/wp-fixes";
import { STACK_PAGES } from "@/lib/seo/stacks";
import { GUIDES } from "@/lib/seo/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/fixes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/done-for-you`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...STACK_PAGES.map((s) => ({
      url: `${SITE_URL}/wordpress/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...WP_FIX_LIBRARY.map((f) => ({
      url: `${SITE_URL}/fixes/${f.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
