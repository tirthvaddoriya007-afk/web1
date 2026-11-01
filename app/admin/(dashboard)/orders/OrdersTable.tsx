"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/data";

type AdminOrder = {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: { flat: string; area: string; city: string; state?: string; pin: string };
  items: { name: string; qty: number; size?: string }[];
  total: number;
  advance_amount: number;
  balance_due: number;
  payment_mode: string;
  payment_status: string;
  status: string;
  placed_at: string;
  tracking_number: string | null;
  tracking_url: string | null;
  meta_measurement_consent: boolean;
  purchase_event_sent_at: string | null;
};

type Draft = { status: string; trackingNumber: string; trackingUrl: string };
const STATUSES = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function OrdersTable({ orders: initialOrders }: { orders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(initialOrders.map((order) => [order.id, {
      status: order.status === "Awaiting advance" || order.status === "Awaiting payment"
        ? "Confirmed"
        : order.status,
      trackingNumber: order.tracking_number ?? "",
      trackingUrl: order.tracking_url ?? "",
    }]))
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const updateDraft = (id: string, values: Partial<Draft>) => {
    setDrafts((existing) => ({ ...existing, [id]: { ...existing[id], ...values } }));
  };

  const sendUpdate = async (id: string, payload: Record<string, string>) => {
    setBusy(id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || result?.metaMessage || "Order update failed.");

      setOrders((current) => current.map((order) => order.id === id
        ? {
            ...order,
            status: result.order.status ?? order.status,
            payment_status: result.order.paymentStatus ?? order.payment_status,
            tracking_number: result.order.trackingNumber ?? order.tracking_number,
            tracking_url: result.order.trackingUrl ?? order.tracking_url,
            purchase_event_sent_at: result.metaEvent === "sent" ? new Date().toISOString() : order.purchase_event_sent_at,
          }
        : order));
      if (payload.action === "verify-payment" || payload.action === "verify-advance") {
        const order = orders.find((item) => item.id === id);
        const note = order?.payment_mode === "Cash on Delivery"
          ? "COD advance verified. Opted-in Purchase measurement is available after delivery."
          : result.metaEvent === "sent"
            ? "Payment verified; Meta Purchase event sent."
            : result.metaEvent === "failed"
              ? `Payment verified, but Meta event failed: ${result.metaMessage}`
              : "Payment verified. No Meta Purchase event was sent because customer consent was not recorded.";
        setMessage(note);
      } else if (payload.action === "retry-purchase-event") {
        setMessage(result.metaEvent === "sent"
          ? "Meta Purchase event sent."
          : `Meta Purchase event failed: ${result.metaMessage}`);
      } else {
        setMessage("Order fulfillment updated.");
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Order update failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Verify each UPI transfer against your bank/UPI statement before confirming the order.</p>
      {message && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{message}</p>}
      {orders.length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-gray-600">No orders yet.</p>}

      {orders.map((order) => {
        const draft = drafts[order.id];
        return (
          <section key={order.id} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-900">{order.id}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(order.placed_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">{order.status}</span>
            </div>

            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <p className="font-semibold">{order.customer_name} · {order.customer_phone}</p>
                <p className="text-xs leading-relaxed text-gray-600">
                  {order.address.flat}, {order.address.area}, {order.address.city}
                  {order.address.state ? `, ${order.address.state}` : ""} - {order.address.pin}
                </p>
              </div>
              <div className="text-gray-700">
                <p>Order total: <strong>{formatPrice(Number(order.total))}</strong></p>
                <p>Payment method: <strong>{order.payment_mode}</strong></p>
                <p>{order.payment_mode === "Cash on Delivery" ? "UPI advance" : "UPI payment"}: <strong>{formatPrice(Number(order.advance_amount))}</strong> · {order.payment_status}</p>
                {order.payment_mode === "Cash on Delivery" && (
                  <p>Due on delivery: <strong>{formatPrice(Number(order.balance_due))}</strong></p>
                )}
              </div>
            </div>

            <ul className="list-inside list-disc text-xs text-gray-600">
              {order.items.map((item, index) => (
                <li key={`${order.id}-${index}`}>{item.name} × {item.qty}{item.size ? ` · ${item.size}` : ""}</li>
              ))}
            </ul>

            {order.payment_status === "Pending" && order.status !== "Cancelled" && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy === order.id}
                  onClick={() => void sendUpdate(order.id, { action: "verify-payment" })}
                  className="rounded-lg bg-[#9f2089] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy === order.id
                    ? "Updating..."
                    : order.payment_mode === "Cash on Delivery"
                      ? "Verify COD advance and confirm"
                      : "Verify payment and confirm"}
                </button>
                <button
                  type="button"
                  disabled={busy === order.id}
                  onClick={() => void sendUpdate(order.id, {
                    action: "update-fulfillment",
                    status: "Cancelled",
                    trackingNumber: "",
                    trackingUrl: "",
                  })}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                >
                  Cancel order
                </button>
              </div>
            )}

            {order.status === "Cancelled" && (
              <p className="text-xs text-amber-800">
                Check whether any UPI payment was received. Refund the received amount manually to the original UPI account, then contact the customer.
              </p>
            )}

            {order.payment_status === "Verified" && order.status !== "Cancelled" && (
              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  aria-label={`Fulfillment status for ${order.id}`}
                  value={draft.status}
                  onChange={(event) => updateDraft(order.id, { status: event.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
                <input
                  aria-label={`Tracking number for ${order.id}`}
                  value={draft.trackingNumber}
                  onChange={(event) => updateDraft(order.id, { trackingNumber: event.target.value })}
                  placeholder="Tracking number"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  aria-label={`Tracking URL for ${order.id}`}
                  value={draft.trackingUrl}
                  onChange={(event) => updateDraft(order.id, { trackingUrl: event.target.value })}
                  placeholder="HTTPS tracking URL"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={busy === order.id}
                  onClick={() => void sendUpdate(order.id, {
                    action: "update-fulfillment",
                    status: draft.status,
                    trackingNumber: draft.trackingNumber,
                    trackingUrl: draft.trackingUrl,
                  })}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 disabled:opacity-60 sm:col-span-3"
                >
                  {busy === order.id ? "Saving..." : "Save fulfillment and tracking"}
                </button>
                {order.purchase_event_sent_at && (
                  <p className="text-xs text-green-700 sm:col-span-3">Meta Purchase event sent after payment confirmation.</p>
                )}
                {order.meta_measurement_consent &&
                  !order.purchase_event_sent_at &&
                  (order.payment_mode !== "Cash on Delivery" || order.status === "Delivered") && (
                  <div className="sm:col-span-3">
                    <p className="mb-2 text-xs text-amber-800">
                      Customer consented; Purchase event has not been recorded as sent.
                      {order.payment_mode === "Cash on Delivery" && " The COD order is delivered."}
                    </p>
                    <button
                      type="button"
                      disabled={busy === order.id}
                      onClick={() => void sendUpdate(order.id, { action: "retry-purchase-event" })}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
                    >
                      {busy === order.id ? "Sending..." : "Send/retry Meta Purchase event"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
