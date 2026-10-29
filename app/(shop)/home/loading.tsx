import { SBlock, ProductGridSkeleton } from "@/components/StoreSkeleton";

/**
 * Home-page skeleton: banner strip → hero → marquee → trust strip → deals bar
 * → product grid. Same section order and shapes as the real home page.
 */
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-white pb-16">
      {/* 1. top promo strip */}
      <SBlock className="mb-1.5 h-9 w-full rounded-none" />
      {/* 2. hero banner */}
      <SBlock className="h-40 w-full rounded-none" />
      {/* 3. purple marquee bar */}
      <div className="h-9" style={{ background: "rgba(159,32,137,0.35)" }} />
      {/* 4. below-marquee trust strip */}
      <SBlock className="h-12 w-full rounded-none" />
      {/* 5. daily deals header + timer pill */}
      <div className="flex items-center justify-center gap-2 px-2 py-2.5">
        <SBlock className="h-5 w-44" />
        <div className="h-5 w-24 rounded border border-[#f6d3ac] bg-[#ffe8cd]" />
      </div>
      {/* 6. product feed grid */}
      <ProductGridSkeleton count={8} />
    </div>
  );
}
