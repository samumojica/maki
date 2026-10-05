import { NextResponse } from "next/server";
import { BUDGETS, type LeadType } from "@/lib/services";

// getmaki.app is verified in Resend. leads@getmaki.app is a Cloudflare Email Routing alias;
// LEADS_TO_EMAIL (App Hosting secret) can point notifications somewhere else.
const LEADS_FROM_EMAIL = process.env.LEADS_FROM_EMAIL ?? "Maki Leads <leads@getmaki.app>";
const LEADS_TO_EMAIL = process.env.LEADS_TO_EMAIL ?? "leads@getmaki.app";

// Best-effort, per-instance throttle against form spam. Not a substitute for a real rate limiter.
const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field.
  if (str(body.company_website, 200)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const type: LeadType = body.type === "build" ? "build" : "fix";
  const lead = {
    type,
    name: str(body.name, 120),
    email: str(body.email, 200),
    website: str(body.website, 300),
    businessType: str(body.businessType, 200),
    budget: BUDGETS.includes(body.budget as (typeof BUDGETS)[number]) ? (body.budget as string) : "",
    message: str(body.message, 3000),
    scanId: str(body.scanId, 100),
    source: str(body.source, 100),
    createdAt: Date.now(),
  };

  if (!lead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || !lead.message) {
    return NextResponse.json({ error: "Please add your name, a valid email and a short message." }, { status: 400 });
  }
  if (!lead.website && lead.scanId) {
    try {
      const { getScan } = await import("@/lib/scan-store");
      lead.website = (await getScan(lead.scanId))?.audit.url ?? "";
    } catch {
      // Firestore unavailable — fall through to validation
    }
  }
  if (type === "fix" && !lead.website) {
    return NextResponse.json({ error: "Please add the website you want us to fix." }, { status: 400 });
  }

  let saved = false;
  try {
    const { db } = await import("@/lib/db");
    await db.collection("leads").add(lead);
    saved = true;
  } catch (err) {
    console.error("[lead] Firestore save failed:", err);
  }

  let emailed = false;
  if (process.env.RESEND_API_KEY) {
    const label = type === "fix" ? "Fix my site" : "Build a new site";
    const details = [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      lead.website && `Website: ${lead.website}`,
      lead.businessType && `Business: ${lead.businessType}`,
      lead.budget && `Budget: ${lead.budget}`,
      lead.scanId && `Maki scan: ${process.env.NEXT_PUBLIC_BASE_URL ?? "https://getmaki.app"}/scan/${lead.scanId}`,
      lead.source && `Source: ${lead.source}`,
    ]
      .filter(Boolean)
      .join("\n");
    const text = `New Maki lead — ${label}\n\n${details}\n\n${lead.message}`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: LEADS_FROM_EMAIL,
          to: [LEADS_TO_EMAIL],
          reply_to: lead.email,
          subject: `New lead: ${label} — ${lead.name}`,
          text,
        }),
      });
      emailed = res.ok;
      if (!res.ok) console.error("[lead] Resend error:", res.status, await res.text());
    } catch (err) {
      console.error("[lead] Resend request failed:", err);
    }
  }

  if (!saved && !emailed) {
    return NextResponse.json(
      { error: "We couldn't send your request. Please email support@getmaki.app instead." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
