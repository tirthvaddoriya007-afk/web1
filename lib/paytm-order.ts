import { getPaytmConfig, getPaytmPaymentStatus } from "@/lib/paytm";
import { createAdminClient } from "@/lib/supabase/server";

export type PaytmOrderVerification =
  | { state: "verified"; orderId: string; paymentMode: string; paymentStatus: "Verified"; status: "Confirmed" }
  | { state: "cancelled-paid"; orderId: string; paymentMode: string; paymentStatus: "Verified"; status: "Cancelled" }
  | { state: "pending"; orderId: string; paymentMode: string; paymentStatus: string; status: string };

function verifiedResult(orderId: string, paymentMode: string, cancelled: boolean): PaytmOrderVerification {
  if (cancelled) {
    return {
      state: "cancelled-paid",
      orderId,
      paymentMode,
      paymentStatus: "Verified",
      status: "Cancelled",
    };
  }
  return {
    state: "verified",
    orderId,
    paymentMode,
    paymentStatus: "Verified",
    status: "Confirmed",
  };
}

export async function verifyAndUpdatePaytmOrder(orderId: string): Promise<PaytmOrderVerification> {
  const supabase = createAdminClient();
  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("id, total, advance_amount, payment_mode, payment_provider, payment_status, status, items, customer_phone, meta_measurement_consent, purchase_event_sent_at, meta_fbp, meta_fbc, meta_client_ip, meta_user_agent")
    .eq("id", orderId)
    .maybeSingle();

  if (readError) {
    console.error("Could not load order for Paytm verification:", readError.message);
    throw new Error("Could not load the order.");
  }
  if (!order) throw new Error("Order not found.");
  if (order.payment_provider !== "paytm") throw new Error("This order is not a Paytm payment.");

  const amountDue = Number(order.advance_amount);
  if (!Number.isFinite(amountDue) || amountDue <= 0) {
    throw new Error("The order has an invalid payment amount.");
  }

  if (order.payment_status === "Verified") {
    return verifiedResult(order.id, order.payment_mode, order.status === "Cancelled");
  }

  const payment = await getPaytmPaymentStatus(order.id);
  if (payment.orderId !== order.id || payment.mid !== getPaytmConfig().mid) {
    console.error("Paytm status did not match the stored order.");
    throw new Error("Paytm payment status could not be matched to the order.");
  }

  if (payment.resultInfo?.resultStatus !== "TXN_SUCCESS") {
    return {
      state: "pending",
      orderId: order.id,
      paymentMode: order.payment_mode,
      paymentStatus: order.payment_status,
      status: order.status,
    };
  }

  const receivedAmount = Number(payment.txnAmount);
  if (!Number.isFinite(receivedAmount) || receivedAmount.toFixed(2) !== amountDue.toFixed(2)) {
    console.error("Paytm reported a successful transaction with an unexpected amount.");
    throw new Error("Paytm payment amount does not match the order.");
  }

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "Verified",
      status: order.status === "Cancelled" ? "Cancelled" : "Confirmed",
      gateway_transaction_id: payment.txnId ?? null,
    })
    .eq("id", order.id)
    .eq("payment_status", "Pending")
    .eq("status", order.status)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("Could not save Paytm payment verification:", updateError.message);
    throw new Error("Could not save payment verification.");
  }

  if (!updated) {
    const { data: latest, error: latestError } = await supabase
      .from("orders")
      .select("payment_status, status")
      .eq("id", order.id)
      .maybeSingle();
    if (latestError) {
      console.error("Could not reload order after Paytm verification:", latestError.message);
      throw new Error("Could not confirm the latest order status.");
    }
    if (latest?.payment_status === "Verified") {
      return verifiedResult(order.id, order.payment_mode, latest.status === "Cancelled");
    }
    throw new Error("Order status changed before Paytm verification could be saved.");
  }

  if (
    order.status !== "Cancelled" &&
    order.payment_mode !== "Cash on Delivery" &&
    order.meta_measurement_consent &&
    !order.purchase_event_sent_at
  ) {
    const { sendPurchaseEvent } = await import("@/lib/meta-capi");
    const eventError = await sendPurchaseEvent(order as Record<string, unknown>);
    if (eventError) {
      console.error("Paytm-verified order Meta Purchase event was not sent:", eventError);
    } else {
      const { error: eventUpdateError } = await supabase
        .from("orders")
        .update({ purchase_event_sent_at: new Date().toISOString() })
        .eq("id", order.id);
      if (eventUpdateError) {
        console.error("Meta accepted Paytm-verified Purchase but its sent status could not be saved:", eventUpdateError.message);
      }
    }
  }

  return verifiedResult(order.id, order.payment_mode, order.status === "Cancelled");
}
