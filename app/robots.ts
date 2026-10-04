import { MetadataRoute } from 'next'

// Private, per-user or internal routes. Repeated for every group: a crawler that
// matches a named group ignores the '*' rules entirely.
const PRIVATE_PATHS = ['/scan/', '/results/', '/report/', '/pdf-preview', '/api/', '/preview/', '/dev/']

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://getmaki.app"

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended'],
        allow: '/',
        disallow: PRIVATE_PATHS,
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
