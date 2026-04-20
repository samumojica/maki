import { NextRequest, NextResponse } from "next/server";
import { CheckoutRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const [{ stripe, PRICES }, { getScan }] = await Promise.all([
      import("@/lib/stripe-client"),
      import("@/lib/scan-store"),
    ]);

    const body: CheckoutRequest = await req.json();
    const { scanId } = body;

    if (!scanId) {
      return NextResponse.json({ error: "Missing scanId" }, { status: 400 });
    }

    const entry = getScan(scanId);
    if (!entry) {
      return NextResponse.json(
        { error: "Scan expired. Please run a new scan." },
        { status: 410 }
      );
    }

    const { url, tier } = entry;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Maki — ${PRICES[tier].label}`,
              description: "One-time Core Web Vitals audit report. PDF download included.",
            },
            unit_amount: PRICES[tier].amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/results?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/scan/${scanId}`,
      metadata: { scanId, url, tier },
    });

    return NextResponse.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
