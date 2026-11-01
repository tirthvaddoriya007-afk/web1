import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/lib/brand";
import { META_PIXEL_ID } from "@/lib/meta-config";
import { createAdminClient, getAdminUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const FULFILLMENT_STATUSES = new Set([
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
]);

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function hashPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return createHash("sha256").update(normalized).digest("hex");
}

async function sendPurchaseEvent(order: Record<string, unknown>) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!META_PIXEL_ID || !accessToken) return "Meta CAPI is not configured.";

  const items = Array.isArray(order.items) ? order.items : [];
  const userData: Record<string, unknown> = {
    ph: [hashPhone(String(order.customer_phone))],
  };
  if (typeof order.meta_fbp === "string" && order.meta_fbp) userData.fbp = order.meta_fbp;
  if (typeof order.meta_fbc === "string" && order.meta_fbc) userData.fbc = order.meta_fbc;
  if (typeof order.meta_client_ip === "string" && order.meta_client_ip) {
    userData.client_ip_address = order.meta_client_ip;
  }
  if (typeof order.meta_user_agent === "string" && order.meta_user_agent) {
    userData.client_user_agent = order.meta_user_agent;
  }

  const event = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: `purchase-${String(order.id)}`,
      action_source: "website",
      event_source_url: `${brand.siteUrl}/summary`,
      user_data: userData,
      custom_data: {
        content_ids: items.map((item) => String((item as Record<string, unknown>).hash)),
        content_type: "product",
        contents: items.map((item) => {
          const value = item as Record<string, unknown>;
          return {
            id: String(value.hash),
            quantity: Number(value.qty),
            item_price: Number(value.price),
          };
        }),
        value: Number(order.total),
        currency: "INR",
        num_items: items.reduce((count, item) => count + Number((item as Record<string, unknown>).qty), 0),
      },
    }],
  };

  const graphVersion = process.env.META_GRAPH_API_VERSION || "v24.0";
  let response: Response;
  try {
    response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(META_PIXEL_ID)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
        signal: AbortSignal.timeout(8000),
      }
    );
  } catch (error) {
    console.error("Verified-order Meta Purchase event request failed:", error);
    return "Could not reach Meta Conversions API.";
  }

  if (!response.ok) {
    console.error("Meta rejected a verified-order Purchase event:", response.status, await response.text());
    return "Meta Conversions API rejected the Purchase event.";
  }
  return null;
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const origin = request.headers.get("origin");
  let requestOrigin = "";
  try {
    requestOrigin = origin ? new URL(origin).origin : "";
  } catch {
    requestOrigin = "";
  }
  if (!requestOrigin || requestOrigin !== request.nextUrl.origin) {
    return errorResponse("Invalid request origin.", 403);
  }

  const session = await getAdminUser();
  if (!session) return errorResponse("Admin authentication is required.", 401);

  if (!/^OD[A-F0-9]{32}$/.test(context.params.id)) return errorResponse("Invalid order ID.", 400);

  const rawBody = await request.text();
  if (rawBody.length > 4_000) return errorResponse("Order update is too large.", 413);

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse("Invalid JSON payload.", 400);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return errorResponse("Invalid order update.", 400);
  }
  const update = body as Record<string, unknown>;
  const supabase = createAdminClient();
  const { data: current, error: readError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", context.params.id)
    .maybeSingle();

  if (readError) {
    console.error("Could not load order for admin update:", readError.message);
    return errorResponse("Could not load the order.", 502);
  }
  if (!current) return errorResponse("Order not found.", 404);

  if (update.action === "retry-purchase-event") {
    if (current.payment_status !== "Verified" ||
        (current.payment_mode === "Cash on Delivery" && current.status !== "Delivered")) {
      return errorResponse("Verify payment and mark any COD order delivered before sending a Purchase event.", 409);
    }
    if (!current.meta_measurement_consent) {
      return errorResponse("The customer did not consent to Meta purchase measurement.", 409);
    }
    if (current.purchase_event_sent_at) {
      return NextResponse.json({ order: { id: current.id }, metaEvent: "sent", metaMessage: "" });
    }
    const eventError = await sendPurchaseEvent(current as Record<string, unknown>);
    if (eventError) {
      return NextResponse.json({
        order: { id: current.id },
        metaEvent: "failed",
        metaMessage: eventError,
      }, { status: 502 });
    }
    const { error: eventUpdateError } = await supabase
      .from("orders")
      .update({ purchase_event_sent_at: new Date().toISOString() })
      .eq("id", current.id);
    if (eventUpdateError) {
      console.error("Meta accepted Purchase but event status could not be saved:", eventUpdateError.message);
      return NextResponse.json({
        order: { id: current.id },
        metaEvent: "failed",
        metaMessage: "Meta accepted the event, but its sent status could not be saved.",
      }, { status: 502 });
    }
    return NextResponse.json({ order: { id: current.id }, metaEvent: "sent", metaMessage: "" });
  }

  if (update.action === "verify-payment" || update.action === "verify-advance") {
    if (current.status === "Cancelled") return errorResponse("Cancelled orders cannot be confirmed.", 409);

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_status: "Verified", status: "Confirmed" })
      .eq("id", current.id);
    if (updateError) {
      console.error("Could not verify order payment:", updateError.message);
      return errorResponse("Could not update payment verification.", 502);
    }

    let metaEvent: "sent" | "not-consented" | "failed" = "not-consented";
    let metaMessage = "";
    if (current.payment_mode !== "Cash on Delivery" &&
        current.meta_measurement_consent &&
        !current.purchase_event_sent_at) {
      const eventError = await sendPurchaseEvent(current as Record<string, unknown>);
      if (eventError) {
        metaEvent = "failed";
        metaMessage = eventError;
      } else {
        const { error: eventUpdateError } = await supabase
          .from("orders")
          .update({ purchase_event_sent_at: new Date().toISOString() })
          .eq("id", current.id);
        if (eventUpdateError) {
          console.error("Meta accepted Purchase but event status could not be saved:", eventUpdateError.message);
          metaEvent = "failed";
          metaMessage = "Meta accepted the event, but its sent status could not be saved.";
        } else {
          metaEvent = "sent";
        }
      }
    }

    return NextResponse.json({
      order: { id: current.id, status: "Confirmed", paymentStatus: "Verified" },
      metaEvent,
      metaMessage,
    });
  }

  if (update.action !== "update-fulfillment" ||
      typeof update.status !== "string" ||
      !FULFILLMENT_STATUSES.has(update.status) ||
      typeof update.trackingNumber !== "string" ||
      update.trackingNumber.length > 100 ||
      typeof update.trackingUrl !== "string" ||
      update.trackingUrl.length > 500) {
    return errorResponse("Invalid fulfillment update.", 400);
  }
  if (current.status === "Cancelled" && update.status !== "Cancelled") {
    return errorResponse("Cancelled orders cannot be reopened.", 409);
  }
  if (current.payment_status !== "Verified" && update.status !== "Cancelled") {
    return errorResponse("Verify the UPI payment before updating fulfillment.", 409);
  }

  let trackingUrl: string | null = null;
  if (update.trackingUrl.trim()) {
    try {
      const url = new URL(update.trackingUrl.trim());
      if (url.protocol !== "https:") return errorResponse("Tracking links must use HTTPS.", 400);
      trackingUrl = url.toString();
    } catch {
      return errorResponse("Enter a valid HTTPS tracking link.", 400);
    }
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: update.status,
      tracking_number: update.trackingNumber.trim() || null,
      tracking_url: trackingUrl,
    })
    .eq("id", current.id);
  if (updateError) {
    console.error("Could not update order fulfillment:", updateError.message);
    return errorResponse("Could not update order fulfillment.", 502);
  }
  return NextResponse.json({
    order: {
      id: current.id,
      status: update.status,
      trackingNumber: update.trackingNumber.trim() || null,
      trackingUrl,
    },
  });
}
