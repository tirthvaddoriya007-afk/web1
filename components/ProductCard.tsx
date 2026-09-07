"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatPrice, seededRandom } from "@/lib/data";
import { useCountdown, fmtCountdown } from "@/lib/countdown";
import TimerIcon from "./TimerIcon";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const t = useCountdown();

  // Stable per-product rating + count (seeded so it never changes on re-render).
  const rnd = seededRandom(product.hash);
  const rating = (rnd() * (5 - 4) + 4).toFixed(1);
  const count = Math.floor(rnd() * 4900) + 100;
  // "Hot Sell" only on tiles with a great price difference (high discount %).
  const discountPct = product.mrp > 0 ? ((product.mrp - product.price) / product.mrp) * 100 : 0;
  const showHot = product.badge === "Hot Sell" || discountPct >= 80;

  // Buy Now on the home feed opens the product page (no direct add-to-cart).
  const buyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${product.hash}`);
  };

  return (
    <div className="pc">
      <Link href={`/product/${product.hash}`} className="pc-link">
        <div className="pc-img">
          {showHot && <span className="hot-badge">Hot Sell</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
        <h3 className="pc-name">{product.name}</h3>
        <div className="pc-price">
          <span className="pc-sell">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="pc-mrp">{formatPrice(product.mrp)}</span>
          )}
          {product.off && <span className="pc-off">{product.off}</span>}
        </div>
      </Link>

      {/* Countdown pill (shared timer) */}
      <div className="pc-timer">
        <TimerIcon size={16} />
        <span>{fmtCountdown(t)}</span>
      </div>

      {/* Buy Now */}
      <button className="pc-buy" onClick={buyNow}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M4 5v14l8-7-8-7z" />
          <path d="M13 5v14l8-7-8-7z" />
        </svg>
        Buy Now
      </button>

      {/* Ratings row */}
      <div className="pc-rating-row">
        <span className="pc-rating">
          {rating}
          <svg width="9" height="9" viewBox="0 0 20 20" fill="#fff" aria-hidden>
            <path d="M10 .3l2.6 6 6.5.5-4.9 4.2 1.5 6.3L10 14l-5.7 3.3 1.5-6.3L.9 6.8l6.5-.5L10 .3z" />
          </svg>
        </span>
        <span className="pc-count">({count})</span>
        <span className="pc-trusted">
          <svg width="13" height="15" viewBox="0 0 17 20" fill="none" aria-hidden>
            <path
              d="M8.5 1L1 3.5v6C1 14.5 4.4 17.5 8.5 19c4.1-1.5 7.5-4.5 7.5-9.5v-6L8.5 1z"
              fill="#60014A"
            />
            <path d="M5.3 9.8l2.3 2.2 4-4.4" stroke="#FF9D00" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Trusted
        </span>
      </div>
    </div>
  );
}
