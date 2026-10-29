import { SBlock, ProductGridSkeleton } from "@/components/StoreSkeleton";

/**
 * Search-page skeleton: sticky search input → result count → product grid.
 */
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-white">
      <div className="sticky top-[52px] z-30 border-b bg-white px-3 py-2.5">
        <SBlock className="h-10 w-full rounded-lg" />
      </div>
      <div className="px-4 py-2.5">
        <SBlock className="h-3 w-24" />
      </div>
      <ProductGridSkeleton count={6} />
    </div>
  );
}
