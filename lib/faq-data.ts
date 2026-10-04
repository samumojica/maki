// Single source of truth for the homepage FAQ. Rendered visibly on the page AND
// emitted as FAQPage JSON-LD — Google requires both to match.
export const FAQ_ITEMS = [
  {
    q: "Is the scan really free?",
    a: "Yes. You see your Core Web Vitals, PageSpeed results and the detected issues before paying anything. No account, no email.",
  },
  {
    q: "What do I get for $9?",
    a: "The full interactive WordPress fix plan: prioritized fixes, exact steps for the plugins and theme Maki detects on your site, the resources causing each problem, a progress checklist, and re-tests with a before/after comparison.",
  },
  {
    q: "Does Maki change my WordPress site?",
    a: "No. Maki never logs into your site. It tells you exactly what to change and you stay in control.",
  },
  {
    q: "Do I need to install a plugin?",
    a: "No. Maki analyzes your site from the outside using Google PageSpeed Insights and fingerprints your theme, page builder, caching and image plugins from the assets your pages load.",
  },
  {
    q: "Which plugins does Maki give specific instructions for?",
    a: "Plugin-specific steps currently cover Perfmatters, WP Rocket, LiteSpeed Cache, Autoptimize, W3 Total Cache, Elementor, ShortPixel and Imagify. Maki also detects popular themes, page builders and other caching and image plugins; when there's no dedicated playbook for your setup, you get clear generic WordPress steps instead.",
  },
  {
    q: "What if Maki can't detect WordPress?",
    a: "You still get the free performance results, but the paid WordPress fix plan will not be offered.",
  },
  {
    q: "Is this a subscription?",
    a: "No. $9 one-time.",
  },
  {
    q: "Does this guarantee a higher Google ranking?",
    a: "No. Core Web Vitals are a confirmed Google ranking signal, but rankings depend on many factors. Google's field data also updates on a rolling 28-day window, so improvements take a few weeks to show up.",
  },
] as const;

export type FAQItem = (typeof FAQ_ITEMS)[number];
