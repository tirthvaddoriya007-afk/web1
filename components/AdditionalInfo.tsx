"use client";

import { useState } from "react";
import type { AdditionalInfoRow } from "@/lib/types";

/**
 * Additional Details — collapsed by default, opens on tap. Rows are filled by
 * the admin in the product form (fixed keys, only filled ones are stored).
 * Layout mirrors the reference: grey label column, then "•" + dark value.
 */
export default function AdditionalInfo({ rows }: { rows: AdditionalInfoRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-4"
      >
        <h6 className="font-bold text-[17px]">Additional Details</h6>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8b8ba3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start py-1.5">
              <span className="w-[140px] shrink-0 text-[12px] text-[#8b8ba3] leading-snug">
                {r.label}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#353543] leading-snug">
                <span className="text-[#7e808c]">•</span>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
