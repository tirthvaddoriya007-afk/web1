"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import ProductCardOffer from "./ProductCardOffer";

/**
 * The first page is rendered on the server and handed in, so the grid is
 * painted with the HTML — no spinner on first view or when returning from a
 * product page. Only pages 2+ are fetched, as the user scrolls.
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
      const res = await fetch(`/api/products?page=${p}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...(data.products as Product[])]);
      setTotalPage(data.total_page);
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
      {loading && (
        <div className="flex justify-center py-8">
          <div
            className="w-9 h-9 rounded-full animate-spin"
            style={{ border: "6px solid #f3f3f3", borderTopColor: "var(--brand)" }}
          />
        </div>
      )}
    </div>
  );
}
