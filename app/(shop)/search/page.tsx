import { searchProducts } from "@/lib/catalog";
import ProductCardOffer from "@/components/ProductCardOffer";
import SearchInput from "./SearchInput";

// Live results from Supabase through the 10s SWR cache — new products are
// searchable the moment an admin adds them (instant invalidation).
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const results = await searchProducts(q, 80);

  return (
    <div className="min-h-screen bg-white">
      <SearchInput initial={q} />

      {q === "" ? (
        <div className="text-center text-[#9b9b9b] py-20 px-6 text-[14px]">
          Search across 397+ products
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 px-6">
          <p className="text-[16px] font-semibold text-[#1a2024]">No results for “{q}”</p>
          <p className="text-[13px] text-[#9b9b9b] mt-1">Try a different keyword.</p>
        </div>
      ) : (
        <>
          <p className="px-4 py-2.5 text-[12px] text-[#7e808c]">
            {results.length} result{results.length > 1 ? "s" : ""}
          </p>
          <div className="product-grid">
            {results.map((p) => (
              <ProductCardOffer key={p.hash} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
