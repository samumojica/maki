import { WP_FIX_LIBRARY, type WordPressFix } from "@/lib/wp-fixes";

export const PLUGIN_NAMES: Record<string, string> = {
  perfmatters: "Perfmatters",
  "wp-rocket": "WP Rocket",
  "litespeed-cache": "LiteSpeed Cache",
  autoptimize: "Autoptimize",
  "w3-total-cache": "W3 Total Cache",
  "wp-super-cache": "WP Super Cache",
  elementor: "Elementor",
  generatepress: "GeneratePress",
  "shortpixel-image-optimiser": "ShortPixel",
  "ewww-image-optimizer": "EWWW Image Optimizer",
  imagify: "Imagify",
  "wp-smushit": "Smush",
  "optimole-wp": "Optimole",
};

/** Core Web Vital each fix primarily moves, for badges and filtering. */
export function fixMetric(fix: WordPressFix): string {
  if (fix.appliesWhen.metric && fix.appliesWhen.metric !== "general") return fix.appliesWhen.metric;
  if (fix.category === "JavaScript") return "INP";
  if (fix.category === "CSS") return "LCP";
  return "Speed";
}

export function getFix(slug: string) {
  return WP_FIX_LIBRARY.find((f) => f.id === slug);
}

export function fixVariantNames(fix: WordPressFix) {
  return Object.keys(fix.variants ?? {}).map((k) => PLUGIN_NAMES[k] ?? k);
}
