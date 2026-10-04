// Programmatic landing pages: /wordpress/[stack]
// People don't search "WordPress performance fixer" — they search for the tool
// they already use ("elementor site slow", "wp rocket still slow").
// Each entry must carry unique, genuinely useful copy; thin doorway pages hurt more than they help.

export interface StackPage {
  slug: string;
  name: string;
  kind: "Page builder" | "Caching plugin" | "Optimization plugin" | "E-commerce" | "Theme";
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  painPoints: { title: string; body: string }[];
  /** ids from WP_FIX_LIBRARY that are most relevant to this stack */
  fixIds: string[];
  faq: { q: string; a: string }[];
}

export const STACK_PAGES: StackPage[] = [
  {
    slug: "elementor",
    name: "Elementor",
    kind: "Page builder",
    metaTitle: "Elementor Site Slow? Fix Core Web Vitals Step by Step",
    metaDescription:
      "Find out exactly why your Elementor site is slow — DOM size, unused CSS, fonts, heavy hero images — and get step-by-step fixes for your setup. Free scan.",
    h1: "Why your Elementor site is slow (and how to fix it)",
    intro:
      "Elementor makes building pages easy, but every section, column and widget adds markup, CSS and JavaScript. Maki scans your Elementor pages with Google PageSpeed Insights and shows which of those costs are actually hurting your Core Web Vitals — then tells you which Elementor setting or plugin option fixes each one.",
    painPoints: [
      {
        title: "Deeply nested sections bloat the DOM",
        body: "Old Section → Column → Widget layouts generate thousands of DOM nodes. Switching to Flexbox Containers and enabling Elementor's Optimized DOM Output usually cuts the count dramatically.",
      },
      {
        title: "Global CSS and icon libraries load everywhere",
        body: "Font Awesome, eicons and per-widget stylesheets load on pages that never use them. Improved Asset Loading and Inline Font Icons experiments help, and a script manager can unload the rest.",
      },
      {
        title: "Google Fonts block rendering",
        body: "Elementor loads Google Fonts from an external domain by default. Hosting them locally with font-display: swap removes a render-blocking request.",
      },
      {
        title: "Hero images are lazy-loaded",
        body: "Background and image widgets at the top of the page are often lazy-loaded, which delays Largest Contentful Paint by seconds.",
      },
    ],
    fixIds: ["too-large-dom", "unused-css", "google-fonts-external", "lcp-image-lazy-loaded", "block-library-css", "excessive-main-thread-work"],
    faq: [
      {
        q: "Is Elementor bad for Core Web Vitals?",
        a: "Not inherently. Elementor sites can pass Core Web Vitals, but the defaults load more CSS, JavaScript and DOM than a lean theme. Most slow Elementor sites are fixed by a handful of settings plus a caching/optimization plugin.",
      },
      {
        q: "Should I switch to Flexbox Containers?",
        a: "For new pages, yes. Containers produce far fewer DOM nodes than the legacy section/column structure, which helps both LCP and INP.",
      },
    ],
  },
  {
    slug: "woocommerce",
    name: "WooCommerce",
    kind: "E-commerce",
    metaTitle: "Speed Up WooCommerce: Fix Slow Product & Shop Pages",
    metaDescription:
      "Slow WooCommerce store? See what's dragging down your product and shop pages — cart fragments, heavy images, third-party scripts — and how to fix each one.",
    h1: "Speed up your WooCommerce store",
    intro:
      "On a store, every extra second costs sales. WooCommerce adds scripts, AJAX requests and large product images on top of your theme. Maki scans your store pages, identifies the biggest bottlenecks and gives you prioritized fixes that are safe for checkout and cart.",
    painPoints: [
      {
        title: "Cart fragments run on every page",
        body: "The wc-cart-fragments AJAX request bypasses page cache on every visit. Limiting it to pages that show a cart widget is one of the biggest WooCommerce wins.",
      },
      {
        title: "Product images are oversized",
        body: "Uploading 3000px product photos and letting the theme scale them down sends megabytes to mobile visitors. Responsive sizes and WebP/AVIF fix most of it.",
      },
      {
        title: "Marketing and review scripts pile up",
        body: "Pixels, chat widgets and review carousels compete with your product page for the main thread, hurting Interaction to Next Paint.",
      },
      {
        title: "Slow server response on uncached pages",
        body: "Cart, checkout and account pages can't be fully cached, so hosting quality and object caching matter more for stores than for blogs.",
      },
    ],
    fixIds: ["woocommerce-cart-fragments", "woocommerce-assets-sitewide", "lcp-image-too-large", "third-party-javascript", "server-response-time", "excessive-main-thread-work"],
    faq: [
      {
        q: "Can I cache WooCommerce pages?",
        a: "Shop, category and product pages can be cached. Cart, checkout and My Account must be excluded — most caching plugins do this automatically for WooCommerce.",
      },
      {
        q: "Is it safe to disable cart fragments?",
        a: "It is safe on pages without a mini-cart widget. If your header shows a live cart count, limit fragments rather than disabling them sitewide.",
      },
    ],
  },
  {
    slug: "wp-rocket",
    name: "WP Rocket",
    kind: "Caching plugin",
    metaTitle: "Using WP Rocket and Still Slow? Here's What to Change",
    metaDescription:
      "WP Rocket installed but PageSpeed still red? Maki detects WP Rocket and tells you exactly which settings to change — Remove Unused CSS, Delay JS, lazy-load exclusions.",
    h1: "Using WP Rocket and your site is still slow?",
    intro:
      "WP Rocket's defaults are conservative, so many sites install it and see little change. Maki detects WP Rocket on your site and maps each failing PageSpeed audit to the exact WP Rocket tab and option that fixes it — including the exclusions that keep your site from breaking.",
    painPoints: [
      {
        title: "Remove Unused CSS is off",
        body: "Render-blocking and unused CSS are the most common failures on WP Rocket sites. The File Optimization tab's Remove Unused CSS option handles both, with safelists for dynamic elements.",
      },
      {
        title: "JavaScript isn't delayed",
        body: "Delay JavaScript Execution postpones non-critical scripts until user interaction, which is often the single biggest Total Blocking Time and INP improvement.",
      },
      {
        title: "Your LCP image is lazy-loaded",
        body: "WP Rocket's LazyLoad can catch your hero image. Excluding it in the Media tab can save seconds of LCP.",
      },
    ],
    fixIds: ["render-blocking-css", "unused-css", "unused-javascript", "heavy-analytics-tags", "heavy-embeds", "lcp-image-lazy-loaded", "google-fonts-external"],
    faq: [
      {
        q: "Does Maki replace WP Rocket?",
        a: "No. Maki tells you how to configure the tools you already have. If WP Rocket is installed, your fix plan uses WP Rocket's settings.",
      },
      {
        q: "Will Delay JavaScript break my site?",
        a: "It can break sliders, menus or consent banners that need to run immediately. Maki's steps include which scripts to exclude and how to verify after each change.",
      },
    ],
  },
  {
    slug: "perfmatters",
    name: "Perfmatters",
    kind: "Optimization plugin",
    metaTitle: "Perfmatters Settings to Fix Core Web Vitals",
    metaDescription:
      "Get the exact Perfmatters settings for your site: Script Manager, Delay JS, Remove Unused CSS, lazy-load exclusions and local fonts — based on your real PageSpeed data.",
    h1: "The right Perfmatters settings for your site",
    intro:
      "Perfmatters has dozens of toggles, and the right combination depends on what's actually slowing your site down. Maki detects Perfmatters, reads your PageSpeed data and tells you which features to enable — and which assets to unload in the Script Manager.",
    painPoints: [
      {
        title: "Script Manager isn't being used",
        body: "Plugins load their CSS and JS on every page. The Script Manager lets you unload them where they aren't needed — the most surgical fix for unused JavaScript and CSS.",
      },
      {
        title: "Fonts still come from Google",
        body: "Perfmatters can host Google Fonts locally and add font-display: swap, removing an external render-blocking request.",
      },
      {
        title: "Leading images get lazy-loaded",
        body: "Use 'Exclude Leading Images' and preload your LCP image so the most important pixel paints first.",
      },
    ],
    fixIds: ["unused-javascript", "google-fonts-external", "lcp-image-not-prioritized", "woocommerce-cart-fragments", "heavy-embeds", "wordpress-emojis", "jquery-migrate", "dashicons-frontend"],
    faq: [
      {
        q: "Do I need a caching plugin with Perfmatters?",
        a: "Yes. Perfmatters doesn't do page caching. Pair it with server-level caching from your host or a caching plugin.",
      },
    ],
  },
  {
    slug: "litespeed-cache",
    name: "LiteSpeed Cache",
    kind: "Caching plugin",
    metaTitle: "LiteSpeed Cache Settings for Better Core Web Vitals",
    metaDescription:
      "Configure LiteSpeed Cache for real PageSpeed gains: CSS/JS optimization, UCSS, lazy-load exclusions and TTFB. Maki maps your failing audits to the exact settings.",
    h1: "Get more out of LiteSpeed Cache",
    intro:
      "LiteSpeed Cache is powerful but sprawling — Page Optimization alone has eight tabs. Maki detects LiteSpeed Cache and points you to the exact tab and field for each problem your PageSpeed scan finds.",
    painPoints: [
      {
        title: "Page Optimization is mostly off",
        body: "CSS Combine, UCSS and Load CSS Asynchronously are disabled by default. Enabling them carefully removes render-blocking CSS.",
      },
      {
        title: "QUIC.cloud services aren't connected",
        body: "Critical CSS and Unique CSS generation require QUIC.cloud. Without it, some optimizations silently do nothing.",
      },
      {
        title: "Hero images are lazy-loaded",
        body: "Add your LCP image to Media Excludes → Lazy Load Image Excludes so it loads immediately.",
      },
    ],
    fixIds: ["render-blocking-css", "server-response-time", "lcp-image-lazy-loaded", "static-cache-policy", "unminified-assets", "google-fonts-external"],
    faq: [
      {
        q: "Does LiteSpeed Cache work on any host?",
        a: "Page caching requires a LiteSpeed web server. The optimization features (CSS, JS, images) work on any host.",
      },
    ],
  },
  {
    slug: "divi",
    name: "Divi",
    kind: "Theme",
    metaTitle: "Divi Site Slow? Fix Divi Core Web Vitals",
    metaDescription:
      "Make your Divi site faster: Dynamic CSS, Critical CSS, deferred jQuery, image sizing and DOM depth. Free scan with step-by-step fixes for Divi sites.",
    h1: "Make your Divi site fast",
    intro:
      "Divi ships its own performance options, but they interact with caching plugins in ways that aren't obvious. Maki detects Divi, measures what's really slowing your pages and gives you fixes that work with the Divi Builder.",
    painPoints: [
      {
        title: "Large DOM from nested modules",
        body: "Divi rows and modules wrap content in several layers. Long pages built with many modules routinely exceed Lighthouse's DOM size threshold.",
      },
      {
        title: "Performance options conflict with plugins",
        body: "Divi's Critical CSS and Defer jQuery can double up with WP Rocket or Perfmatters. Use one tool per job.",
      },
      {
        title: "Unoptimized images in sliders",
        body: "Full-width sliders often load several large images up front, hurting LCP on mobile.",
      },
    ],
    fixIds: ["too-large-dom", "render-blocking-css", "lcp-image-too-large", "jquery-migrate", "block-library-css", "layout-shift-images"],
    faq: [
      {
        q: "Should I use Divi's performance settings or a plugin?",
        a: "Either can work. Avoid enabling the same optimization in both places (for example Critical CSS in Divi and in WP Rocket), which can cause broken layouts or no gain.",
      },
    ],
  },
];

export function getStack(slug: string) {
  return STACK_PAGES.find((s) => s.slug === slug);
}
