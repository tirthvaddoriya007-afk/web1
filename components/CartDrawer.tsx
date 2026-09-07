"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";

export default function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, total, promoDiscount, freeCount, payable, setQty, removeItem } = useStore();

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-[20px] text-[#1a2024]">Your Cart</h3>
            <span className="block mt-1 h-[3px] w-9 rounded-full bg-[#f7941d]" />
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[22px] leading-none text-[#333] mt-0.5">
            &times;
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto border-t">
          {items.length === 0 ? (
            <div className="text-center py-24 text-[#1a2024] font-semibold">
              Your cart is feeling lonely
            </div>
          ) : (
            items.map((i) => (
              <div key={i.hash} className="flex gap-3 px-4 py-4 border-b">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt="" className="w-16 h-16 object-cover rounded bg-[#f7f7f9] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <p className="text-[14px] text-[#333] truncate">{i.name}</p>
                    <button onClick={() => removeItem(i.hash)} aria-label="Remove" className="shrink-0 text-[#8b8b93]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[15px] font-bold text-[#1a2024]">₹{Math.round(i.price)}</span>
                    <span className="text-[13px] text-[#9b9b9b] line-through">₹{Math.round(i.mrp)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[13px] text-[#535766]">Qty : {String(i.qty).padStart(2, "0")}</span>
                    <div className="inline-flex items-center bg-[#f5f5f7] rounded-md text-[14px]">
                      <button className="px-2.5 py-1 text-[#535766]" onClick={() => setQty(i.hash, i.qty - 1)}>-</button>
                      <span className="px-2 min-w-[26px] text-center">{String(i.qty).padStart(2, "0")}</span>
                      <button className="px-2.5 py-1 text-[#535766]" onClick={() => setQty(i.hash, i.qty + 1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 pt-3 pb-4">
          {freeCount > 0 && (
            <div className="text-[12px] font-semibold text-[#1ba672] mb-1">
              🎉 Buy 2 Get 1 Free — {freeCount} free
            </div>
          )}
          <div className="flex justify-between text-[14px] py-1">
            <span className="text-[#333]">Cart Total:</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-[14px] py-1 text-[#1ba672]">
              <span>Offer discount:</span>
              <span className="font-semibold">- {formatPrice(promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[14px] py-1 pb-2 border-b border-dashed border-[#bbb]">
            <span className="text-[#333]">Shipping:</span>
            <span className="font-semibold">FREE</span>
          </div>
          <div className="flex justify-between text-[14px] py-2">
            <span className="text-[#333]">To Pay:</span>
            <span className="font-semibold">{formatPrice(payable)}</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="shrink-0">
              <div className="text-[20px] font-extrabold text-[#1a2024]">{formatPrice(payable)}</div>
              <div className="text-[11px] text-[#9b9b9b]">Inclusive of all taxes</div>
            </div>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex-1 btn-brand text-center no-underline"
              style={{ opacity: items.length ? 1 : 0.5, pointerEvents: items.length ? "auto" : "none" }}
            >
              Confirm Order
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
