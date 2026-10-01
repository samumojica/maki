import { WordPressFix } from "../types";

export const lcpImageLazyLoaded: WordPressFix = {
  id: "lcp-image-lazy-loaded",
  category: "Images",
  title: "Your main image is lazy-loaded (LCP penalty)",
  impact: "high",
  appliesWhen: {
    metric: "LCP",
  },
  problem: "The Largest Contentful Paint (LCP) image is being lazy-loaded. Lazy loading tells the browser to wait to load the image until it scrolls into view, but because this image is at the top of your page, waiting causes a massive performance delay.",
  whyItMatters: "LCP is a Core Web Vital. Delaying your most important image guarantees a failed LCP score.",
  genericWordPressSteps: [
    { order: 1, instruction: "Identify the plugin or theme feature handling image lazy loading (e.g., Jetpack, a caching plugin, or your theme settings)." },
    { order: 2, instruction: "Find the setting for 'Lazy Load Exclusions'." },
    { order: 3, instruction: "Add the filename of the LCP image to the exclusion list, or add a CSS class like 'no-lazy' to the image." },
    { order: 4, instruction: "Clear your page cache." }
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Open WordPress Admin and go to Settings → Perfmatters." },
        { order: 2, instruction: "Navigate to the Lazy Load tab." },
        { order: 3, instruction: "Find the 'Exclude from Lazy Loading' box." },
        { order: 4, instruction: "Enter the filename of the LCP image (or the CSS class of the image container)." },
        { order: 5, instruction: "Save changes and clear your cache." }
      ]
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Open WordPress Admin and go to Settings → WP Rocket." },
        { order: 2, instruction: "Navigate to the Media tab." },
        { order: 3, instruction: "Under 'Excluded images or iframes', enter the filename of the LCP image." },
        { order: 4, instruction: "Save changes and WP Rocket will automatically clear the cache." }
      ]
    },
    "litespeed-cache": {
      steps: [
        { order: 1, instruction: "Open WordPress Admin and go to LiteSpeed Cache → Page Optimization." },
        { order: 2, instruction: "Navigate to the Media Excludes tab." },
        { order: 3, instruction: "Enter the filename of the LCP image into the 'Lazy Load Image Excludes' field." },
        { order: 4, instruction: "Save changes and purge the LiteSpeed cache." }
      ]
    },
    autoptimize: {
      steps: [
        { order: 1, instruction: "Open WordPress Admin and go to Settings → Autoptimize." },
        { order: 2, instruction: "Navigate to the Images tab." },
        { order: 3, instruction: "Find the 'Lazy-load exclusions' field." },
        { order: 4, instruction: "Add the filename of the LCP image to the comma-separated list." },
        { order: 5, instruction: "Save changes." }
      ]
    }
  },
  verification: [
    "Run Maki again.",
    "Verify the LCP image loads immediately instead of popping in late.",
    "Check your LCP time before and after."
  ]
};

export const lcpImageTooLarge: WordPressFix = {
  id: "lcp-image-too-large",
  category: "Images",
  title: "LCP image is too heavy",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["uses-optimized-images", "modern-image-formats", "uses-responsive-images"],
    metric: "LCP"
  },
  problem: "The Largest Contentful Paint (LCP) image has a large file size, which takes too long to download.",
  whyItMatters: "Large images are the most common cause of slow LCP. Compressing and serving in modern formats (like WebP) can drastically cut download times.",
  genericWordPressSteps: [
    { order: 1, instruction: "Install an image optimization plugin (like ShortPixel, Imagify, or Smush) if you haven't already." },
    { order: 2, instruction: "Configure the plugin to compress images and serve them in WebP format." },
    { order: 3, instruction: "Run a bulk optimization on your Media Library." }
  ],
  variants: {
    "shortpixel-image-optimiser": {
      steps: [
        { order: 1, instruction: "Go to Settings → ShortPixel." },
        { order: 2, instruction: "Ensure 'Compression type' is set to Lossy (or Glossy if you need higher quality)." },
        { order: 3, instruction: "Check the box to 'Create WebP versions of the images'." },
        { order: 4, instruction: "Go to Media → Bulk ShortPixel and optimize the LCP image." }
      ]
    },
    imagify: {
      steps: [
        { order: 1, instruction: "Go to Settings → Imagify." },
        { order: 2, instruction: "Ensure the optimization level is set to 'Smart'." },
        { order: 3, instruction: "Check the option to create WebP versions of images." },
        { order: 4, instruction: "Go to Media → Bulk Optimization and optimize the library." }
      ]
    }
  },
  verification: [
    "Open the page in an incognito window.",
    "Right-click the hero image and check if it is served as a WebP file.",
    "Verify the file size is significantly smaller."
  ]
};
