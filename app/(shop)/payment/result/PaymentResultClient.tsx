"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PaymentState = "checking" | "pending" | "verified" | "cancelled-paid" | "error";

export default function PaymentResultClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") ?? "";
  const [state, setState] = useState<PaymentState>("checking");
  const [error, setError] = useState("");

  const verifyStatus = useCallback(async () => {
    if (!/^OD[A-F0-9]{32}$/.test(orderId)) {
      setState("error");
      setError("The order reference is invalid.");
      return "error";
    }

    try {
      const response = await fetch("/api/paytm/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
        cache: "no-store",
      });
      const result = await response.json() as { state?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Payment status could not be checked.");

      if (result.state === "cancelled-paid") {
        setState("cancelled-paid");
        setError("");
        return "cancelled-paid";
      }
      if (result.state === "verified") {
        setState("verified");
        setError("");
        return "verified";
      }

      setState("pending");
      setError("");
      return "pending";
    } catch (cause) {
      setState("error");
      setError(cause instanceof Error ? cause.message : "Payment status could not be checked.");
      return "error";
    }
  }, [orderId]);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let attempts = 0;

    const check = async () => {
      const nextState = await verifyStatus();
      attempts += 1;
      if (active && nextState === "pending" && attempts < 5) {
        timer = window.setTimeout(check, 2500);
      }
    };

    void check();
    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [verifyStatus]);

  const title = state === "verified"
    ? "Payment confirmed"
    : state === "cancelled-paid"
      ? "Payment received for cancelled order"
    : state === "error"
      ? "Could not check payment"
      : state === "pending"
        ? "Payment is not confirmed yet"
        : "Checking your payment";

  return (
    <main className="mx-auto min-h-[60vh] max-w-xl px-4 py-12">
      <section className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-extrabold text-[#1a2024]">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#535766]">
          Order ID: <strong>{orderId || "Unavailable"}</strong>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#535766]">
          {state === "verified"
            ? "Paytm has confirmed the payment and your order is confirmed."
            : state === "cancelled-paid"
              ? "Paytm confirmed the payment, but this order is cancelled. Please contact support to arrange a refund."
            : state === "pending"
              ? "Paytm has not confirmed a successful payment. Do not pay again if you already completed it; you can check again shortly."
              : state === "error"
                ? error
                : "We are checking the payment directly with Paytm. Please wait."}
        </p>
        {(state === "pending" || state === "error") && (
          <button
            type="button"
            onClick={() => void verifyStatus()}
            className="btn-brand mt-5 w-full"
          >
            Check payment status again
          </button>
        )}
        <Link href="/" className="mt-4 inline-block text-sm font-semibold underline" style={{ color: "var(--brand)" }}>
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
