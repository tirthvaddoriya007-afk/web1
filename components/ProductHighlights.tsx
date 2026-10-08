"use client";

/**
 * Product Highlights — 2-column grid (Fabric / Color / Pattern / Fit-Shape)
 * with a COPY action, matching the reference layout.
 */
export default function ProductHighlights({ rows }: { rows: [string, string][] }) {
  const copy = async () => {
    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard unavailable — nothing to do
    }
  };

  return (
    <div className="bg-white mt-2 px-4 py-4">
      <div className="flex items-center justify-between">
        <h6 className="font-bold text-[17px]">Product Highlights</h6>
        <button
          type="button"
          onClick={copy}
          className="text-[12px] font-bold tracking-wide"
          style={{ color: "var(--brand)" }}
        >
          COPY
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-3">
        {rows.map(([k, v]) => (
          <div key={k}>
            <p className="text-[12px] text-[#8b8ba3]">{k}</p>
            <p className="text-[13px] font-semibold text-[#353543] mt-1">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
