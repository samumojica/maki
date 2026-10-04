import { WordPressFix } from "../types";

// How resources are discovered, prioritized and delivered.

export const lcpFetchPriority: WordPressFix = {
  id: "lcp-image-not-prioritized",
  category: "Images",
  title: "Your main image isn't prioritized",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["prioritize-lcp-image"],
    metric: "LCP",
    // Lighthouse 13: lcp-discovery-insight → priorityHinted === false (custom trigger in matcher.ts)
  },
  problem:
    "Your Largest Contentful Paint image doesn't have fetchpriority=\"high\" and isn't preloaded, so the browser downloads it at the same priority as everything else on the page.",
  whyItMatters:
    "Telling the browser which image matters most lets it start downloading that image earlier — often saving several hundred milliseconds of LCP.",
  genericWordPressSteps: [
    { order: 1, instruction: "Find your LCP image in Maki's report (or the 'LCP request discovery' section in PageSpeed Insights)." },
    { order: 2, instruction: "Use your performance plugin's 'preload critical images' option, or add fetchpriority=\"high\" to that image in your theme or page builder." },
    { order: 3, instruction: "Make sure the same image isn't lazy-loaded." },
    { order: 4, instruction: "Clear your page cache." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Preloading." },
        { order: 2, instruction: "Set 'Preload Critical Images' to the number of images above the fold (usually 1 or 2)." },
        { order: 3, instruction: "Under 'Fetch Priority', add the LCP image's filename or CSS class with priority 'high'." },
        { order: 4, instruction: "Go to the Lazy Load tab and set 'Exclude Leading Images' to the same number." },
        { order: 5, instruction: "Save and clear your cache." },
      ],
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Update WP Rocket to the latest version — 3.16+ automatically detects and prioritizes your above-the-fold images." },
        { order: 2, instruction: "Go to Settings → WP Rocket → Dashboard and click 'Clear and preload' so critical images are re-detected." },
        { order: 3, instruction: "If the image is a CSS background, add its URL to Media → 'Excluded images or iframes' so it isn't lazy-loaded." },
      ],
    },
    elementor: {
      steps: [
        { order: 1, instruction: "Go to Elementor → Settings → Features and make sure 'Optimized Image Loading' is active." },
        { order: 2, instruction: "Avoid using a Section/Container background image for the hero — use an Image widget so the browser can discover it early." },
        { order: 3, instruction: "Regenerate CSS & data under Elementor → Tools and clear your cache." },
      ],
    },
  },
  verification: [
    "View the page source and confirm the LCP <img> has fetchpriority=\"high\" (or a matching <link rel=\"preload\">).",
    "Run Maki again and compare LCP.",
  ],
};

export const googleFontsExternal: WordPressFix = {
  id: "google-fonts-external",
  category: "Fonts",
  title: "Google Fonts load from Google's servers",
  impact: "medium",
  appliesWhen: {
    requestPatterns: ["fonts.googleapis.com", "fonts.gstatic.com"],
  },
  problem:
    "Your fonts are downloaded from fonts.googleapis.com and fonts.gstatic.com. The browser has to open connections to two extra domains before it can render text.",
  whyItMatters:
    "Third-party font CSS is render-blocking and adds connection time on mobile. Hosting fonts on your own domain is faster and avoids sending visitor IPs to Google (a GDPR concern in the EU).",
  genericWordPressSteps: [
    { order: 1, instruction: "Install a plugin like 'OMGF (Optimize My Google Fonts)' or use your performance plugin's local fonts option." },
    { order: 2, instruction: "Let it download the fonts to your server and rewrite the font CSS." },
    { order: 3, instruction: "Remove font weights and styles you don't use (most sites only need 2–3)." },
    { order: 4, instruction: "Clear your page cache." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Fonts." },
        { order: 2, instruction: "Toggle on 'Local Google Fonts'." },
        { order: 3, instruction: "Toggle on 'Display Swap'." },
        { order: 4, instruction: "Optionally set 'Limit Subsets' to Latin if your site is in English/Spanish." },
        { order: 5, instruction: "Save and clear your cache." },
      ],
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket → Media." },
        { order: 2, instruction: "Under Fonts, enable 'Self-host Google Fonts' (WP Rocket 3.18+)." },
        { order: 3, instruction: "Save changes and clear the cache." },
      ],
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Go to LiteSpeed Cache → Page Optimization → HTML Settings." },
        { order: 2, instruction: "Turn on 'Load Google Fonts Asynchronously' — or turn on 'Remove Google Fonts' if you host fonts locally with another plugin." },
        { order: 3, instruction: "Save and purge all caches." },
      ],
    },
    autoptimize: {
      steps: [
        { order: 1, instruction: "Go to Settings → Autoptimize → Extra." },
        { order: 2, instruction: "Under 'Google Fonts', choose 'Combine and preload in head (fonts load asynchronously)'." },
        { order: 3, instruction: "Save changes and empty the cache." },
      ],
    },
    elementor: {
      steps: [
        { order: 1, instruction: "Go to Elementor → Settings → Performance (or Advanced on older versions)." },
        { order: 2, instruction: "Set 'Load Google Fonts Locally' to Enable." },
        { order: 3, instruction: "Set 'Google Fonts Load' to Swap." },
        { order: 4, instruction: "Regenerate CSS & data under Elementor → Tools and clear your cache." },
      ],
    },
  },
  verification: ["Reload the page with DevTools → Network open and filter by 'fonts.g' — nothing should appear.", "Check headings and body text still use the right font."],
};

export const heavyEmbeds: WordPressFix = {
  id: "heavy-embeds",
  category: "Third-party",
  title: "YouTube, Vimeo or Google Maps embeds load immediately",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["third-party-facades"],
    requestPatterns: [
      "youtube.com/embed",
      "youtube-nocookie.com/embed",
      "player.vimeo.com",
      "google.com/maps/embed",
      "maps.googleapis.com/maps/api/js",
    ],
  },
  problem:
    "Your page loads a full video player or map on page load. A single YouTube embed pulls in over 1MB of JavaScript before the visitor even presses play.",
  whyItMatters:
    "Embed scripts compete with your own content for bandwidth and the main thread, hurting LCP, Total Blocking Time and INP.",
  genericWordPressSteps: [
    { order: 1, instruction: "Replace each embed with a lightweight preview (a thumbnail image with a play button) that loads the real player only when clicked." },
    { order: 2, instruction: "Plugins like 'WP YouTube Lyte' do this for videos; for maps, use a static map image that links to Google Maps." },
    { order: 3, instruction: "Lazy-load any embeds that are below the fold." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Lazy Load." },
        { order: 2, instruction: "Toggle on 'iFrames and Videos'." },
        { order: 3, instruction: "Toggle on 'YouTube Preview Thumbnails'." },
        { order: 4, instruction: "If the map isn't needed on every page, go to General and toggle 'Disable Google Maps' (with exceptions for your contact page)." },
        { order: 5, instruction: "Save and clear your cache." },
      ],
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket → Media." },
        { order: 2, instruction: "Check 'Enable for iframes and videos'." },
        { order: 3, instruction: "Check 'Replace YouTube iframe with preview image'." },
        { order: 4, instruction: "Save changes." },
      ],
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Go to LiteSpeed Cache → Page Optimization → Media Settings." },
        { order: 2, instruction: "Turn on 'Lazy Load Iframes'." },
        { order: 3, instruction: "Save and purge all caches." },
      ],
    },
  },
  verification: ["Reload the page with DevTools → Network open: no youtube.com or maps requests should appear until you click the embed."],
};

export const criticalRequestChains: WordPressFix = {
  id: "critical-request-chains",
  category: "Loading",
  title: "Long chains of critical requests",
  impact: "medium",
  appliesWhen: {
    lighthouseAuditIds: ["uses-rel-preconnect"],
    metric: "LCP",
    // Lighthouse 13: network-dependency-tree-insight longest chain > 2s (custom trigger in matcher.ts)
  },
  problem:
    "The browser discovers important files (fonts, CSS, scripts from other domains) only after downloading other files first, creating a chain of sequential requests before the page can render.",
  whyItMatters: "Each link in the chain is a round-trip on a mobile connection. Long chains delay First Contentful Paint and LCP.",
  genericWordPressSteps: [
    { order: 1, instruction: "Add preconnect hints for the third-party domains your page needs early (for example your CDN or font host)." },
    { order: 2, instruction: "Preload the one or two fonts used above the fold." },
    { order: 3, instruction: "Remove @import rules from your theme CSS — they create chains." },
    { order: 4, instruction: "Reduce the number of separate CSS files with your optimization plugin." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Preloading." },
        { order: 2, instruction: "Under 'Preconnect', add the origins from Maki's report (e.g. your CDN domain). Check 'crossorigin' for font domains." },
        { order: 3, instruction: "Under 'Preload', add your main above-the-fold font file (.woff2) as type 'font'." },
        { order: 4, instruction: "Save and clear your cache." },
      ],
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Go to LiteSpeed Cache → Page Optimization → HTML Settings." },
        { order: 2, instruction: "Add the third-party domains to 'DNS Preconnect'." },
        { order: 3, instruction: "Save and purge all caches." },
      ],
    },
    autoptimize: {
      steps: [
        { order: 1, instruction: "Go to Settings → Autoptimize → Extra." },
        { order: 2, instruction: "Add the domains to 'Preconnect to 3rd party domains'." },
        { order: 3, instruction: "Add your main font file URL to 'Preload specific requests'." },
        { order: 4, instruction: "Save and empty the cache." },
      ],
    },
  },
  verification: ["Run Maki again — the 'Network dependency tree' insight should show a shorter longest chain."],
  caution: ["Only preconnect to 2–4 domains and preload 1–2 files. Too many hints compete with each other and make things slower."],
};

export const textCompression: WordPressFix = {
  id: "text-compression",
  category: "Server",
  title: "Text files are sent uncompressed",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["uses-text-compression"],
    // Lighthouse 13: document-latency-insight → usesCompression === false (custom trigger in matcher.ts)
  },
  problem: "Your server is sending HTML, CSS or JavaScript without Gzip or Brotli compression.",
  whyItMatters: "Compression typically shrinks text files by 70–80%. Without it, every page takes noticeably longer to download, especially on mobile.",
  genericWordPressSteps: [
    { order: 1, instruction: "Ask your host to enable Gzip or Brotli compression — most do this in one click from the hosting panel." },
    { order: 2, instruction: "If you use Cloudflare, compression is applied automatically for proxied (orange-cloud) traffic." },
    { order: 3, instruction: "On Apache hosting, your caching plugin can add compression rules to .htaccess." },
  ],
  variants: {
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "On Apache servers WP Rocket adds Gzip rules to .htaccess automatically when activated." },
        { order: 2, instruction: "Deactivate and reactivate WP Rocket to rewrite the rules if they're missing." },
        { order: 3, instruction: "On Nginx, ask your host to enable gzip — WP Rocket can't change Nginx config." },
      ],
    },
    "w3-total-cache": {
      steps: [
        { order: 1, instruction: "Go to Performance → Browser Cache." },
        { order: 2, instruction: "Check 'Enable HTTP (gzip) compression' (and Brotli if available) for CSS & JS, HTML & XML and other files." },
        { order: 3, instruction: "Save all settings and purge caches." },
      ],
    },
  },
  verification: ["In DevTools → Network, click the HTML document and confirm the 'content-encoding' response header is 'br' or 'gzip'."],
};

export const cachePolicy: WordPressFix = {
  id: "static-cache-policy",
  category: "Server",
  title: "Static files have a short browser cache",
  impact: "medium",
  appliesWhen: {
    // Custom trigger in matcher.ts: cache-insight / uses-long-cache-ttl, first-party files only
  },
  problem: "Images, CSS, JavaScript or fonts on your site are served with short or missing cache headers, so returning visitors download them again.",
  whyItMatters: "Long cache lifetimes make repeat visits and multi-page sessions much faster, which improves real-user Core Web Vitals.",
  genericWordPressSteps: [
    { order: 1, instruction: "Enable browser caching in your caching plugin or hosting panel." },
    { order: 2, instruction: "Set a cache lifetime of at least 1 year for versioned static files (CSS, JS, fonts, images)." },
    { order: 3, instruction: "If the flagged files come from third parties (analytics, chat widgets), you can't change their headers — delay or remove those scripts instead." },
  ],
  variants: {
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "On Apache, WP Rocket adds browser caching rules to .htaccess automatically." },
        { order: 2, instruction: "Deactivate and reactivate WP Rocket to rewrite the rules if they're missing." },
        { order: 3, instruction: "On Nginx, ask your host to add 'expires 1y' for static assets." },
      ],
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Go to LiteSpeed Cache → Cache → Browser." },
        { order: 2, instruction: "Turn on 'Browser Cache' and set 'Browser Cache TTL' to 31557600 (1 year)." },
        { order: 3, instruction: "Save and purge all caches." },
      ],
    },
    "w3-total-cache": {
      steps: [
        { order: 1, instruction: "Go to Performance → Browser Cache." },
        { order: 2, instruction: "Check 'Set expires header' and 'Set cache control header' for CSS & JS, media and other files." },
        { order: 3, instruction: "Set the expires lifetime to 31536000 seconds and save." },
      ],
    },
  },
  verification: ["In DevTools → Network, click a CSS or image file and check 'cache-control' shows a long max-age."],
};

export const unminifiedAssets: WordPressFix = {
  id: "unminified-assets",
  category: "CSS",
  title: "CSS or JavaScript files aren't minified",
  impact: "low",
  appliesWhen: {
    // Custom trigger in matcher.ts: unminified-css / unminified-javascript, first-party files only
  },
  problem: "Some CSS or JavaScript files still contain whitespace, comments and long names that browsers don't need.",
  whyItMatters: "Minification usually trims 10–30% from file size. Small on its own, but it adds up across every file on every page.",
  genericWordPressSteps: [
    { order: 1, instruction: "Enable CSS and JavaScript minification in your optimization plugin." },
    { order: 2, instruction: "If the flagged files come from a third party, minification won't apply — consider delaying those scripts instead." },
    { order: 3, instruction: "Clear your cache and check the site visually." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Assets." },
        { order: 2, instruction: "Under JavaScript, toggle on 'Minify JavaScript'. Under CSS, toggle on 'Minify CSS'." },
        { order: 3, instruction: "Save and clear your cache." },
      ],
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket → File Optimization." },
        { order: 2, instruction: "Check 'Minify CSS files' and 'Minify JavaScript files'." },
        { order: 3, instruction: "Save changes." },
      ],
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Go to LiteSpeed Cache → Page Optimization." },
        { order: 2, instruction: "Turn on 'CSS Minify' (CSS Settings tab) and 'JS Minify' (JS Settings tab)." },
        { order: 3, instruction: "Save and purge all caches." },
      ],
    },
    autoptimize: {
      steps: [
        { order: 1, instruction: "Go to Settings → Autoptimize → JS, CSS & HTML." },
        { order: 2, instruction: "Check 'Optimize JavaScript Code' and 'Optimize CSS Code'." },
        { order: 3, instruction: "Save changes and empty the cache." },
      ],
    },
  },
  verification: ["Open one of the flagged files in a new tab — it should be a single dense line of code."],
};

export const heavyAnalytics: WordPressFix = {
  id: "heavy-analytics-tags",
  category: "Third-party",
  title: "Google Analytics / Tag Manager is blocking the page",
  impact: "medium",
  appliesWhen: {
    // Custom trigger in matcher.ts: Google Tag Manager / Analytics main-thread time > 250ms
    metric: "INP",
  },
  problem:
    "Google Tag Manager and Analytics tags on your page spend a significant amount of time on the main thread while the page is loading.",
  whyItMatters:
    "Every tag inside Tag Manager runs JavaScript. Several measurement IDs or a crowded container can easily add hundreds of milliseconds of blocking time, hurting INP.",
  genericWordPressSteps: [
    { order: 1, instruction: "Audit your Tag Manager container and remove tags, triggers and duplicate GA4 IDs you no longer use." },
    { order: 2, instruction: "Make sure analytics is installed once — not by both a plugin and Tag Manager." },
    { order: 3, instruction: "Delay analytics until user interaction with your performance plugin, or use a lightweight local analytics script." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Analytics and toggle on 'Enable Local Analytics' if you only need basic GA4 page views." },
        { order: 2, instruction: "Otherwise, go to Assets → JavaScript → 'Delay JavaScript' and add 'googletagmanager.com' to the delayed scripts list." },
        { order: 3, instruction: "Save and clear your cache, then confirm visits still appear in GA4 Realtime." },
      ],
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket → File Optimization." },
        { order: 2, instruction: "Check 'Delay JavaScript execution' — Google Analytics and GTM are delayed by default." },
        { order: 3, instruction: "Save changes and confirm visits still appear in GA4 Realtime." },
      ],
    },
  },
  verification: ["Run Maki again and check the third-party section — Google Tag Manager's main-thread time should drop.", "Confirm GA4 Realtime still records your visit."],
  caution: ["Delaying analytics can slightly undercount visitors who bounce without interacting. For most sites the speed gain is worth it."],
};
