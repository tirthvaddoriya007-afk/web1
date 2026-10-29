"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_COLUMNS } from "@/lib/productColumns";
import type { Product } from "@/lib/types";
import ProductCardOffer from "@/components/ProductCardOffer";
import { ProductGridSkeleton } from "@/components/StoreSkeleton";

const LIMIT = 80;

/**
 * The whole search UX lives in the browser: the query goes straight to
 * Supabase from the client (anon read), so Vercel never runs a function for
 * a search — the /search route itself is a static CDN shell. The URL is kept
 * shareable/bookmarkable with history.replaceState, which never triggers a
 * server round trip.
 */
export default function SearchClient() {
  const [q, setQ] = useState("");
  // null = nothing searched yet; otherwise the current results.
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  const runSearch = (value: string) => {
    const s = value.trim();
    const id = ++reqId.current;
    if (!s) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    createClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .ilike("name", `%${s}%`)
      .order("order_number")
      .limit(LIMIT)
      .then(
        ({ data }) => {
          if (reqId.current === id) {
            setResults((data as Product[]) ?? []);
            setLoading(false);
          }
        },
        () => {
          if (reqId.current === id) {
            setResults([]);
            setLoading(false);
          }
        }
      );
  };

  const syncUrl = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    const qs = params.toString();
    window.history.replaceState(null, "", `/search${qs ? `?${qs}` : ""}`);
  };

  const onChange = (value: string) => {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      runSearch(value);
      syncUrl(value);
    }, 250);
  };

  // Pick up ?q= from the URL on first mount (shared/bookmarked links).
  useEffect(() => {
    const initial = (new URLSearchParams(window.location.search).get("q") ?? "").trim();
    if (initial) {
      setQ(initial);
      runSearch(initial);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="sticky top-[52px] z-30 bg-white px-3 py-2.5 border-b">
        <div className="flex items-center gap-2 bg-[#f2f2f5] rounded-lg px-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search for Groceries, Fashion, Electronics…"
            className="flex-1 bg-transparent py-2.5 text-[14px] outline-none"
          />
          {q && (
            <button
              onClick={() => onChange("")}
              aria-label="Clear"
              className="text-[#9b9b9b] text-lg leading-none"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {q.trim() === "" ? (
        <div className="text-center text-[#9b9b9b] py-20 px-6 text-[14px]">
          Search across 397+ products
        </div>
      ) : loading ? (
        <div className="px-3 pt-3">
          <ProductGridSkeleton />
        </div>
      ) : results && results.length === 0 ? (
        <div className="text-center py-20 px-6">
          <p className="text-[16px] font-semibold text-[#1a2024]">No results for “{q}”</p>
          <p className="text-[13px] text-[#9b9b9b] mt-1">Try a different keyword.</p>
        </div>
      ) : results && results.length > 0 ? (
        <>
          <p className="px-4 py-2.5 text-[12px] text-[#7e808c]">
            {results.length} result{results.length > 1 ? "s" : ""}
          </p>
          <div className="product-grid">
            {results.map((p) => (
              <ProductCardOffer key={p.hash} product={p} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
