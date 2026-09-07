"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import CheckoutSteps from "@/components/CheckoutSteps";

export default function CartPage() {
  const { items, total, payable, setQty, removeItem, ready } = useStore();

  if (ready && items.length === 0) {
    return (
      <div>
        <CheckoutSteps active={1} />
        <div className="text-center py-24 px-6">
          <p className="text-xl font-semibold text-[#1a2024] mb-2">Your cart is feeling lonely</p>
          <Link href="/" className="btn-brand inline-block mt-4 no-underline max-w-[200px]">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-[#f4f4f6] min-h-screen">
      <div className="bg-white">
        <CheckoutSteps active={1} />
      </div>

      {/* Items — one white card per item, separated by the grey page ground */}
      {items.map((i) => (
        <div key={i.hash} className="bg-white mt-2 flex gap-3 px-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={i.image} alt="" className="w-[112px] h-[112px] object-cover rounded bg-[#f7f7f9] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2">
              <p className="text-[14px] text-[#333] truncate">{i.name}</p>
              <button onClick={() => removeItem(i.hash)} aria-label="Remove" className="shrink-0 text-[#8b8b93]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[15px] font-bold text-[#1a2024]">₹{Math.round(i.price)}</span>
              <span className="text-[13px] text-[#9b9b9b] line-through">₹{Math.round(i.mrp)}</span>
            </div>
            <div className="flex items-center justify-between mt-5">
              <span className="text-[13px] text-[#535766]">Qty : {String(i.qty).padStart(2, "0")}</span>
              <div className="inline-flex items-center bg-[#f5f5f7] rounded-md text-[14px] p-[2px]">
                <button className="px-2.5 text-[#535766] leading-6" onClick={() => setQty(i.hash, i.qty - 1)}>
                  -
                </button>
                <span className="px-2 min-w-[30px] text-center bg-white rounded border border-[#e6e6ec] leading-6">
                  {String(i.qty).padStart(2, "0")}
                </span>
                <button className="px-2.5 text-[#535766] leading-6" onClick={() => setQty(i.hash, i.qty + 1)}>
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Price block */}
      <div className="bg-white mt-2 px-4 py-4">
        <div className="flex justify-between text-[14px] py-1.5">
          <span className="text-[#333]">Shipping:</span>
          <span className="font-semibold text-[#1ba672]">FREE</span>
        </div>
        {/* dashed rule sits directly on this row (source: border-bottom on the
            Total Product Price div), so it reads as an underline through it */}
        <div className="flex justify-between text-[14px] py-1.5 border-b border-dashed border-[#333]">
          <span className="text-[#333]">Total Product Price:</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-[15px] font-bold pt-4">
          <span>Order Total :</span>
          <span>{formatPrice(payable)}</span>
        </div>
      </div>

      {/* Safety card */}
      <SafetyCard />

      {/* Bottom bar */}
      <div className="action-bar items-center">
        <div className="flex-1">
          <div className="text-[16px] font-bold text-[#1a2024]">{formatPrice(payable)}</div>
          <button className="text-[11px] font-semibold" style={{ color: "var(--brand)" }}>
            VIEW PRICE DETAILS
          </button>
        </div>
        {/* Continue — 179.2 × 44, 15px "Mier demi", #FFFFFF on #9F2089, padding
            12px. Metrics come from the shared .action-bar CTA rule. */}
        <Link href="/address" className="btn-brand no-underline">
          Continue
        </Link>
      </div>
    </div>
  );
}

// The whole safety card is a single supplied asset in /public/banners.
function SafetyCard() {
  return (
    <div className="bg-white mt-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/banners/1588578650850.webp"
        alt="Your Safety, Our Priority — we make sure that your package is safe at every point of contact."
        className="w-full block"
      />
    </div>
  );
}
