"use client";

import { formatPrice } from "@/lib/data";
import type { CartOffer } from "@/lib/types";

const OFFERS = [
  { id: "single", qty: 0, discountPct: 0, best: false },
  { id: "buy2", qty: 2, discountPct: 20, best: false },
  { id: "buy3", qty: 3, discountPct: 30, best: true },
] as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Quantity offer chips — Buy 1 (regular) / Buy 2 · 20% OFF / Buy 3 · 30% OFF.
 * The selected combo is stored on the cart line, so the discount travels with
 * the item into the cart, checkout and the final order. `null` = regular buy.
 */
export default function OfferSelector({
  price,
  value,
  onChange,
}: {
  price: number;
  value: CartOffer | null;
  onChange: (offer: CartOffer | null) => void;
}) {
  const unitPrice = (pct: number) => round2(price * (1 - pct / 100));
  const savings = (qty: number, pct: number) => round2((price - unitPrice(pct)) * qty);

  return (
    <div className="bg-white mt-2 px-4 py-4">
      <div className="flex items-center justify-between">
        <h6 className="font-bold text-[17px]">Offers</h6>
        <span className="text-[11px] font-bold tracking-wide text-[#038d63]">COMBO SAVINGS</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3.5">
        {OFFERS.map((o) => {
          const active = o.qty === 0 ? value === null : value?.qty === o.qty;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.qty === 0 ? null : { qty: o.qty, discountPct: o.discountPct })}
              className="relative flex min-h-[86px] flex-col items-center justify-center gap-[3px] rounded-xl border-2 px-1 py-2.5 transition-all duration-150"
              style={
                active
                  ? { borderColor: "#9f2089", background: "#fff0fc", boxShadow: "0 4px 14px rgba(159,32,137,0.16)" }
                  : { borderColor: "#e6e6ec", background: "#fff" }
              }
            >
              {o.best && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f7941d] px-1.5 py-px text-[8px] font-bold text-white">
                  BEST VALUE
                </span>
              )}
              <span className="text-[13px] font-bold" style={{ color: active ? "#9f2089" : "#353543" }}>
                {o.qty === 0 ? "Buy 1" : `Buy ${o.qty}`}
              </span>
              {o.qty === 0 ? (
                <>
                  <span className="rounded-full bg-[#f5f5f7] px-2 py-px text-[10px] font-semibold text-[#535766]">
                    1 PC
                  </span>
                  <span className="text-[11px] font-bold text-[#7e808c]">{formatPrice(price)}</span>
                </>
              ) : (
                <>
                  <span className="rounded-full bg-[#038d63] px-2 py-px text-[10px] font-bold text-white">
                    {o.discountPct}% OFF
                  </span>
                  <span className="text-[11px] font-bold text-[#038d63]">
                    {formatPrice(unitPrice(o.discountPct))}/pc
                  </span>
                  <span className="text-[10px] font-semibold text-[#038d63]">
                    Save {formatPrice(savings(o.qty, o.discountPct))}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#7e808c]">
        <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="8" fill="#038d63" />
          <circle cx="8" cy="4.6" r="1" fill="#fff" />
          <rect x="7.2" y="6.6" width="1.6" height="5" rx="0.8" fill="#fff" />
        </svg>
        Selected offer is applied automatically in your cart
      </p>
    </div>
  );
}
