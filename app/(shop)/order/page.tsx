"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";

const STEPS = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export default function OrderTrackingPage() {
  const { orders } = useStore();
  const [q, setQ] = useState("");
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState("");

  const check = () => {
    if (!q.trim()) {
      setErr("Please enter your mobile number or email.");
      setChecked(false);
      return;
    }
    setErr("");
    setChecked(true);
  };

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

      {/* Lookup card */}
      <div className="px-4 -mt-9">
        <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.10)] p-4">
          <label className="block text-[14px] font-bold text-[#1a2024] mb-2">Mobile Number or Email</label>
          <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-lg px-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. 9876543210 or name@email.com"
              className="flex-1 bg-transparent py-3 text-[14px] outline-none"
            />
          </div>
          {err && <p className="text-red-600 text-[12px] mt-2">{err}</p>}
          <button onClick={check} className="btn-brand mt-3 flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
            Check Status
          </button>
        </div>
      </div>

      <p className="text-center text-[13px] text-[#7e808c] mt-5">
        Need help with your order?{" "}
        <Link href="/help" className="font-bold no-underline" style={{ color: "var(--brand)" }}>
          Contact Support
        </Link>
      </p>

      {/* Results */}
      {checked && (
        <div className="px-4 mt-6 pb-10">
          {orders.length === 0 ? (
            <div className="text-center text-[#7e808c] py-10">
              No orders found for this contact.
            </div>
          ) : (
            <>
              <h3 className="font-bold text-[15px] mb-3">Your Orders</h3>
              {orders.map((o) => (
                <div key={o.id} className="border rounded-xl mb-3 overflow-hidden">
                  <div className="flex justify-between items-center px-3 py-2 bg-[#faf5f9] text-[13px]">
                    <span className="font-semibold">#{o.id}</span>
                    <span className="text-[#03A685] text-[12px] font-semibold">{o.status}</span>
                  </div>
                  {o.items.map((i) => (
                    <div key={`${i.hash}|${i.size ?? ""}`} className="flex gap-3 p-3 border-b">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.image} alt="" className="w-12 h-12 object-contain rounded bg-[#f7f7f9]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] line-clamp-2">{i.name}</p>
                        <p className="text-[12px] text-[#7e808c] mt-0.5">
                          Qty {i.qty}
                          {i.size ? ` · Size ${i.size}` : ""} · {formatPrice(i.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="px-3 py-3">
                    <div className="flex items-center justify-between text-[10px] text-[#7e808c]">
                      {STEPS.map((s, idx) => (
                        <div key={s} className="flex-1 flex flex-col items-center">
                          <span className="w-3 h-3 rounded-full" style={{ background: idx === 0 ? "var(--brand)" : "#ddd" }} />
                          <span className="mt-1 text-center leading-tight">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[13px] mt-3 pt-2 border-t">
                      <span>Total ({o.paymentMode})</span>
                      <span className="font-semibold">{formatPrice(o.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
