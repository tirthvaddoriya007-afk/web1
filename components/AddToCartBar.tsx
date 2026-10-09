"use client";

import { useRouter } from "next/navigation";
import type { CartOffer, Product } from "@/lib/types";
import { useStore } from "@/lib/store";

export default function AddToCartBar({
  product,
  size,
  offer,
}: {
  product: Product;
  size: string;
  offer: CartOffer | null;
}) {
  const { addItem, openCart } = useStore();
  const router = useRouter();

  // Combo chips add their whole pack at once (Buy 2 → 2 units at 20% off).
  const qty = offer ? offer.qty : 1;

  const add = () => {
    addItem(product, qty, size, offer);
    openCart();
  };

  const buyNow = () => {
    addItem(product, qty, size, offer);
    router.push("/cart");
  };

  return (
    <div className="action-bar">
      <button className="btn-outline flex items-center justify-center gap-2" onClick={add}>
        {/* filled cart glyph (reference uses a solid basket, not an outline) */}
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6.6 6.4h14.1c.5 0 .9.5.8 1l-.8 6.8c-.06.58-.5 1.02-1.02 1.04l-11.2.46-1.88-9.3z" fill="#9f2089" />
          <path
            d="M2.7 4.6l2.8 1.3 2.35 11.2c.12.57.57.96 1.1.96h8.9"
            stroke="#9f2089"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="11.2" cy="20.1" r="1.25" fill="#9f2089" />
          <circle cx="16.1" cy="20.1" r="1.25" fill="#9f2089" />
        </svg>
        Add to Cart
      </button>
      <button className="btn-brand flex items-center justify-center gap-2" onClick={buyNow}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M4 5v14l8-7-8-7z" />
          <path d="M13 5v14l8-7-8-7z" />
        </svg>
        Buy Now
      </button>
    </div>
  );
}
