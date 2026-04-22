import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia" as any,
});

export const PRICES = {
  basic: {
    amount: 900, // $9.00 in cents
    label: "Basic — 1 URL",
  },
} as const;
