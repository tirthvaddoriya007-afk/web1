import { Suspense } from "react";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/data";
import { getProductByHash, getAllProducts } from "@/lib/catalog";
import ProductPurchase from "@/components/ProductPurchase";
import ProductImageSlider from "@/components/ProductImageSlider";
import ProductHighlights from "@/components/ProductHighlights";
import AdditionalInfo from "@/components/AdditionalInfo";
import StoreInfoBanners from "@/components/StoreInfoBanners";
import ForYouSection from "./ForYouSection";


// ISR: rendered once, served from the CDN for 1 hour. Admin edits (price,
// images, position) are visible instantly via /api/revalidate while shoppers
// never wait on the database. The shell below only depends on the single
// product query; "Products For You" streams in afterwards, so the hero,
// price and buy bar appear as fast as possible.
export const revalidate = 3600;

// Every product page is pre-rendered at build time, so bots crawling the
// catalogue hit static CDN files instead of server functions. Falls back to
// on-demand ISR for products added after the last build.
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map((p) => ({ hash: p.hash }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { hash: string } }) {
  const p = await getProductByHash(params.hash);
  return { title: p ? p.name : "Product" };
}

export default async function ProductPage({ params }: { params: { hash: string } }) {
  const product = await getProductByHash(params.hash);
  if (!product) notFound();

  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);

  // Admin-entered sections — hidden until the product has data for them.
  const highlightRows: [string, string][] = (
    [
      ["Fabric", product.fabric ?? ""],
      ["Color", product.color ?? ""],
      ["Pattern", product.pattern ?? ""],
      ["Fit/Shape", product.fit_shape ?? ""],
    ] as [string, string][]
  ).filter(([, v]) => Boolean(v.trim()));
  const infoRows = (product.additional_info ?? []).filter((r) => Boolean(r.label?.trim()));

  return (
    <div className="pb-16 bg-[#f4f4f6]">
      {/* Image slider (up to 10 images, swipeable + thumbnail strip) */}
      <div className="bg-white px-4 pt-4">
        <ProductImageSlider images={images} name={product.name} />
      </div>

      {/* Title + price block */}
      <div className="bg-white px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          {/* .product-title — 15px demi, #8B8BA3, ~21px line-height */}
          <h1 className="product-title flex-1">{product.name}</h1>
          <div className="flex gap-4 shrink-0 pt-0.5">
            <Action label="Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.6">
                <path d="M12 20.8 3.6 12.4a5.1 5.1 0 0 1 7.2-7.2l1.2 1.2 1.2-1.2a5.1 5.1 0 0 1 7.2 7.2z" />
              </svg>
            </Action>
            <Action label="Share">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.6">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" />
              </svg>
            </Action>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          {/* span.price — 25px bold, #353543 */}
          <span className="text-[25px] font-extrabold text-[#353543] leading-none">
            {formatPrice(product.price)}
          </span>
        </div>

      </div>

      <StoreInfoBanners />

      {/* Select Size + sticky buy bar (client) */}
      <ProductPurchase product={product} />

      {/* Product Highlights — admin-entered at upload time */}
      {highlightRows.length > 0 && <ProductHighlights rows={highlightRows} />}

      {/* Additional Details — admin-entered, collapsed by default */}
      {infoRows.length > 0 && <AdditionalInfo rows={infoRows} />}

      {/* Products For You — streamed after the shell */}
      <Suspense fallback={<ForYouSkeleton />}>
        <ForYouSection category={product.category} excludeHash={product.hash} />
      </Suspense>
    </div>
  );
}

/* ---------------------------- skeletons ------------------------------------ */
function ForYouSkeleton() {
  return (
    <div className="mt-2 bg-white pt-4 pb-4 animate-pulse">
      <div className="h-6 w-40 rounded bg-[#eaeaef] mx-4" />
      <div className="grid grid-cols-2 gap-3 px-4 mt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded bg-[#eaeaef]" />
        ))}
      </div>
    </div>
  );
}

function Action({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 text-[11px] text-[#666]">
      {children}
      <span>{label}</span>
    </div>
  );
}
