import type { ReactNode } from "react";
import Link from "next/link";

// Top-of-funnel content: /guides/[slug]
// Each guide answers one high-intent question and links to the relevant /fixes pages + the free scan.

export interface Guide {
  slug: string;
  title: string;
  description: string;
  /** ISO date */
  published: string;
  updated: string;
  readingMinutes: number;
  tag: string;
  body: ReactNode;
}

export const GUIDES: Guide[] = [
  {
    slug: "why-is-my-wordpress-site-slow",
    title: "Why is my WordPress site slow? 9 causes and how to fix them",
    description:
      "The most common reasons WordPress sites are slow — hosting, uncached pages, heavy images, render-blocking CSS, plugin bloat — and how to tell which one is yours.",
    published: "2026-10-03",
    updated: "2026-10-03",
    readingMinutes: 8,
    tag: "Diagnosis",
    body: (
      <>
        <p>
          A slow WordPress site is almost never caused by &ldquo;WordPress&rdquo; itself. It&apos;s caused by a few specific
          things stacked on top of it: the server, the theme, the plugins and the media you upload. The good news is
          that most sites are slow for the same handful of reasons, and each one has a known fix.
        </p>
        <h2>1. Your server responds slowly (high TTFB)</h2>
        <p>
          Before the browser can render anything, your server has to build the page. If Time to First Byte is above
          ~800ms, everything else starts late. Cheap shared hosting, no page cache, and slow database queries are the
          usual causes. See <Link href="/fixes/server-response-time">how to reduce server response time</Link>.
        </p>
        <h2>2. Pages aren&apos;t cached</h2>
        <p>
          Without page caching, WordPress runs PHP and database queries for every visitor. A caching plugin (WP Rocket,
          LiteSpeed Cache, WP Super Cache) or host-level caching serves a pre-built HTML file instead.
        </p>
        <h2>3. Your hero image is huge — or lazy-loaded</h2>
        <p>
          The largest image above the fold usually determines Largest Contentful Paint. Two mistakes dominate: uploading
          a multi-megabyte image, and lazy-loading the image that should load first. Read{" "}
          <Link href="/fixes/lcp-image-too-large">LCP image too heavy</Link> and{" "}
          <Link href="/fixes/lcp-image-lazy-loaded">LCP image lazy-loaded</Link>.
        </p>
        <h2>4. Render-blocking CSS</h2>
        <p>
          Themes and page builders load large stylesheets in the <code>&lt;head&gt;</code>. The browser won&apos;t paint
          until they&apos;re downloaded. Generating critical CSS and loading the rest asynchronously fixes it.{" "}
          <Link href="/fixes/render-blocking-css">Fix render-blocking CSS</Link>.
        </p>
        <h2>5. Plugins load assets on every page</h2>
        <p>
          A contact form plugin that loads its JavaScript on your blog posts, a slider script on pages without a slider —
          this adds up fast. A script manager lets you unload assets per page.{" "}
          <Link href="/fixes/unused-javascript">Reduce unused JavaScript</Link>.
        </p>
        <h2>6. Third-party scripts</h2>
        <p>
          Analytics, chat widgets, ad pixels and embedded videos often cost more than your entire theme. Delaying them
          until the visitor interacts is one of the highest-impact changes you can make.{" "}
          <Link href="/fixes/third-party-javascript">Delay third-party scripts</Link>.
        </p>
        <h2>7. Web fonts</h2>
        <p>
          Google Fonts loaded from an external domain, without <code>font-display: swap</code>, cause invisible text
          and layout shifts. Host fonts locally and limit weights. <Link href="/fixes/font-display">Fix web fonts</Link>.
        </p>
        <h2>8. Page builder bloat</h2>
        <p>
          Elementor, Divi and WPBakery can produce thousands of DOM nodes per page, which slows rendering and
          interactions. <Link href="/fixes/too-large-dom">Reduce DOM size</Link>.
        </p>
        <h2>9. Images without dimensions</h2>
        <p>
          Images and embeds without width and height push content around as they load, failing Cumulative Layout Shift.{" "}
          <Link href="/fixes/layout-shift-images">Fix layout shifts from images</Link>.
        </p>
        <h2>How to find out which one is yours</h2>
        <p>
          Guessing wastes hours. Run a free Maki scan: it pulls real Chrome user data from Google PageSpeed Insights,
          detects your theme and plugins, and ranks the problems above by how much they actually cost <em>your</em> site.
        </p>
      </>
    ),
  },
  {
    slug: "core-web-vitals-thresholds",
    title: "Core Web Vitals thresholds explained: LCP, INP and CLS in 2026",
    description:
      "What counts as a good LCP, INP and CLS score, how Google measures them with real-user data, and why your PageSpeed score and Core Web Vitals don't always agree.",
    published: "2026-10-03",
    updated: "2026-10-03",
    readingMinutes: 6,
    tag: "Fundamentals",
    body: (
      <>
        <p>
          Core Web Vitals are three metrics Google uses to measure real-world page experience. They are part of Google&apos;s
          ranking systems, and — more importantly — they track what your visitors actually feel.
        </p>
        <h2>The thresholds</h2>
        <ul>
          <li>
            <strong>Largest Contentful Paint (LCP)</strong> — how long until the main content is visible. Good: 2.5s or
            less. Poor: over 4s.
          </li>
          <li>
            <strong>Interaction to Next Paint (INP)</strong> — how quickly the page responds to taps and clicks. Good:
            200ms or less. Poor: over 500ms.
          </li>
          <li>
            <strong>Cumulative Layout Shift (CLS)</strong> — how much content jumps around while loading. Good: 0.1 or
            less. Poor: over 0.25.
          </li>
        </ul>
        <p>
          To pass, a page needs all three to be &ldquo;good&rdquo; at the 75th percentile of visits — meaning three out of
          four visitors get a good experience.
        </p>
        <h2>Field data vs. lab data</h2>
        <p>
          PageSpeed Insights shows two kinds of data. <strong>Field data</strong> comes from the Chrome User Experience
          Report (CrUX): real visitors over the last 28 days. <strong>Lab data</strong> is a single Lighthouse test on a
          simulated mid-range phone. Google uses field data for rankings; the Lighthouse performance score is a
          diagnostic tool.
        </p>
        <p>
          That&apos;s why your score can be 55 while you pass Core Web Vitals — or 90 while you fail. And why fixes take up
          to four weeks to show up in field data.
        </p>
        <h2>What usually fails on WordPress</h2>
        <ul>
          <li>
            LCP: lazy-loaded or oversized hero images, slow servers, render-blocking CSS. Start with{" "}
            <Link href="/fixes/lcp-image-lazy-loaded">this LCP fix</Link>.
          </li>
          <li>
            INP: heavy JavaScript from page builders and third-party widgets. See{" "}
            <Link href="/fixes/excessive-main-thread-work">minimize main-thread work</Link>.
          </li>
          <li>
            CLS: images without dimensions, late-loading fonts, injected banners. See{" "}
            <Link href="/fixes/layout-shift-images">layout shifts from images</Link>.
          </li>
        </ul>
      </>
    ),
  },
  {
    slug: "how-to-fix-lcp-wordpress",
    title: "How to fix Largest Contentful Paint (LCP) in WordPress",
    description:
      "A practical, plugin-by-plugin guide to fixing slow LCP on WordPress: find your LCP element, stop lazy-loading it, shrink it, preload it and speed up the server.",
    published: "2026-10-03",
    updated: "2026-10-03",
    readingMinutes: 7,
    tag: "How-to",
    body: (
      <>
        <p>
          LCP is the Core Web Vital WordPress sites fail most often. It measures when the biggest element above the fold —
          usually a hero image or headline — finishes rendering. Good LCP is 2.5 seconds or less on mobile.
        </p>
        <h2>Step 1: Find your LCP element</h2>
        <p>
          In PageSpeed Insights, open the &ldquo;Largest Contentful Paint element&rdquo; diagnostic. It shows the exact HTML
          snippet. Maki shows it too, along with the file name you need for the next steps.
        </p>
        <h2>Step 2: Make sure it isn&apos;t lazy-loaded</h2>
        <p>
          WordPress core, your theme, and optimization plugins all lazy-load images. If the LCP image has{" "}
          <code>loading=&quot;lazy&quot;</code>, the browser deliberately waits. Exclude it in your plugin settings — exact
          steps for Perfmatters, WP Rocket, LiteSpeed Cache and Autoptimize are in{" "}
          <Link href="/fixes/lcp-image-lazy-loaded">this fix</Link>.
        </p>
        <h2>Step 3: Shrink it</h2>
        <p>
          Serve the image in WebP or AVIF, at the size it&apos;s actually displayed. A 1600px-wide WebP hero is usually
          under 150KB. <Link href="/fixes/lcp-image-too-large">Optimize the LCP image</Link>.
        </p>
        <h2>Step 4: Tell the browser it&apos;s important</h2>
        <p>
          Add <code>fetchpriority=&quot;high&quot;</code> to the image, or preload it. Perfmatters, WP Rocket and most modern
          themes have a setting for this.
        </p>
        <h2>Step 5: Remove what&apos;s in front of it</h2>
        <p>
          Render-blocking CSS and slow server responses delay everything, including LCP. See{" "}
          <Link href="/fixes/render-blocking-css">render-blocking CSS</Link> and{" "}
          <Link href="/fixes/server-response-time">server response time</Link>.
        </p>
        <h2>Step 6: Re-test</h2>
        <p>
          Lab results change immediately; field data takes up to 28 days. Re-run your scan after each change so you know
          which one actually helped.
        </p>
      </>
    ),
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
