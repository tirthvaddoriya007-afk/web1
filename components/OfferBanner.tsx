const OFFERS = [
  { qty: 2, discountPct: 10, best: false },
  { qty: 3, discountPct: 20, best: false },
  { qty: 4, discountPct: 30, best: true },
] as const;

/**
 * Read-only combo-offer banner — shows the cart ladder (Buy Any 2 · 10% OFF,
 * Buy Any 3 · 20% OFF, Buy Any 4 · 30% OFF). The discount is applied
 * automatically in the cart based on the total number of items, so these
 * chips are informational only.
 */
export default function OfferBanner() {
  return (
    <div className="bg-white mt-2 px-4 py-4">
      <div className="flex items-center justify-between">
        <h6 className="font-bold text-[17px]">Offers</h6>
        <span className="rounded-full bg-[#eafaf3] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#038d63]">
          AUTO-APPLIED
        </span>
      </div>

      
      <div className="grid grid-cols-3 gap-2 mt-3.5">
        {OFFERS.map((o) => (
          <div
            key={o.qty}
            className="relative flex min-h-[74px] flex-col items-center justify-center gap-2 rounded-xl border-2 px-1 py-3"
            style={
              o.best
                ? { borderColor: "#9f2089", background: "#fff0fc", boxShadow: "0 4px 14px rgba(159,32,137,0.16)" }
                : { borderColor: "#e6e6ec", background: "#fff" }
            }
          >
            {o.best && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f7941d] px-1.5 py-px text-[8px] font-bold text-white">
                BEST VALUE
              </span>
            )}
            <span className="text-[13px] font-bold" style={{ color: o.best ? "#9f2089" : "#353543" }}>
              Buy Any {o.qty}
            </span>
            <span className="rounded-full bg-[#038d63] px-2 py-0.5 text-[11px] font-bold text-white">
              {o.discountPct}% OFF
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#7e808c]">
        <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="8" fill="#038d63" />
          <circle cx="8" cy="4.6" r="1" fill="#fff" />
          <rect x="7.2" y="6.6" width="1.6" height="5" rx="0.8" fill="#fff" />
        </svg>
        Add 2, 3 or 4+ items to your cart — the offer applies automatically, no code needed
      </p>
    </div>
  );
}
