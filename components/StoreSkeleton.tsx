/**
 * Shared shimmer building blocks for the per-route loading.tsx files. Each
 * skeleton mirrors the real section's layout (product cards, category tiles,
 * search bar) so a page that is still loading looks like the page that is
 * about to appear — not a generic loading screen.
 */

export function SBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-[#e8e8ec] ${className}`} />;
}

/** Product card shape: square image, name line, price row, button strip. */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white p-2">
      <SBlock className="aspect-square w-full" />
      <SBlock className="mt-2 h-2.5 w-11/12" />
      <div className="mt-1.5 flex items-center gap-1.5">
        <SBlock className="h-3 w-1/3" />
        <SBlock className="h-2.5 w-1/5" />
      </div>
      <SBlock className="mt-2 h-5 w-3/5" />
    </div>
  );
}

/** 2-column product grid — same 1px white seams as the real .product-grid. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-white p-px">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** 3-column tile grid used by the "Shop by Category" page. */
export function CategoryGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-2 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 rounded-lg border border-[#f0f0f0] p-2"
        >
          <SBlock className="aspect-square w-full" />
          <SBlock className="h-2.5 w-3/5" />
        </div>
      ))}
    </div>
  );
}

/** Rounded grey search bar, as shown on category and search pages. */
export function SearchBarSkeleton() {
  return (
    <div className="border-b bg-white px-3 py-2.5">
      <SBlock className="h-10 w-full rounded-lg" />
    </div>
  );
}
