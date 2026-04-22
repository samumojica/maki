import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://getmaki.app"

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/scan/', '/results/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended'],
        allow: '/',
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
