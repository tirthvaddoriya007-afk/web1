"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";

type TrackedOrder = {
  id: string;
  total: number;
  advanceAmount: number;
  balanceDue: number;
  paymentMode: string;
  paymentStatus: string;
  status: string;
  placedAt: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

export default function OrderPage() {
  const { orders, ready } = useStore();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const lookupOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearching(true);
    setError("");
    setTrackedOrder(null);
    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone: phone.replace(/\D/g, "") }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.order) throw new Error(result?.error || "Order lookup failed.");
      setTrackedOrder(result.order);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Order lookup failed.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f6] px-4 py-5 pb-24">
      <div className="mx-auto max-w-xl">
        <header className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <h1 className="text-[20px] font-extrabold text-[#1a2024]">Track an order</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-[#535766]">
            Enter your order ID and the phone number used at checkout to check its latest status.
          </p>
          <form onSubmit={lookupOrder} className="mt-4 space-y-3">
            <label className="block text-[13px] font-semibold text-[#353543]">
              Order ID
              <input
                required
                maxLength={34}
                value={orderId}
                onChange={(event) => setOrderId(event.target.value.toUpperCase())}
                placeholder="OD..."
                className="mt-1 w-full rounded-lg border border-[#dedee5] px-3 py-2.5 font-normal"
              />
            </label>
            <label className="block text-[13px] font-semibold text-[#353543]">
              Checkout phone number
              <input
                required
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className="mt-1 w-full rounded-lg border border-[#dedee5] px-3 py-2.5 font-normal"
              />
            </label>
            {error && <p role="alert" className="text-[13px] text-red-600">{error}</p>}
            <button type="submit" disabled={searching} className="btn-brand w-full">
              {searching ? "Checking..." : "Check order status"}
            </button>
          </form>
        </header>

        {trackedOrder && (
          <section className="mt-3 rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[14px] font-bold text-[#1a2024]">Order {trackedOrder.id}</h2>
              <span className="rounded-full bg-[#f2f2f5] px-2.5 py-1 text-[12px] font-semibold text-[#535766]">
                {trackedOrder.status}
              </span>
            </div>
            <p className="mt-2 text-[13px] text-[#535766]">
              Payment: {trackedOrder.paymentStatus}
              {trackedOrder.paymentStatus === "Pending"
                ? trackedOrder.paymentMode === "Cash on Delivery"
                  ? " — UPI advance is awaiting manual verification."
                  : " — full UPI payment is awaiting manual verification."
                : ""}
            </p>
            {trackedOrder.trackingNumber && (
              <p className="mt-2 text-[13px] text-[#535766]">Tracking number: {trackedOrder.trackingNumber}</p>
            )}
            {trackedOrder.trackingUrl && (
              <a href={trackedOrder.trackingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold no-underline" style={{ color: "var(--brand)" }}>
                Open courier tracking
              </a>
            )}
            <p className="mt-2 text-[12px] text-[#777]">Order total: {formatPrice(trackedOrder.total)}</p>
          </section>
        )}

        <div className="mt-3 space-y-3">
          {ready && orders.length === 0 && (
            <p className="rounded-2xl bg-white p-5 text-[14px] text-[#535766]">
              No orders are saved on this browser.
            </p>
          )}

          {orders.map((order) => (
            <section key={order.id} className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[14px] font-bold text-[#1a2024]">Order {order.id}</h2>
                  <p className="mt-1 text-[12px] text-[#7e808c]">
                    {new Date(order.placedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span className="rounded-full bg-[#f2f2f5] px-2.5 py-1 text-[12px] font-semibold text-[#535766]">
                  {order.status}
                </span>
              </div>

              <ul className="mt-3 space-y-2 border-t border-[#eee] pt-3">
                {order.items.map((item) => (
                  <li key={`${item.hash}|${item.size ?? ""}`} className="flex justify-between gap-3 text-[13px]">
                    <span className="text-[#535766]">
                      {item.name} × {item.qty}
                    </span>
                    <span className="shrink-0 font-semibold text-[#1a2024]">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-between border-t border-[#eee] pt-3 text-[14px] font-bold text-[#1a2024]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="mt-2 text-[12px] text-[#777]">
                {order.paymentStatus === "Pending"
                  ? order.paymentMode === "Cash on Delivery"
                    ? "UPI advance awaiting manual verification."
                    : "Full UPI payment awaiting manual verification."
                  : "Use the form above to refresh delivery status."}
              </p>
            </section>
          ))}
        </div>

        <Link href="/help" className="mt-4 inline-flex font-semibold no-underline" style={{ color: "var(--brand)" }}>
          Contact support about an order
        </Link>
      </div>
    </div>
  );
}
