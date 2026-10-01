import { DetectedTechnology, WordPressContext } from "./types";

export function detectWordPressContext(
  psiData: { mobile: unknown; desktop: unknown },
  htmlStr?: string // fallback or supplementary html, not strictly required
): WordPressContext {
  const result: WordPressContext = {
    status: "unknown",
    eligible: false,
    performancePlugins: [],
    imagePlugins: [],
    thirdPartyScripts: [],
    allDetected: [],
  };

  const raw = psiData.mobile as Record<string, unknown>;
  const lh = raw?.lighthouseResult as Record<string, unknown> | undefined;
  const audits = (lh?.audits ?? {}) as Record<string, Record<string, unknown>>;
  const stackPacks = lh?.stackPacks as Array<{ id: string; title: string }> | undefined;
  
  // Extract all request URLs
  const networkRequests = audits?.["network-requests"];
  const urls: string[] = [];
  if (networkRequests?.details) {
    const details = networkRequests.details as Record<string, unknown>;
    const items = details?.items as Array<Record<string, unknown>> | undefined;
    if (items) {
      for (const item of items) {
        if (typeof item.url === "string") urls.push(item.url);
      }
    }
  }

  // Helper to add to allDetected safely
  function addTech(tech: DetectedTechnology) {
    // avoid duplicates
    if (!result.allDetected.some((t) => t.name === tech.name)) {
      result.allDetected.push(tech);
    }
  }

  // --- 1. WORDPRESS PLATFORM ---
  let wpSignals = 0;
  const wpEvidence: string[] = [];

  if (stackPacks?.some((sp) => sp.id === "wordpress")) {
    wpSignals += 2;
    wpEvidence.push("Lighthouse stackPack: wordpress");
  }

  const wpContentCount = urls.filter((u) => u.includes("/wp-content/")).length;
  if (wpContentCount > 0) {
    wpSignals += 1;
    wpEvidence.push(`Detected /wp-content/ asset paths (${wpContentCount} instances)`);
  }

  const wpIncludesCount = urls.filter((u) => u.includes("/wp-includes/")).length;
  if (wpIncludesCount > 0) {
    wpSignals += 1;
    wpEvidence.push(`Detected /wp-includes/ asset paths (${wpIncludesCount} instances)`);
  }

  if (wpSignals >= 2) {
    result.status = "confirmed";
    result.eligible = true;
  } else if (wpSignals === 1) {
    result.status = "likely";
    result.eligible = true; // allow flow but UI says "likely"
  } else {
    result.status = "unknown";
    result.eligible = false;
  }

  if (result.status !== "unknown") {
    addTech({
      type: "platform",
      name: "WordPress",
      confidence: result.status,
      evidence: wpEvidence,
    });
  }

  // --- 2. THEMES ---
  const knownThemes = [
    { slug: "generatepress", name: "GeneratePress" },
    { slug: "astra", name: "Astra" },
    { slug: "kadence", name: "Kadence" },
    { slug: "divi", name: "Divi" },
    { slug: "twentytwenty", name: "Twenty Twenty" },
    { slug: "twentytwentyone", name: "Twenty Twenty-One" },
    { slug: "twentytwentytwo", name: "Twenty Twenty-Two" },
    { slug: "twentytwentythree", name: "Twenty Twenty-Three" },
    { slug: "twentytwentyfour", name: "Twenty Twenty-Four" },
  ];

  // Try to find generic theme slug from /wp-content/themes/{slug}/
  const themeMatch = urls.map(u => u.match(/\/wp-content\/themes\/([^\/]+)\//)).find(m => m && m[1]);
  if (themeMatch) {
    const slug = themeMatch[1].toLowerCase();
    const known = knownThemes.find(t => t.slug === slug);
    const themeName = known ? known.name : slug;
    
    const count = urls.filter(u => u.includes(`/wp-content/themes/${slug}/`)).length;
    const themeTech: DetectedTechnology = {
      type: "theme",
      name: themeName,
      slug,
      confidence: count > 1 ? "confirmed" : "likely",
      evidence: [`Asset loaded from /wp-content/themes/${slug}/ (${count} instances)`]
    };
    result.theme = themeTech;
    addTech(themeTech);
  }

  // --- 3. PAGE BUILDERS ---
  const knownBuilders = [
    { slug: "elementor", name: "Elementor" },
    { slug: "beaver-builder-lite-version", name: "Beaver Builder" },
    { slug: "bb-plugin", name: "Beaver Builder" },
    { slug: "divi-builder", name: "Divi Builder" },
    { slug: "js_composer", name: "WPBakery" },
    { slug: "bricks", name: "Bricks" },
    { slug: "oxygen", name: "Oxygen" },
  ];

  for (const b of knownBuilders) {
    const count = urls.filter(u => u.includes(`/wp-content/plugins/${b.slug}/`) || u.includes(`/wp-content/themes/${b.slug}/`)).length;
    if (count > 0) {
      const builderTech: DetectedTechnology = {
        type: "builder",
        name: b.name,
        slug: b.slug,
        confidence: count > 1 ? "confirmed" : "likely",
        evidence: [`Asset loaded from ${b.slug} directory (${count} instances)`]
      };
      result.pageBuilder = builderTech;
      addTech(builderTech);
      break; // Only pick one builder usually
    }
  }

  // --- 4. CACHING / PERFORMANCE PLUGINS ---
  const perfPlugins = [
    { slug: "wp-rocket", name: "WP Rocket" },
    { slug: "litespeed-cache", name: "LiteSpeed Cache" },
    { slug: "perfmatters", name: "Perfmatters" },
    { slug: "autoptimize", name: "Autoptimize" },
    { slug: "w3-total-cache", name: "W3 Total Cache" },
    { slug: "wp-super-cache", name: "WP Super Cache" },
  ];

  for (const p of perfPlugins) {
    const count = urls.filter(u => u.includes(`/wp-content/plugins/${p.slug}/`) || u.includes(`/wp-content/cache/${p.slug}/`)).length;
    if (count > 0) {
      const perfTech: DetectedTechnology = {
        type: "plugin",
        name: p.name,
        slug: p.slug,
        confidence: count > 1 ? "confirmed" : "likely",
        evidence: [`Asset loaded from ${p.slug} directory (${count} instances)`]
      };
      result.performancePlugins.push(perfTech);
      addTech(perfTech);
    }
  }

  // --- 5. IMAGE OPTIMIZATION PLUGINS ---
  const imgPlugins = [
    { slug: "shortpixel-image-optimiser", name: "ShortPixel" },
    { slug: "ewww-image-optimizer", name: "EWWW Image Optimizer" },
    { slug: "imagify", name: "Imagify" },
    { slug: "wp-smushit", name: "Smush" },
    { slug: "optimole-wp", name: "Optimole" },
  ];

  for (const p of imgPlugins) {
    const count = urls.filter(u => u.includes(`/wp-content/plugins/${p.slug}/`)).length;
    let urlPatternCount = 0;
    if (p.slug === "optimole-wp") urlPatternCount = urls.filter(u => u.includes("optimole.com")).length;
    if (p.slug === "shortpixel-image-optimiser") urlPatternCount = urls.filter(u => u.includes("shortpixel.ai")).length;
    
    if (count > 0 || urlPatternCount > 0) {
      const imgTech: DetectedTechnology = {
        type: "plugin",
        name: p.name,
        slug: p.slug,
        confidence: (count + urlPatternCount) > 1 ? "confirmed" : "likely",
        evidence: [`Assets associated with ${p.name} detected (${count + urlPatternCount} instances)`]
      };
      result.imagePlugins.push(imgTech);
      addTech(imgTech);
    }
  }

  // --- 6. CDN ---
  const cdnProviders = [
    { name: "Cloudflare", indicator: "cloudflare" },
    { name: "Fastly", indicator: "fastly" },
    { name: "Bunny CDN", indicator: "b-cdn.net" },
    { name: "CloudFront", indicator: "cloudfront.net" },
  ];

  for (const c of cdnProviders) {
    const count = urls.filter(u => u.includes(c.indicator)).length;
    if (count > 0) {
      const cdnTech: DetectedTechnology = {
        type: "cdn",
        name: c.name,
        confidence: count > 2 ? "confirmed" : "likely",
        evidence: [`Detected ${c.name} domain patterns (${count} instances)`]
      };
      result.cdn = cdnTech;
      addTech(cdnTech);
      break;
    }
  }

  // --- 7. THIRD PARTY SCRIPTS ---
  const thirdParty = [
    { name: "Google Tag Manager", indicator: "googletagmanager.com/gtm.js" },
    { name: "Google Analytics", indicator: "google-analytics.com/analytics.js" },
    { name: "Google Analytics 4", indicator: "googletagmanager.com/gtag/js" },
    { name: "jQuery", indicator: "jquery.min.js" },
    { name: "Meta Pixel", indicator: "connect.facebook.net/en_US/fbevents.js" },
  ];

  for (const t of thirdParty) {
    const count = urls.filter(u => u.includes(t.indicator)).length;
    if (count > 0) {
      const scriptTech: DetectedTechnology = {
        type: "script",
        name: t.name,
        confidence: "confirmed", // 3rd party scripts are usually exact match URLs
        evidence: [`Detected script URL matching ${t.name}`]
      };
      result.thirdPartyScripts.push(scriptTech);
      addTech(scriptTech);
    }
  }

  return result;
}
