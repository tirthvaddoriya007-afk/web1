"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/lib/data";
import ProductCardOffer from "@/components/ProductCardOffer";

function SearchInner() {
  const initial = useSearchParams().get("q") || "";
  const [q, setQ] = useState(initial);

  useEffect(() => setQ(initial), [initial]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s))
      .slice(0, 80);
  }, [q]);

  return (
    <div className="min-h-screen bg-white">
      {/* Search input */}
      <div className="sticky top-[52px] z-30 bg-white px-3 py-2.5 border-b">
        <div className="flex items-center gap-2 bg-[#f2f2f5] rounded-lg px-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for Groceries, Fashion, Electronics…"
            className="flex-1 bg-transparent py-2.5 text-[14px] outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="text-[#9b9b9b] text-lg leading-none">&times;</button>
          )}
        </div>
      </div>

      {q.trim() === "" ? (
        <div className="text-center text-[#9b9b9b] py-20 px-6 text-[14px]">
          Search across {products.length}+ products
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 px-6">
          <p className="text-[16px] font-semibold text-[#1a2024]">No results for “{q}”</p>
          <p className="text-[13px] text-[#9b9b9b] mt-1">Try a different keyword.</p>
        </div>
      ) : (
        <>
          <p className="px-4 py-2.5 text-[12px] text-[#7e808c]">{results.length} result{results.length > 1 ? "s" : ""}</p>
          <div className="product-grid">
            {results.map((p) => (
              <ProductCardOffer key={p.hash} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
