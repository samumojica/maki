import { WordPressFix } from "./types";
import { lcpImageLazyLoaded, lcpImageTooLarge } from "./fixes/lcp";
import { renderBlockingCss, unusedCss } from "./fixes/css";
import { unusedJavascript, thirdPartyJavascript, mainThreadWork } from "./fixes/javascript";
import { serverResponseTime, domSize } from "./fixes/server";
import { fontDisplay, layoutShiftImages } from "./fixes/fonts-cls";

export const WP_FIX_LIBRARY: WordPressFix[] = [
  lcpImageLazyLoaded,
  lcpImageTooLarge,
  renderBlockingCss,
  unusedCss,
  unusedJavascript,
  thirdPartyJavascript,
  mainThreadWork,
  serverResponseTime,
  domSize,
  fontDisplay,
  layoutShiftImages
];

export * from "./types";
