import { WordPressFix } from "./types";
import { lcpImageLazyLoaded, lcpImageTooLarge } from "./fixes/lcp";
import { renderBlockingCss, unusedCss } from "./fixes/css";
import { unusedJavascript, thirdPartyJavascript, mainThreadWork } from "./fixes/javascript";
import { serverResponseTime, domSize } from "./fixes/server";
import { fontDisplay, layoutShiftImages } from "./fixes/fonts-cls";
import {
  lcpFetchPriority,
  googleFontsExternal,
  heavyEmbeds,
  criticalRequestChains,
  textCompression,
  cachePolicy,
  unminifiedAssets,
  heavyAnalytics,
} from "./fixes/delivery";
import {
  wpEmojis,
  jqueryMigrate,
  dashicons,
  blockLibraryCss,
  wooCartFragments,
  wooAssetsSitewide,
} from "./fixes/wordpress-bloat";

export const WP_FIX_LIBRARY: WordPressFix[] = [
  lcpImageLazyLoaded,
  lcpFetchPriority,
  lcpImageTooLarge,
  renderBlockingCss,
  unusedCss,
  unusedJavascript,
  thirdPartyJavascript,
  heavyAnalytics,
  heavyEmbeds,
  mainThreadWork,
  serverResponseTime,
  textCompression,
  wooCartFragments,
  domSize,
  fontDisplay,
  googleFontsExternal,
  layoutShiftImages,
  criticalRequestChains,
  cachePolicy,
  wooAssetsSitewide,
  blockLibraryCss,
  unminifiedAssets,
  jqueryMigrate,
  dashicons,
  wpEmojis,
];

export * from "./types";
