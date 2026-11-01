import { NextRequest, NextResponse } from "next/server";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { verifyAndUpdatePaytmOrder } from "@/lib/paytm-order";
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

  if (update.action === "verify-paytm-status") {
    if (current.payment_provider !== "paytm") {
      return errorResponse("This order does not use Paytm checkout.", 409);
    }
    try {
      const result = await verifyAndUpdatePaytmOrder(current.id);
      return NextResponse.json({
        state: result.state,
        order: {
          id: result.orderId,
          status: result.status,
          paymentStatus: result.paymentStatus,
        },
      });
    } catch (error) {
      console.error("Could not check Paytm order status from admin:", error);
      const message = error instanceof Error ? error.message : "Could not check Paytm payment status.";
      return errorResponse(message, message === "Order not found." ? 404 : 502);
    }
  }

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
    if (current.payment_provider === "paytm") {
      return errorResponse("Paytm orders must be verified against Paytm status; manual confirmation is disabled.", 409);
    }
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
