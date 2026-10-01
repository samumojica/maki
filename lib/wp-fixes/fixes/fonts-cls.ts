import { WordPressFix } from "../types";

export const fontDisplay: WordPressFix = {
  id: "font-display",
  category: "CSS",
  title: "Ensure text remains visible during webfont load",
  impact: "medium",
  appliesWhen: {
    lighthouseAuditIds: ["font-display"],
  },
  problem: "Custom fonts hide text while they are downloading (FOIT - Flash of Invisible Text).",
  whyItMatters: "This delays the user's ability to read your content and worsens FCP/LCP.",
  genericWordPressSteps: [
    { order: 1, instruction: "Use a performance plugin or theme setting to add 'font-display: swap' to your Google Fonts or local fonts." }
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Fonts." },
        { order: 2, instruction: "Enable 'Display Swap'." },
        { order: 3, instruction: "Save changes." }
      ]
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket → File Optimization." },
        { order: 2, instruction: "Enable 'Optimize Google Fonts'." },
        { order: 3, instruction: "WP Rocket automatically applies 'font-display: swap'." }
      ]
    },
    elementor: {
      steps: [
        { order: 1, instruction: "Go to Elementor → Settings → Advanced." },
        { order: 2, instruction: "Set 'Google Fonts Load' to 'Swap'." },
        { order: 3, instruction: "Regenerate CSS in Elementor → Tools." }
      ]
    }
  },
  verification: [
    "Run PageSpeed Insights and verify the 'Ensure text remains visible' audit is passed."
  ]
};

export const layoutShiftImages: WordPressFix = {
  id: "layout-shift-images",
  category: "Structure",
  title: "Images are causing layout shifts",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["layout-shift-elements"], // Requires custom matching for img tags
    metric: "CLS"
  },
  problem: "Images are loading without explicit width and height attributes. When they finally load, they push other content out of the way.",
  whyItMatters: "This is the #1 cause of Cumulative Layout Shift (CLS).",
  genericWordPressSteps: [
    { order: 1, instruction: "Ensure you add images through the standard WordPress editor, which adds width/height attributes automatically." },
    { order: 2, instruction: "If an image is in custom HTML or a slider, manually add width=\"100\" height=\"100\" (using the real aspect ratio)." },
    { order: 3, instruction: "Use a performance plugin to 'Add Missing Image Dimensions'." }
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Lazy Load." },
        { order: 2, instruction: "Enable 'Add Missing Image Dimensions'." },
        { order: 3, instruction: "Save changes." }
      ]
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket → Media." },
        { order: 2, instruction: "Enable 'Add missing image dimensions'." },
        { order: 3, instruction: "Save changes." }
      ]
    }
  },
  verification: [
    "Check PageSpeed Insights CLS score.",
    "Verify the specific image no longer shifts the layout as it loads."
  ]
};
