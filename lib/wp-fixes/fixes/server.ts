import { WordPressFix } from "../types";

export const serverResponseTime: WordPressFix = {
  id: "server-response-time",
  category: "Server",
  title: "Reduce initial server response time (TTFB)",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["server-response-time"],
    metric: "TTFB"
  },
  problem: "The server is taking too long to generate the HTML document for this page.",
  whyItMatters: "A slow Time to First Byte (TTFB) delays everything else on the page. If the server is slow, LCP and FCP are guaranteed to be slow.",
  genericWordPressSteps: [
    { order: 1, instruction: "Ensure you have a page caching plugin installed and active." },
    { order: 2, instruction: "Verify that page caching is enabled and working (check headers for 'HIT')." },
    { order: 3, instruction: "If caching is on but TTFB is still slow, your hosting may be underpowered or a heavy database query is bypassing the cache." }
  ],
  variants: {
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket." },
        { order: 2, instruction: "Verify that WP Rocket is active; it enables page caching by default." },
        { order: 3, instruction: "Go to the Cache tab and ensure 'Enable caching for mobile devices' is checked." }
      ]
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Go to LiteSpeed Cache → Cache." },
        { order: 2, instruction: "Ensure 'Enable Cache' is turned ON." },
        { order: 3, instruction: "Check if your server is running LiteSpeed Web Server to take full advantage of this feature." }
      ]
    }
  },
  verification: [
    "Load the page while logged out of WordPress (incognito mode).",
    "Run PageSpeed Insights. The 'Reduce initial server response time' warning should be green."
  ]
};

export const domSize: WordPressFix = {
  id: "too-large-dom",
  category: "Server", // or Structure
  title: "Avoid an excessive DOM size",
  impact: "medium",
  appliesWhen: {
    lighthouseAuditIds: ["dom-size"],
  },
  problem: "The page has too many HTML elements.",
  whyItMatters: "A large DOM slows down CSS styling, layout calculations, and JavaScript execution, hurting INP.",
  genericWordPressSteps: [
    { order: 1, instruction: "Simplify your page layout, especially in page builders." },
    { order: 2, instruction: "Avoid nesting rows within rows excessively." },
    { order: 3, instruction: "Paginate long lists of comments or posts." }
  ],
  variants: {
    elementor: {
      steps: [
        { order: 1, instruction: "Go to Elementor → Settings → Features." },
        { order: 2, instruction: "Ensure 'Optimized DOM Output' is active." },
        { order: 3, instruction: "Use Flexbox Containers instead of older nested Sections/Columns to reduce wrappers." }
      ]
    }
  },
  verification: [
    "Check PageSpeed Insights to see if the DOM size warning is resolved."
  ]
};
