"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PAGE_SIZE } from "@/lib/paging";
import { PRODUCT_COLUMNS } from "@/lib/productColumns";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import ProductCardOffer from "./ProductCardOffer";
import { ProductGridSkeleton } from "./StoreSkeleton";

/**
 * The first page is rendered on the server and handed in, so the grid is
 * painted with the HTML — no spinner on first view or when returning from a
 * product page. Pages 2+ are fetched directly from Supabase as the user
 * scrolls — no Vercel API route involved.
 */
export default function ProductFeed({
  initialItems,
  initialTotalPage,
}: {
  initialItems: Product[];
  initialTotalPage: number;
}) {
  const [items, setItems] = useState<Product[]>(initialItems);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(initialTotalPage);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const start = (p - 1) * PAGE_SIZE;
      const { data, count } = await createClient()
        .from("products")
        .select(PRODUCT_COLUMNS, { count: "exact" })
        .order("order_number")
        .range(start, start + PAGE_SIZE - 1);
      setItems((prev) => [...prev, ...((data as Product[]) ?? [])]);
      setTotalPage(Math.max(1, Math.ceil((count ?? PAGE_SIZE) / PAGE_SIZE)));
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPage) {
          fetchPage(page + 1);
        }
      },
      { rootMargin: "500px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [page, totalPage, loading, fetchPage]);

  return (
    <div>
      <div className="product-grid">
        {items.map((p, i) =>
          i < 2 ? (
            // First row is the first thing a user scrolls to — load eagerly.
            <ProductCard key={p.hash} product={p} priority />
          ) : (
            <ProductCardOffer key={p.hash} product={p} />
          )
        )}
      </div>
      <div ref={sentinel} />
      {loading && <ProductGridSkeleton count={4} />}
    </div>
  );
}
