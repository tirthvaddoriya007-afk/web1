import Marquee from "@/components/Marquee";
import DealsBar from "@/components/DealsBar";
import ProductFeed from "@/components/ProductFeed";
import Banner from "@/components/Banner";
import { getProductPage, getHomeContent } from "@/lib/catalog";

// ISR: rendered once, served from the CDN for 1 hour. Admin saves purge the
// cache instantly via /api/revalidate, so visitors never wait on the database.
export const revalidate = 3600;

export default async function HomePage() {
  // First page comes from Supabase at render time, so the grid is in the HTML
  // and the feed never shows a spinner on arrival.
  const [first, content] = await Promise.all([getProductPage(1), getHomeContent()]);

  return (
    <>
      {/* 1. Top promo strip (above carousel) */}
      <div className="mb-1.5">
        <Banner
          src={content.banner1_url}
          href={content.banner1_link}
          alt={content.banner1_alt}
          priority
          width={1200}
          height={120}
        />
      </div>

      {/* 2. Main hero / carousel banner */}
      <Banner
        src={content.banner2_url}
        href={content.banner2_link}
        alt={content.banner2_alt}
        priority
        width={800}
        height={333}
      />

      {/* 3. Purple promo marquee */}
      <Marquee text={content.promo_text} />

      {/* 4. Below-marquee banner (trust badges strip) */}
      <Banner src="/banners/below-marquee.png" alt="Easy returns, Cash on delivery, Lowest price" width={720} height={112} />

      {/* 5. Daily Deals header + countdown */}
      <DealsBar />

      {/* Product feed */}
      <ProductFeed initialItems={first.products} initialTotalPage={first.total_page} />
    </>
  );
}
