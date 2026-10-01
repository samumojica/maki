import { WordPressFix } from "../types";

export const unusedJavascript: WordPressFix = {
  id: "unused-javascript",
  category: "JavaScript",
  title: "Reduce unused JavaScript",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["unused-javascript"],
  },
  problem: "JavaScript is the most expensive resource on a webpage. Heavy scripts are being loaded and parsed, but much of the code is never executed on this page.",
  whyItMatters: "Unused JS blocks the main thread, causing slow Interaction to Next Paint (INP) and Total Blocking Time (TBT).",
  genericWordPressSteps: [
    { order: 1, instruction: "Identify the plugin adding the unused JavaScript." },
    { order: 2, instruction: "Use a plugin script manager to disable that plugin from loading on pages where it is not needed." },
    { order: 3, instruction: "Enable 'Delay JavaScript Execution' in your performance plugin." }
  ],
  variants: {
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Script Manager." },
        { order: 2, instruction: "Find the plugin injecting the unused script." },
        { order: 3, instruction: "Toggle it off for the current URL, Post Type, or Site-Wide (adding exceptions where needed)." },
        { order: 4, instruction: "Save changes." }
      ]
    },
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket." },
        { order: 2, instruction: "Navigate to the File Optimization tab." },
        { order: 3, instruction: "Scroll down to 'Delay JavaScript execution' and enable it." },
        { order: 4, instruction: "This will delay the loading of unused third-party and plugin JS until the user interacts with the page." }
      ]
    }
  },
  verification: [
    "Run PageSpeed Insights again to verify the script is no longer flagged.",
    "Interact with the page (scroll, click menus) to ensure nothing is broken."
  ]
};

export const thirdPartyJavascript: WordPressFix = {
  id: "third-party-javascript",
  category: "JavaScript",
  title: "Delay heavy third-party scripts",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["third-party-summary"],
  },
  problem: "External scripts (like analytics, chat widgets, and ads) are slowing down the initial load of your page.",
  whyItMatters: "Third-party scripts often execute long tasks that block the main thread, destroying INP and TBT scores.",
  genericWordPressSteps: [
    { order: 1, instruction: "Identify the heaviest third-party scripts (e.g., chat widgets, trackers)." },
    { order: 2, instruction: "Use your performance plugin to 'Delay JavaScript execution' until user interaction." },
    { order: 3, instruction: "Alternatively, host the scripts locally if your plugin supports it." }
  ],
  variants: {
    "wp-rocket": {
      steps: [
        { order: 1, instruction: "Go to Settings → WP Rocket → File Optimization." },
        { order: 2, instruction: "Check 'Delay JavaScript execution'." },
        { order: 3, instruction: "This solves almost all third-party script blocking issues automatically." }
      ]
    },
    perfmatters: {
      steps: [
        { order: 1, instruction: "Go to Settings → Perfmatters → Assets." },
        { order: 2, instruction: "Enable 'Delay Javascript'." },
        { order: 3, instruction: "Choose 'Delay All' or add specific third-party URLs to the delay list." },
        { order: 4, instruction: "If using Google Analytics, enable 'Local Analytics' under the Analytics tab." }
      ]
    }
  },
  verification: [
    "Check PageSpeed Insights. The third-party code warning should disappear.",
    "Load the page, wait 3 seconds, then move your mouse. The chat widget or analytics should pop in only after you move."
  ]
};

export const mainThreadWork: WordPressFix = {
  id: "excessive-main-thread-work",
  category: "JavaScript",
  title: "Minimize main-thread work",
  impact: "high",
  appliesWhen: {
    lighthouseAuditIds: ["mainthread-work-breakdown", "bootup-time"],
    metric: "INP"
  },
  problem: "The browser's main thread is too busy executing JavaScript to respond to user clicks.",
  whyItMatters: "This is the primary cause of poor Interaction to Next Paint (INP).",
  genericWordPressSteps: [
    { order: 1, instruction: "Delay all non-critical JavaScript until user interaction." },
    { order: 2, instruction: "Remove unnecessary plugins that inject heavy tracking or UI features." }
  ],
  variants: {},
  verification: ["Verify INP and TBT scores improve."]
};
