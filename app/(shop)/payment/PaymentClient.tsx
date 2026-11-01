"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import CheckoutSteps from "@/components/CheckoutSteps";
import type { Order } from "@/lib/types";

const COD_MODE = "Cash on Delivery";
const UPI_MODE = "UPI";

export default function PaymentClient({ upiReady }: { upiReady: boolean }) {
  const { items, total, payable, address, saveOrder, ready } = useStore();
  const router = useRouter();
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paymentLink, setPaymentLink] = useState("");
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>(COD_MODE);
  const [allowMetaMeasurement, setAllowMetaMeasurement] = useState(false);
  const [paymentAcknowledged, setPaymentAcknowledged] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [error, setError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const isCod = selectedMode === COD_MODE;
  const paymentAmount = isCod ? Math.round(Math.min(100, payable) * 100) / 100 : payable;
  const balanceDue = Math.round((payable - paymentAmount) * 100) / 100;

  useEffect(() => {
    if (ready && !pendingOrder && (items.length === 0 || !address)) router.replace("/cart");
  }, [ready, pendingOrder, items.length, address, router]);

  useEffect(() => {
    if (!pendingOrder) return;
    const timer = window.setTimeout(() => setCanContinue(true), 1800);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") setCanContinue(true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pendingOrder]);

 const openPaymentApp = (link: string) => {
  if (!link) return;

  try {
    const url = new URL(link);

    if (
      !["upi:", "phonepe:", "tez:", "paytmmp:"].includes(url.protocol)
    ) {
      throw new Error("Invalid payment link");
    }

    window.location.href = link;
  } catch (error) {
    console.error("Unable to open payment app:", error);
    setError("Unable to open UPI app. Please try again.");
  }
};

  const createOrderAndPay = async () => {
    if (!paymentAcknowledged) {
      setError("Please confirm that you understand the payment terms before continuing.");
      return;
    }

    if (!upiReady) {
      setError("UPI payments are not configured. Please contact support before placing an order.");
      return;
    }

    setProcessing(true);
    setError("");
    setPaymentNotice("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ hash, qty, size }) => ({ hash, qty, size })),
          address,
          paymentMode: isCod ? COD_MODE : selectedMode,
          metaMeasurementConsent: allowMetaMeasurement,
          isIOS:
            /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
        }),
      });
      const result = await response.json().catch(() => null) as
        | { order?: Order; paymentLink?: string; error?: string }
        | null;
      if (!response.ok || !result?.order || !result.paymentLink) {
        throw new Error(result?.error || "Order could not be saved.");
      }

      setPendingOrder(result.order);
      setPaymentLink(result.paymentLink);
      saveOrder(result.order);
      setPaymentPopupOpen(true);
    } catch (cause) {
      console.error("Could not create order:", cause);
      setError(cause instanceof Error ? cause.message : "Order could not be saved. Please try again.");
      setProcessing(false);
    }
  };

  const continueToStatus = () => {
    if (pendingOrder) router.replace(`/summary?order=${encodeURIComponent(pendingOrder.id)}`);
  };

  return (
    <div className="pb-24 bg-[#f4f4f6] min-h-screen">
      <div className="bg-white">
        <CheckoutSteps active={3} />
      </div>

      {pendingOrder ? (
        <section className="bg-white mt-2 px-4 py-6">
          <h1 className="text-[19px] font-extrabold text-[#1a2024]">Payment verification pending</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#535766]">
            Order {pendingOrder.id} is saved, but is not confirmed yet. Complete the
            {pendingOrder.paymentMode === COD_MODE ? " advance" : " payment"} in your UPI app.
            We will confirm the order after manually verifying the transfer.
          </p>
          {paymentNotice && (
            <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-[13px] text-amber-900">
              {paymentNotice}
            </p>
          )}
          <div className="mt-4 rounded-xl bg-[#f7f7f9] p-4 text-[14px]">
            <div className="flex justify-between gap-3">
              <span>{pendingOrder.paymentMode === COD_MODE ? "UPI advance" : "UPI payment"}</span>
              <strong>{formatPrice(pendingOrder.advanceAmount)}</strong>
            </div>
            {pendingOrder.paymentMode === COD_MODE && (
              <div className="mt-2 flex justify-between gap-3">
                <span>Balance due on delivery</span>
                <strong>{formatPrice(pendingOrder.balanceDue)}</strong>
              </div>
            )}
            <p className="mt-3 border-t border-[#e5e5eb] pt-3 text-[12px] text-[#535766]">
              Your payment app will show the recipient and amount before you approve the transfer.
              Payments are manually verified; returning here does not confirm payment.
            </p>
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-lg border border-[#dedee5] px-4 py-3 text-sm font-bold text-[#353543]"
            onClick={() => openPaymentApp(paymentLink)}
          >
            Reopen UPI app
          </button>
          {canContinue && (
            <button type="button" className="btn-brand mt-3 w-full" onClick={continueToStatus}>
              View order status
            </button>
          )}
          <p className="mt-3 text-[12px] leading-relaxed text-[#777]">
            Do not pay again if you already completed the transfer. The order remains pending until we verify it.
          </p>
        </section>
      ) : (
        <>
          <section className="bg-white mt-2 px-4 py-5">
            <h1 className="text-[18px] font-extrabold text-[#1a2024]">Choose how to pay</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[#535766]">
              Pay the full order total with PhonePe, or choose Cash on Delivery with a UPI advance of up to ₹100.
              Transfers are manually verified before an order is confirmed.
            </p>
          </section>

          <section className="mt-2 bg-white px-4 py-4">
            <h2 className="mb-3 font-bold text-[15px] text-[#353543]">Payment method</h2>
            <div className="space-y-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${isCod ? "border-[#9f2089] bg-[#fff9fe]" : "border-[#e5e5eb]"}`}>
                <input
                  type="radio"
                  name="payment-method"
                  checked={isCod}
                  onChange={() => setSelectedMode(COD_MODE)}
                  className="h-4 w-4 accent-[#9f2089]"
                />
                <span className="flex-1">
                  <strong className="block text-[14px] text-[#353543]">Cash on Delivery</strong>
                  <span className="text-[12px] text-[#777]">Pay an advance of up to ₹100; the remaining balance is due on delivery</span>
                </span>
              </label>

              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${!isCod ? "border-[#9f2089] bg-[#fff9fe]" : "border-[#e5e5eb]"}`}>
                <input
                  type="radio"
                  name="payment-method"
                  checked={!isCod}
                  onChange={() => setSelectedMode(UPI_MODE)}
                  className="h-4 w-4 accent-[#9f2089]"
                />
                <span className="flex-1">
                  <strong className="block text-[14px] text-[#353543]">Pay via UPI</strong>
                  <span className="text-[12px] text-[#777]">Opens PhonePe Native Collect to pay the full order total</span>
                </span>
              </label>
            </div>

          </section>

          <section className="bg-white mt-2 px-4 py-4">
            <h2 className="font-bold text-[15px] text-[#353543]">Price details</h2>
            <div className="mt-3 flex justify-between py-1.5 text-[14px]">
              <span>Products</span><span className="font-semibold">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-[14px]">
              <span>Standard shipping</span><span className="font-semibold">FREE</span>
            </div>
            <div className="mt-2 border-t pt-3">
              <div className="flex justify-between py-1 text-[14px]">
                <span>Order total</span><span className="font-bold">{formatPrice(payable)}</span>
              </div>
              <div className="flex justify-between py-1 text-[14px]">
                <span>{isCod ? "Pay now by UPI" : "Pay in UPI app"}</span>
                <span className="font-bold">{formatPrice(paymentAmount)}</span>
              </div>
              {isCod && (
                <div className="flex justify-between py-1 text-[14px]">
                  <span>Balance due on delivery</span><span className="font-bold">{formatPrice(balanceDue)}</span>
                </div>
              )}
            </div>
            {isCod && (
              <p className="mt-4 border-t pt-3 text-[12px] text-[#777]">
                Pay the advance using PhonePe Native Collect.
              </p>
            )}
          </section>

          <section className="mt-2 bg-white px-4 py-4">
            <label className="flex items-start gap-3 text-[12px] leading-relaxed text-[#535766]">
              <input
                type="checkbox"
                checked={allowMetaMeasurement}
                onChange={(event) => setAllowMetaMeasurement(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#9f2089]"
              />
              <span>
                Optional: I agree that my hashed phone number and order/browser identifiers may be shared
                with Meta to measure advertising purchases. See our{" "}
                <Link href="/policy/privacy" className="font-semibold underline" style={{ color: "var(--brand)" }}>
                  privacy policy
                </Link>.
              </span>
            </label>
          </section>

          <section className="mt-2 bg-white px-4 py-4">
            <label className="flex items-start gap-3 text-[12px] leading-relaxed text-[#535766]">
              <input
                type="checkbox"
                required
                checked={paymentAcknowledged}
                onChange={(event) => setPaymentAcknowledged(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#9f2089]"
              />
              <span>
                <strong className="text-[#353543]">Required:</strong>{" "}
                I understand that UPI payments, including the COD advance, are manually verified and
                my order will be confirmed only after the payment is verified.
              </span>
            </label>
          </section>

          {!upiReady && (
            <p role="alert" className="mx-4 mt-3 rounded-lg bg-amber-50 p-3 text-[13px] text-amber-900">
              UPI payments are not configured yet, so checkout is unavailable. Please contact support.
            </p>
          )}
          {error && <p role="alert" className="mx-4 mt-3 text-[13px] text-red-600">{error}</p>}

          <div className="action-bar items-center">
            <div className="flex-1">
              <div className="text-[17px] font-bold leading-5 text-[#353543]">{formatPrice(payable)}</div>
              <span className="text-[12px] text-[#777]">Order total</span>
            </div>
            <button
              type="button"
              className="btn-brand"
              onClick={createOrderAndPay}
              disabled={processing || !upiReady || !address || items.length === 0 || !paymentAcknowledged}
            >
              {processing
                ? "Preparing order..."
                : isCod
                  ? `Pay ${formatPrice(paymentAmount)} `
                  : `Pay ${formatPrice(paymentAmount)}`}
            </button>
          </div>
        </>
      )}

      {pendingOrder && paymentPopupOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPaymentPopupOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-popup-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="payment-popup-title" className="text-lg font-extrabold text-[#1a2024]">
                  Order saved
                </h2>
                <p className="mt-1 text-[13px] text-[#535766]">
                  Complete payment in PhonePe. We will verify it manually.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close payment popup"
                onClick={() => setPaymentPopupOpen(false)}
                className="rounded-full px-3 py-1 text-xl leading-none text-[#777] hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-[#f7f7f9] p-3">
              <p className="font-bold text-[#353543]">Pay via UPI</p>
              <p className="break-all text-xs text-[#777]">Order ID: {pendingOrder.id}</p>
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-[#e5e5eb] p-3 text-[13px]">
              <p className="font-semibold text-[#353543]">Order details</p>
              <ul className="space-y-1 text-[#535766]">
                {pendingOrder.items.map((item, index) => (
                  <li key={`${pendingOrder.id}-${index}`} className="flex justify-between gap-3">
                    <span className="min-w-0">{item.name} × {item.qty}{item.size ? ` · ${item.size}` : ""}</span>
                    <span className="shrink-0">{formatPrice(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-[#e5e5eb] pt-2 font-bold text-[#1a2024]">
                <span>{pendingOrder.paymentMode === COD_MODE ? "Pay COD advance" : "Pay now"}</span>
                <span>{formatPrice(pendingOrder.advanceAmount)}</span>
              </div>
              {pendingOrder.paymentMode === COD_MODE && (
                <div className="flex justify-between text-[#535766]">
                  <span>Balance due on delivery</span>
                  <span>{formatPrice(pendingOrder.balanceDue)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-brand mt-4 w-full"
              onClick={() => openPaymentApp(paymentLink)}
            >
              Open PhonePe and pay {formatPrice(pendingOrder.advanceAmount)}
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-[#777]">
              Check the recipient and amount in your UPI app before approving. Order confirmation is
              pending manual payment verification.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
