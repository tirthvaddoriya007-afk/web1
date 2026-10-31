"use client";

import Link from "next/link";

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Purple banner */}
      <div className="text-white text-center px-4 pt-8 pb-16" style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-dark))" }}>
        <div className="flex items-center justify-center gap-2">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
            <circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" />
          </svg>
          <h1 className="text-[22px] font-extrabold">Order Tracking</h1>
        </div>
        <p className="text-[13px] font-semibold opacity-90 mt-1">Track your shipment status in real time</p>
      </div>

      <div className="px-4 -mt-9">
        <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.10)] p-4 text-center">
          <p className="text-[14px] text-[#7e808c]">
            Order details are kept private. For help, please contact support.
          </p>
        </div>
      </div>

      <p className="text-center text-[13px] text-[#7e808c] mt-5">
        Need help with your order?{" "}
        <Link href="/help" className="font-bold no-underline" style={{ color: "var(--brand)" }}>
          Contact Support
        </Link>
      </p>

    </div>
  );
}
