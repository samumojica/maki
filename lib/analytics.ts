import { sendGAEvent } from "@next/third-parties/google";

/** GA4 measurement ID. Override per environment with NEXT_PUBLIC_GA_ID. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-D99NNJTT2K";

/** Only production traffic is sent to GA, so local development doesn't skew the numbers. */
export const ANALYTICS_ENABLED = process.env.NODE_ENV === "production";

/** Send a GA4 event. No-op outside production. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (!ANALYTICS_ENABLED || typeof window === "undefined") return;
  sendGAEvent("event", event, params);
}

/** The one product Maki sells, in GA4 ecommerce format. Keep in sync with PRICES in lib/stripe-client.ts. */
export const FIX_PLAN_ITEM = { item_id: "wp-fix-plan", item_name: "WordPress Fix Plan", price: 9, quantity: 1 };
