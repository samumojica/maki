import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PRICES = {
  basic: {
    amount: 900, // $9.00 in cents
    label: "Basic — 1 URL",
  },
  pro: {
    amount: 2900, // $29.00 in cents
    label: "Pro — 5 URLs",
  },
} as const;
