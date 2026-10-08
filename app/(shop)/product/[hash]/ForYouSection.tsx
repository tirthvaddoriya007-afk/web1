import { getForYouProducts } from "@/lib/catalog";
import ProductCardOffer from "@/components/ProductCardOffer";

/**
 * Products For You — streamed in after the page shell (Suspense), so the
 * hero/price/buy bar never wait on this query.
 */
export default async function ForYouSection({
  category,
  excludeHash,
}: {
  category: string;
  excludeHash: string;
}) {
  const forYou = await getForYouProducts(category, excludeHash, 8);

  return (
    <div className="mt-2 bg-white pt-4">
      <h6 className="font-bold text-[19px] px-4 mb-1">Products For You</h6>
      <div className="product-grid">
        {forYou.map((p) => (
          <ProductCardOffer key={p.hash} product={p} />
        ))}
      </div>
    </div>
  );
}
