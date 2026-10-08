import { SBlock, ProductGridSkeleton } from "@/components/StoreSkeleton";

/**
 * Product-page skeleton: image slider → title/price → details table →
 * ratings & reviews → trust strip → "Products For You" grid, with the fixed
 * bottom action bar. Mirrors the real page's section order and shapes.
 */
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f4f4f6] pb-24">
      {/* Image slider + dot */}
      <div className="bg-white px-4 pt-4">
        <SBlock className="aspect-square w-full rounded-lg" />
        <div className="flex justify-center py-3">
          <SBlock className="h-1 w-6 rounded-full" />
        </div>
      </div>

      {/* Title + price block */}
      <div className="space-y-3 bg-white px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <SBlock className="h-4 flex-1" />
          <div className="flex gap-4">
            <SBlock className="h-4 w-4" />
            <SBlock className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SBlock className="h-6 w-24" />
          <SBlock className="h-3 w-12" />
          <SBlock className="h-3 w-10" />
        </div>
        <SBlock className="h-6 w-44 rounded-full" />
        <div className="flex items-center gap-2">
          <SBlock className="h-5 w-14" />
          <SBlock className="h-3 w-40" />
        </div>
        <SBlock className="h-3 w-20" />
      </div>

      {/* Select Size + Sold by */}
      <div className="mt-2 bg-white px-4 py-4">
        <SBlock className="h-4 w-24" />
        <div className="mt-3 flex gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SBlock key={i} className="h-9 w-14 rounded-lg" />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <SBlock className="h-3 w-16" />
            <SBlock className="h-4 w-40" />
            <SBlock className="h-3 w-56" />
          </div>
          <SBlock className="h-9 w-24" />
        </div>
      </div>

      {/* Product highlights */}
      <div className="mt-2 bg-white px-4 py-4">
        <SBlock className="h-4 w-40" />
        <div className="mt-3 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SBlock className="h-2.5 w-14" />
              <SBlock className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Ratings & reviews */}
      <div className="mt-2 bg-white px-4 py-4">
        <SBlock className="h-4 w-48" />
        <div className="mt-3 flex gap-4">
          <div className="w-[62px] shrink-0 space-y-2">
            <SBlock className="h-8 w-14" />
            <SBlock className="h-2.5 w-full" />
            <SBlock className="h-2.5 w-4/5" />
          </div>
          <div className="flex-1 space-y-2 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SBlock key={i} className="h-1.5 w-full" />
            ))}
          </div>
        </div>
        {/* two review cards */}
        {[0, 1].map((i) => (
          <div key={i} className={`mt-4 border-t border-[#eaeaef] pt-3`}>
            <div className="flex items-center gap-2">
              <SBlock className="h-7 w-7 rounded-full" />
              <SBlock className="h-3 w-24" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <SBlock className="h-5 w-10" />
              <SBlock className="h-3 w-36" />
            </div>
            <SBlock className="mt-2 h-3 w-11/12" />
            <SBlock className="mt-1.5 h-3 w-4/5" />
          </div>
        ))}
      </div>

      {/* Blue trust strip */}
      <div className="mt-2 flex items-center justify-between bg-[#eaf1ff] px-2 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <SBlock className="h-6 w-6 rounded-full" />
            <SBlock className="h-3 w-14" />
          </div>
        ))}
      </div>

      {/* Products For You */}
      <div className="mt-2 bg-white pt-4">
        <SBlock className="mx-4 h-4 w-40" />
        <div className="mt-2">
          <ProductGridSkeleton count={4} />
        </div>
      </div>

      {/* Fixed bottom action bar (Add to Cart / Buy Now) */}
      <div className="action-bar">
        <SBlock className="h-11 flex-1" />
        <SBlock className="h-11 flex-1" />
      </div>
    </div>
  );
}
