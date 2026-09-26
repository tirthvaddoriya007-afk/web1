import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isBot } from "@/lib/ua";

// Pay Now / Place Order click beacon. PaymentClient fires this fire-and-forget
// POST the moment the visitor taps the button; this route stores one row in
// pay_clicks and reuses the same visitor cookie as /api/track. Always answers
// 204, even when the insert fails — analytics must never break checkout.

export const runtime = "nodejs";

const VISITOR_COOKIE = "hs_vid";
const METHODS = new Set(["gpay", "phonepe", "paytm", "cod"]);

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || isBot(ua)) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const method = typeof body.method === "string" && METHODS.has(body.method)
    ? body.method
    : "";
  if (!method) return new NextResponse(null, { status: 204 });

  const amount =
    typeof body.amount === "number" && Number.isFinite(body.amount) && body.amount >= 0
      ? body.amount
      : 0;

  let visitorId = req.cookies.get(VISITOR_COOKIE)?.value ?? "";
  const response = new NextResponse(null, { status: 204 });
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }

  try {
    const supabase = createClient();
    await supabase.from("pay_clicks").insert({
      visitor_id: visitorId,
      method,
      amount,
    });
  } catch {
    // Never fail checkout because analytics is down.
  }

  return response;
}
