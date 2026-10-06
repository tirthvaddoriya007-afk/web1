import { SBlock, CategoryGridSkeleton, SearchBarSkeleton } from "@/components/StoreSkeleton";

/**
 * "Shop by Category" skeleton: search bar → heading → 3-column tile grid.
 */
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-white">
      <SearchBarSkeleton />
      <div className="px-4 pt-4 pb-2">
        <SBlock className="h-5 w-44" />
      </div>
      <CategoryGridSkeleton count={12} />
    </div>
  );
}
