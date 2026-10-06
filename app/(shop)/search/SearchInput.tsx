"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Debounced search box: typing updates the URL query after a short pause, and
 * the server page re-renders with fresh results from Supabase. Local state
 * keeps the typing instant (no input lag) — the UX is the same as the old
 * client-side filter, but results are now live catalogue data.
 */
export default function SearchInput({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setQ(initial), [initial]);

  const push = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      const qs = params.toString();
      router.replace(`/search${qs ? `?${qs}` : ""}`);
    }, 250);
  };

  return (
    <div className="sticky top-[52px] z-30 bg-white px-3 py-2.5 border-b">
      <div className="flex items-center gap-2 bg-[#f2f2f5] rounded-lg px-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
        </svg>
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            push(e.target.value);
          }}
          placeholder="Search for Groceries, Fashion, Electronics…"
          className="flex-1 bg-transparent py-2.5 text-[14px] outline-none"
        />
        {q && (
          <button
            onClick={() => {
              setQ("");
              push("");
            }}
            aria-label="Clear"
            className="text-[#9b9b9b] text-lg leading-none"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
