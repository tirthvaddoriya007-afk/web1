import { SBlock, ProductGridSkeleton } from "@/components/StoreSkeleton";

/**
 * Product-page skeleton matching the product page and its actual offer block.
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
