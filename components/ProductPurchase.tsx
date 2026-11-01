"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/types";
import { trackMetaEvent } from "@/lib/meta-pixel";
import AddToCartBar from "./AddToCartBar";


/**
 * The offer banner shows the discounts that are applied in the cart.
 */
export default function ProductPurchase({ product }: { product: Product }) {
  const viewedProduct = useRef<string | null>(null);
  useEffect(() => {
    if (viewedProduct.current !== product.hash) {
      viewedProduct.current = product.hash;
      trackMetaEvent("ViewContent", {
        content_ids: [product.hash],
        content_type: "product",
        value: product.price,
        currency: "INR",
      });
    }
  }, [product.hash, product.price]);
  return (
    <AddToCartBar product={product} />
  );
}
