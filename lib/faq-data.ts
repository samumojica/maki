export const FAQ_ITEMS = [
  {
    q: "How is this different from running PageSpeed Insights myself?",
    a: "PSI gives you a wall of technical jargon and raw numbers. Maki translates it into ranked, actionable fixes — with exact steps tailored to your platform (WordPress, Shopify, Webflow, or custom). Ready for you or your developer.",
  },
  {
    q: "Why not use GTmetrix or DebugBear?",
    a: "GTmetrix requires an account, caps your free tests, and charges monthly for advanced features. DebugBear starts at $19/month and also requires registration. Maki costs $9 once — no account, no login, no subscription. Just paste your URL and get your report.",
  },
  {
    q: "Do I need an account or login?",
    a: "No. Zero signup required. You don't even need to give us your email. Paste your URL, scan for free, and pay only if you want the detailed fix list. That's it.",
  },
  {
    q: "Do I need a WordPress site?",
    a: "No. Maki works for any website — WordPress, Shopify, Webflow, Squarespace, Next.js, custom code, anything. We detect your stack automatically and tailor the fixes to your specific platform.",
  },
  {
    q: "What exactly do I get for $9?",
    a: "A complete PDF report with: your exact LCP, INP, and CLS scores; Lighthouse scores for Performance, Accessibility, and SEO; your 7 biggest problems ranked by impact with copy-paste code snippets; direct plugin and tool links; SEO snippets ready to paste; technology & server detection; a quick win you can apply in under 10 minutes; and infrastructure tips for long-term speed.",
  },
  {
    q: "Will this actually improve my Google ranking?",
    a: "Core Web Vitals are a confirmed Google ranking signal. Failing them hurts visibility. Fixing them won't guarantee #1, but it removes penalties. Note: improvements aren't instant — Google's field data (CrUX) updates on a 28-day rolling cycle, so expect a few weeks for scores to reflect your changes.",
  },
  {
    q: "How accurate is the data?",
    a: "We pull directly from the same Google PageSpeed Insights API that powers Chrome DevTools and Google Search Console. The data comes from real Chrome users visiting your site — not synthetic tests or simulations.",
  },
  {
    q: "Is the report generic or tailored to my site?",
    a: "Fully tailored. Every fix is specific to the issues found on YOUR site, ranked by impact. We detect your platform (WordPress, Shopify, etc.) and give you exact plugin names, settings to change, and code snippets — not generic advice.",
  },
  {
    q: "Do you store my data?",
    a: "No. Your scan results exist in memory for 30 minutes to complete the checkout flow, then they're automatically deleted. We don't maintain a database of URLs or reports. Once you download the PDF, that's your copy — we don't keep one.",
  },
  {
    q: "Do you offer support if I have questions?",
    a: "Absolutely. If you have any questions about your report or need help understanding a fix, email us at support@getmaki.app. We're here to help you get your site into the green.",
  },
] as const;

export type FAQItem = (typeof FAQ_ITEMS)[number];
