export interface StaticTip {
  title: string;
  body: string;
}

export const STATIC_TIPS: StaticTip[] = [
  {
    title: "Put a CDN in front of your site",
    body: "Route traffic through Cloudflare (free plan works) or Fastly. A CDN serves your pages from a data center near your visitor instead of your origin server, cutting hundreds of milliseconds off the first byte. Point your domain's nameservers at Cloudflare, enable the orange cloud, and turn on 'Auto Minify' and 'Brotli' in the Speed tab.",
  },
  {
    title: "Serve images through an image CDN with modern formats",
    body: "Images are usually 60-80% of a page's weight. Use an image CDN (Cloudflare Images, Imgix, Cloudinary, or Bunny Optimizer) that auto-converts to WebP or AVIF and resizes on the fly to the device's screen size. A 2MB hero image becomes ~200KB with zero visible quality loss.",
  },
  {
    title: "Turn on HTTP/2 or HTTP/3",
    body: "HTTP/2 lets the browser download dozens of assets over a single connection instead of queuing them. HTTP/3 adds further improvements over unstable networks (mobile). Most hosts enable it with one checkbox — check your host's panel for 'HTTP/2', 'HTTP/3', or 'QUIC'. Cloudflare enables both by default.",
  },
  {
    title: "Set aggressive cache headers on static assets",
    body: "Static files (JS, CSS, fonts, images with hashed filenames) should have a Cache-Control header of at least one year: `Cache-Control: public, max-age=31536000, immutable`. Repeat visitors won't re-download them. HTML should be `no-cache` or short-lived so updates ship instantly.",
  },
  {
    title: "Enable Brotli or gzip compression on text",
    body: "Compressing HTML, JavaScript, CSS, and JSON shrinks them by 70-90% over the wire. Brotli beats gzip by ~15-25% and is supported by every modern browser. Cloudflare, Netlify, Vercel, and most CDNs enable Brotli with one setting. For self-hosted nginx, add `brotli on;` to your server block.",
  },
  {
    title: "Minify and tree-shake JavaScript and CSS",
    body: "Raw source code contains whitespace, comments, and long variable names the browser doesn't need. Bundlers (Vite, esbuild, webpack, Rollup) minify in production builds automatically — make sure you're deploying the production build, not the dev build. For CMS sites, use a cache/optimization plugin that minifies output.",
  },
];
