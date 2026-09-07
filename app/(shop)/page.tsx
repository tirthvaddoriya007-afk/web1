import Marquee from "@/components/Marquee";
import DealsBar from "@/components/DealsBar";
import ProductFeed from "@/components/ProductFeed";
import Banner from "@/components/Banner";
import { getProductPage } from "@/lib/data";

export default function HomePage() {
  // First page comes straight from local data at render time, so the grid is
  // in the HTML and the feed never shows a spinner on arrival.
  const first = getProductPage(1);

  return (
    <>
      {/* 1. Top promo strip (above carousel) */}
      <div className="mb-1.5">
        <Banner src="/banners/top.gif" href="/category/grocery" alt="Sale is live" />
      </div>

      {/* 2. Main hero / carousel banner */}
      <Banner src="/banners/hero.webp" href="/category/grocery" alt="Mega Sale" />

      {/* 3. Purple promo marquee */}
      <Marquee />

      {/* 4. Below-marquee banner (trust badges strip) */}
      <Banner src="/banners/below-marquee.webp" alt="Easy returns, Cash on delivery, Lowest price" />

      {/* 5. Daily Deals header + countdown */}
      <DealsBar />

      {/* Product feed */}
      <ProductFeed initialItems={first.products} initialTotalPage={first.total_page} />
    </>
  );
}
