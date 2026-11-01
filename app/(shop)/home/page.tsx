import DealsBar from "@/components/DealsBar";
import ProductFeed from "@/components/ProductFeed";
import StoreHeroBanner from "@/components/StoreHeroBanner";
import { getProductPage } from "@/lib/catalog";

// ISR: rendered once, served from the CDN for 1 hour. Admin saves purge the
// cache instantly via /api/revalidate, so visitors never wait on the database.
export const revalidate = 3600;

export default async function HomePage() {
  // First page comes from Supabase at render time, so the grid is in the HTML
  // and the feed never shows a spinner on arrival.
  const first = await getProductPage(1);

  return (
    <>
      <StoreHeroBanner products={first.products} />

      <div id="products" className="scroll-mt-20">
        <DealsBar />
        <ProductFeed initialItems={first.products} initialTotalPage={first.total_page} />
      </div>
    </>
  );
}
