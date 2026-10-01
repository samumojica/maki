export interface FixStep {
  order: number;
  instruction: string;
}

export interface FixVariant {
  steps: FixStep[];
  notes?: string[];
}

export interface WordPressFix {
  id: string;
  category: string; // e.g., "Images", "CSS", "JavaScript", "Server"
  title: string;
  impact: "high" | "medium" | "low";

  appliesWhen: {
    lighthouseAuditIds?: string[];
    metric?: "LCP" | "INP" | "CLS" | "TTFB" | "general";
  };

  problem: string;
  whyItMatters: string;

  genericWordPressSteps: FixStep[];

  variants?: {
    perfmatters?: FixVariant;
    "wp-rocket"?: FixVariant;
    "litespeed-cache"?: FixVariant;
    autoptimize?: FixVariant;
    "w3-total-cache"?: FixVariant;
    "wp-super-cache"?: FixVariant;
    elementor?: FixVariant;
    generatepress?: FixVariant;
    "shortpixel-image-optimiser"?: FixVariant;
    "ewww-image-optimizer"?: FixVariant;
    imagify?: FixVariant;
    "wp-smushit"?: FixVariant;
    "optimole-wp"?: FixVariant;
  };

  verification: string[];
  caution?: string[];
}

export interface WordPressFixRecommendation {
  fixId: string;
  impact: "high" | "medium" | "low";
  title: string;
  resource?: string | string[]; // Dynamic context: e.g. "https://example.com/hero.jpg"
  context: {
    plugin?: string; // The selected variant plugin name, if any
    pluginSlug?: string;
    confidence: "confirmed" | "likely" | "unknown";
  };
  steps: string[]; // Selected steps (generic or variant)
  verification: string[];
  caution?: string[];
}
