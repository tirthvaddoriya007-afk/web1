import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  let requestOrigin = "";
  try {
    requestOrigin = origin ? new URL(origin).origin : "";
  } catch {
    requestOrigin = "";
  }
  if (!requestOrigin || requestOrigin !== request.nextUrl.origin) {
    return responseError("Invalid request origin.", 403);
  }

  const rawBody = await request.text();
  if (rawBody.length > 2_000) return responseError("Lookup request is too large.", 413);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return responseError("Invalid JSON payload.", 400);
  }
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return responseError("Enter an order ID and phone number.", 400);
  }
  const body = payload as Record<string, unknown>;
  if (typeof body.orderId !== "string" ||
      !/^OD[A-F0-9]{32}$/.test(body.orderId.trim()) ||
      typeof body.phone !== "string" ||
      !/^[6-9]\d{9}$/.test(body.phone.replace(/\D/g, ""))) {
    return responseError("Enter a valid order ID and 10-digit phone number.", 400);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Order lookup is not configured: Supabase server credentials are missing.");
    return responseError("Order lookup is not configured.", 503);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_phone, total, advance_amount, balance_due, payment_mode, payment_status, status, placed_at, tracking_number, tracking_url")
    .eq("id", body.orderId.trim())
    .maybeSingle();

  if (error) {
    console.error("Could not look up order:", error.message);
    return responseError("Order lookup is temporarily unavailable.", 502);
  }
  if (!data || data.customer_phone.replace(/\D/g, "") !== body.phone.replace(/\D/g, "")) {
    return responseError("No matching order was found.", 404);
  }

  return NextResponse.json({
    order: {
      id: data.id,
      total: Number(data.total),
      advanceAmount: Number(data.advance_amount),
      balanceDue: Number(data.balance_due),
      paymentMode: data.payment_mode,
      paymentStatus: data.payment_status,
      status: data.status,
      placedAt: data.placed_at,
      trackingNumber: data.tracking_number,
      trackingUrl: data.tracking_url,
    },
  });
}
