import { WordPressFix } from "../types";

// Front-end assets WordPress core and WooCommerce load by default that most sites don't need.
// Detected from the page's network requests.

export const wpEmojis: WordPressFix = {
  id: "wordpress-emojis",
  category: "WordPress bloat",
  title: "WordPress emoji script loads on every page",
  impact: "low",
  appliesWhen: {
    requestPatterns: ["wp-emoji-release.min.js", "wp-emoji.js"],
  },
  problem:
    "WordPress loads an emoji detection script and inline CSS on every page so it can replace emojis with images on very old browsers. Every modern browser renders emojis natively.",
  whyItMatters:
    "It's an extra request and inline script in the <head> on every page view, for a feature almost no visitor needs.",
  genericWordPressSteps: [
    { order: 1, instruction: "Install a lightweight plugin such as 'Disable Emojis (GDPR friendly)', or use the emoji option in your performance plugin." },
    { order: 2, instruction: "Alternatively, add remove_action( 'wp_head', 'print_emoji_detection_script', 7 ); and remove_action( 'wp_print_styles', 'print_emoji_styles' ); to a code snippets plugin." },
    { order: 3, instruction: "Clear your page cache." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → General." },
        { order: 2, instruction: "Toggle on 'Disable Emojis'." },
        { order: 3, instruction: "Save changes and clear your cache." },
      ],
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket → Media." },
        { order: 2, instruction: "Check 'Disable WordPress emoji'." },
        { order: 3, instruction: "Save changes." },
      ],
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Go to LiteSpeed Cache → Page Optimization → HTML Settings." },
        { order: 2, instruction: "Turn on 'Remove WordPress Emoji'." },
        { order: 3, instruction: "Save changes and purge all caches." },
      ],
    },
    autoptimize: {
      steps: [
        { order: 1, instruction: "Go to Settings → Autoptimize → Extra." },
        { order: 2, instruction: "Check 'Remove emojis'." },
        { order: 3, instruction: "Save changes and empty the Autoptimize cache." },
      ],
    },
  },
  verification: ["View the page source and confirm wp-emoji-release.min.js is gone.", "Run Maki again."],
};

export const jqueryMigrate: WordPressFix = {
  id: "jquery-migrate",
  category: "WordPress bloat",
  title: "jQuery Migrate is loading",
  impact: "low",
  appliesWhen: {
    requestPatterns: ["jquery-migrate.min.js", "jquery-migrate.js"],
  },
  problem:
    "jQuery Migrate is a compatibility layer for plugins and themes written for very old versions of jQuery. Most up-to-date sites don't need it, but WordPress still loads it by default on the front end.",
  whyItMatters:
    "It's usually render-blocking because it loads right after jQuery in the <head>, delaying first paint on every page.",
  genericWordPressSteps: [
    { order: 1, instruction: "Make a backup or use a staging site first." },
    { order: 2, instruction: "Install a code snippets plugin and dequeue jquery-migrate on the front end, or use your performance plugin's option." },
    { order: 3, instruction: "Click through your menus, sliders, forms and popups to confirm nothing broke." },
    { order: 4, instruction: "Clear your page cache." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → General." },
        { order: 2, instruction: "Toggle on 'Remove jQuery Migrate'." },
        { order: 3, instruction: "Save, clear cache, and test interactive elements (menus, sliders, forms)." },
      ],
    },
  },
  verification: [
    "Open your browser console on several pages and check for JavaScript errors.",
    "Confirm jquery-migrate.min.js no longer appears in Maki's request list.",
  ],
  caution: ["Older themes, sliders and page builder add-ons may rely on jQuery Migrate. If something breaks, turn it back on."],
};

export const dashicons: WordPressFix = {
  id: "dashicons-frontend",
  category: "WordPress bloat",
  title: "Admin icon font (Dashicons) loads for visitors",
  impact: "low",
  appliesWhen: {
    requestPatterns: ["dashicons.min.css", "dashicons.css"],
  },
  problem:
    "Dashicons is the icon font for the WordPress admin bar. It's loading for logged-out visitors, who never see the admin bar.",
  whyItMatters: "It's a render-blocking stylesheet plus a font file that adds weight to every page for no visible benefit.",
  genericWordPressSteps: [
    { order: 1, instruction: "Check whether your theme or a plugin uses Dashicons on the front end (look for icons with the 'dashicons' class)." },
    { order: 2, instruction: "If not, disable Dashicons for logged-out users with your performance plugin or a code snippet." },
    { order: 3, instruction: "Clear your page cache." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → General." },
        { order: 2, instruction: "Toggle on 'Disable Dashicons' (it only affects logged-out visitors)." },
        { order: 3, instruction: "Save and clear your cache." },
      ],
    },
  },
  verification: ["Open the page in an incognito window and confirm dashicons.min.css is no longer requested."],
  caution: ["Some plugins (e.g. star ratings, social icons) use Dashicons on the front end. Check those still render."],
};

export const blockLibraryCss: WordPressFix = {
  id: "block-library-css",
  category: "WordPress bloat",
  title: "Unused Gutenberg block styles are loading",
  impact: "medium",
  appliesWhen: {
    // Only flagged when a page builder is detected — custom trigger in matcher.ts
  },
  problem:
    "WordPress loads the block editor's stylesheet (wp-block-library) and global styles on every page. Your pages are built with a page builder, so most of these styles are never used.",
  whyItMatters: "It's a render-blocking stylesheet that adds unused CSS to every page and delays first paint.",
  genericWordPressSteps: [
    { order: 1, instruction: "Confirm your posts and pages don't use Gutenberg blocks (blog posts often do — check before disabling)." },
    { order: 2, instruction: "Dequeue 'wp-block-library' and 'global-styles' on pages built with your page builder, using your performance plugin or a code snippet." },
    { order: 3, instruction: "If you do use blocks on some pages, enable 'separate block styles' so only the blocks used on each page load their CSS." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → General." },
        { order: 2, instruction: "Toggle on 'Disable Global Styles'." },
        { order: 3, instruction: "If you use blocks in blog posts, also toggle on 'Separate Block Styles' instead of removing the library entirely." },
        { order: 4, instruction: "For pages with no blocks at all, use the Script Manager to disable 'wp-block-library' on those pages." },
      ],
    },
  },
  verification: ["Check a blog post and a builder page — both should look unchanged.", "Run Maki again and compare unused CSS."],
};

export const wooCartFragments: WordPressFix = {
  id: "woocommerce-cart-fragments",
  category: "WooCommerce",
  title: "WooCommerce cart fragments run on every page",
  impact: "high",
  appliesWhen: {
    requestPatterns: ["wc-ajax=get_refreshed_fragments", "cart-fragments.min.js", "cart-fragments.js"],
  },
  problem:
    "WooCommerce makes an uncached AJAX request (get_refreshed_fragments) on every page to keep the mini-cart count up to date — even on pages that don't show a cart.",
  whyItMatters:
    "That request bypasses page caching and hits PHP and the database on every visit, slowing the page and loading your server.",
  genericWordPressSteps: [
    { order: 1, instruction: "Decide where you actually need a live cart count (usually only the header mini-cart)." },
    { order: 2, instruction: "Disable cart fragments everywhere except cart/checkout/product pages, using your performance plugin or a plugin like 'Disable Cart Fragments'." },
    { order: 3, instruction: "Clear your page cache and test adding a product to the cart." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → General → WooCommerce." },
        { order: 2, instruction: "Toggle on 'Disable Cart Fragmentation'." },
        { order: 3, instruction: "Save, clear cache, then add a product to the cart and confirm the cart page still updates." },
      ],
    },
  },
  verification: [
    "Open DevTools → Network and reload the homepage. 'get_refreshed_fragments' should no longer appear.",
    "Add a product to the cart and confirm the cart and checkout still work.",
  ],
  caution: ["If your header shows a live cart count, it may not update until the visitor reaches the cart page."],
};

export const wooAssetsSitewide: WordPressFix = {
  id: "woocommerce-assets-sitewide",
  category: "WooCommerce",
  title: "WooCommerce scripts load on non-shop pages",
  impact: "medium",
  appliesWhen: {
    // Custom trigger in matcher.ts: WooCommerce assets on a page that isn't a shop/product/cart URL
  },
  problem:
    "WooCommerce's CSS and JavaScript are loading on this page even though it isn't a shop, product, cart or checkout page.",
  whyItMatters:
    "Blog posts and landing pages pay for e-commerce code they never use: extra render-blocking CSS and JavaScript the browser has to parse.",
  genericWordPressSteps: [
    { order: 1, instruction: "Use a script manager to disable WooCommerce styles and scripts on pages that aren't part of the store." },
    { order: 2, instruction: "Keep them enabled on shop, product, cart, checkout and account pages, and anywhere you use WooCommerce blocks or shortcodes." },
    { order: 3, instruction: "Clear your page cache." },
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → General → WooCommerce." },
        { order: 2, instruction: "Toggle on 'Disable Scripts' — Perfmatters keeps them on WooCommerce pages automatically." },
        { order: 3, instruction: "Optionally toggle on 'Disable Widgets' if you don't use WooCommerce widgets." },
        { order: 4, instruction: "Save and clear your cache." },
      ],
    },
  },
  verification: [
    "Load a blog post and confirm no /plugins/woocommerce/ files are requested.",
    "Load a product page and confirm the gallery, variations and add-to-cart still work.",
  ],
  caution: ["If you show products on non-shop pages (blocks, shortcodes, sliders), keep WooCommerce assets enabled on those pages."],
};
