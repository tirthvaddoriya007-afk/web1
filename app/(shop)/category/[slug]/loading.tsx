import { SBlock, ProductGridSkeleton } from "@/components/StoreSkeleton";

/**
 * Category page skeleton: title + product count → 2-column product grid.
 */
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-white">
      <div className="space-y-2 px-4 pt-4 pb-1">
        <SBlock className="h-5 w-44" />
        <SBlock className="h-3 w-24" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
