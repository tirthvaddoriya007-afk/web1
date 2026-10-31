"use client";

import Link from "next/link";
import { Suspense } from "react";
import CheckoutSteps from "@/components/CheckoutSteps";

function SummaryInner() {
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
          Thank you. Your order has been received.
        </p>
      </div>

      {/* Actions */}
      <div className="action-bar">
        <Link href="/home" className="btn-brand no-underline text-center">
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
