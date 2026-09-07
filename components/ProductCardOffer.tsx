import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, seededRandom, specialOffer } from "@/lib/data";

/**
 * Catalog card in the "offer pill + Free Delivery" style used on category
 * pages and the product page's "Products For You" grid (no timer / Buy Now).
 */
export default function ProductCardOffer({ product }: { product: Product }) {
  const rnd = seededRandom(product.hash);
  const rating = (rnd() * (5 - 4) + 4).toFixed(1);
  const count = Math.floor(rnd() * 4900) + 100;
  const offer = specialOffer(product.hash, product.price);

  return (
    <Link href={`/product/${product.hash}`} className="pc">
      <div className="pc-img">
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

      <div className="pc-offer">
        <span className="pc-offer-ico">₹</span>
        ₹{offer.amount} with {offer.count} Special Offers
      </div>

      <p className="pc-free">Free Delivery</p>

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
            <path d="M8.5 1L1 3.5v6C1 14.5 4.4 17.5 8.5 19c4.1-1.5 7.5-4.5 7.5-9.5v-6L8.5 1z" fill="#60014A" />
            <path d="M5.3 9.8l2.3 2.2 4-4.4" stroke="#FF9D00" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Trusted
        </span>
      </div>
    </Link>
  );
}
