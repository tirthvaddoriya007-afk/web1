"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import CheckoutSteps from "@/components/CheckoutSteps";

function SummaryInner() {
  const { orders, ready } = useStore();
  const router = useRouter();
  const orderId = useSearchParams().get("order");
  const order = orders.find((o) => o.id === orderId) || orders[0];

  useEffect(() => {
    if (ready && !order) router.replace("/");
  }, [ready, order, router]);

  if (!order) return null;

  return (
    <div className="pb-24 bg-[#f4f4f6] min-h-screen">
      <div className="bg-white">
        <CheckoutSteps active={4} />
      </div>

      {/* Success banner */}
      <div className="bg-white mt-2 px-4 py-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full grid place-items-center" style={{ background: "#e7f7ef" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1ba672" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" opacity=".25" />
            <path d="M7 12.5l3.5 3.5L17 9" />
          </svg>
        </div>
        <h1 className="text-[20px] font-extrabold mt-3 text-[#1a2024]">Order Confirmed!</h1>
        <p className="text-[13px] text-[#7e808c] mt-1">
          Thank you for your purchase. Your order is being processed.
        </p>
        <div className="inline-flex items-center gap-2 mt-4 bg-[#faf5f9] border border-[#ecd9e7] rounded-lg px-3 py-2">
          <span className="text-[12px] text-[#7e808c]">Order No.</span>
          <span className="text-[14px] font-bold tracking-wide" style={{ color: "var(--brand-dark)" }}>
            {order.id}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="font-bold text-[15px] mb-3">Order Details</h3>
        {order.items.map((i) => (
          <div key={i.hash} className="flex gap-3 py-2.5 border-b last:border-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i.image} alt="" className="w-14 h-14 object-cover rounded bg-[#f7f7f9]" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#333] line-clamp-2">{i.name}</p>
              <p className="text-[12px] text-[#7e808c] mt-1">
                Qty {i.qty} · <span className="font-semibold text-[#1a2024]">{formatPrice(i.price)}</span>
              </p>
            </div>
          </div>
        ))}
        <div className="flex justify-between font-bold text-[15px] pt-3 mt-1 border-t">
          <span>Order Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Delivery + payment */}
      <div className="bg-white mt-2 px-4 py-4 text-[13px]">
        <h3 className="font-bold text-[15px] mb-2">Delivery Address</h3>
        <p className="text-[#333] font-semibold">{order.address.name} · {order.address.number}</p>
        <p className="text-[#7e808c] mt-0.5 leading-snug">
          {order.address.flat}, {order.address.area}, {order.address.city}
          {order.address.state ? `, ${order.address.state}` : ""} - {order.address.pin}
        </p>
        <div className="flex justify-between mt-3 pt-3 border-t">
          <span className="text-[#7e808c]">Payment Method</span>
          <span className="font-semibold text-[#333]">{order.paymentMode}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="action-bar">
        <Link href="/order" className="btn-outline no-underline text-center">
          Track Order
        </Link>
        <Link href="/" className="btn-brand no-underline text-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading…</div>}>
      <SummaryInner />
    </Suspense>
  );
}
