import { WordPressFix } from "../types";

export const renderBlockingCss: WordPressFix = {
  id: "render-blocking-css",
  category: "CSS",
  title: "Eliminate render-blocking CSS",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["render-blocking-resources"],
  },
  problem: "The browser must download and parse large CSS files before it can paint anything on the screen, causing a blank white screen delay.",
  whyItMatters: "Render-blocking resources heavily impact First Contentful Paint (FCP) and Largest Contentful Paint (LCP).",
  genericWordPressSteps: [
    { order: 1, instruction: "Install a performance plugin capable of 'Critical CSS' generation (like WP Rocket or LiteSpeed Cache)." },
    { order: 2, instruction: "Enable the option to 'Optimize CSS delivery' or 'Load CSS asynchronously'." },
    { order: 3, instruction: "Generate the Critical CSS for your site." },
    { order: 4, instruction: "Clear your page cache." }
  ],
  variants: {
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket." },
        { order: 2, instruction: "Navigate to the File Optimization tab." },
        { order: 3, instruction: "Under CSS Files, check 'Optimize CSS delivery'." },
        { order: 4, instruction: "Choose 'Remove Unused CSS' (preferred) or 'Load CSS asynchronously' (fallback)." },
        { order: 5, instruction: "Save changes and let WP Rocket generate the Critical CSS." }
      ]
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Go to LiteSpeed Cache → Page Optimization." },
        { order: 2, instruction: "Navigate to the CSS Settings tab." },
        { order: 3, instruction: "Turn ON 'CSS Combine' (optional but recommended if not on HTTP/3) and 'Load CSS Asynchronously'." },
        { order: 4, instruction: "Turn ON 'Generate Critical CSS' in the background." },
        { order: 5, instruction: "Save changes and purge all." }
      ]
    },
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters." },
        { order: 2, instruction: "Navigate to the Assets tab." },
        { order: 3, instruction: "Enable the 'Remove Unused CSS' feature." },
        { order: 4, instruction: "Set the Used CSS Method to 'File' or 'Inline'." },
        { order: 5, instruction: "Save changes and clear cache." }
      ]
    }
  },
  verification: [
    "Test the page on PageSpeed Insights again.",
    "Verify the 'Eliminate render-blocking resources' audit is passed or significantly reduced.",
    "Check your site visually in an incognito window to ensure no layout flashes occur (FOUC)."
  ],
  caution: [
    "Optimizing CSS delivery can sometimes break the layout of your site momentarily during load (FOUC). Test your site carefully after applying."
  ]
};

export const unusedCss: WordPressFix = {
  id: "unused-css",
  category: "CSS",
  title: "Reduce unused CSS rules",
  impact: "medium",
  appliesWhen: {
    lighthouseAuditIds: ["unused-css-rules"],
  },
  problem: "WordPress themes and plugins load massive CSS files for every possible feature, even if you are only using a fraction of them on this specific page.",
  whyItMatters: "Downloading and parsing dead code wastes browser resources and delays page rendering.",
  genericWordPressSteps: [
    { order: 1, instruction: "Use a performance plugin that can 'Remove Unused CSS' (RUCSS)." },
    { order: 2, instruction: "Enable the feature to generate page-specific CSS." },
    { order: 3, instruction: "If a specific plugin is causing the bloat but isn't needed on this page, use a script manager to disable it here." }
  ],
  variants: {
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket." },
        { order: 2, instruction: "Navigate to the File Optimization tab." },
        { order: 3, instruction: "Under CSS Files, enable 'Remove Unused CSS'." },
        { order: 4, instruction: "Save changes and wait for the CSS to be generated." }
      ]
    },
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters." },
        { order: 2, instruction: "Enable 'Remove Unused CSS' under the Assets tab." },
        { order: 3, instruction: "If specific plugins are loading heavy CSS, go to the 'Script Manager' to disable them on pages where they aren't used." }
      ]
    }
  },
  verification: [
    "Check PageSpeed Insights and confirm the 'Reduce unused CSS' warning is gone."
  ],
  caution: [
    "Removing unused CSS is an aggressive optimization. Always check your site layout on mobile and desktop after enabling."
  ]
};
