"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/data";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const router = useRouter();

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "low"}
            decoding="async"
          />
        </div>
        <h3 className="pc-name">{product.name}</h3>
        <div className="pc-price">
          <span className="pc-sell">{formatPrice(product.price)}</span>
        </div>
      </Link>

      {/* Buy Now */}
      <button className="pc-buy" onClick={buyNow}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M4 5v14l8-7-8-7z" />
          <path d="M13 5v14l8-7-8-7z" />
        </svg>
        Buy Now
      </button>

    </div>
  );
}
