import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProduct,
  products,
  getProductsByCategory,
  formatPrice,
  specialOffer,
  seededRandom,
} from "@/lib/data";
import { buildRatings } from "@/lib/reviews";
import AddToCartBar from "@/components/AddToCartBar";
import ProductCardOffer from "@/components/ProductCardOffer";

export function generateStaticParams() {
  return products.map((p) => ({ hash: p.hash }));
}

export function generateMetadata({ params }: { params: { hash: string } }) {
  const p = getProduct(params.hash);
  return { title: p ? p.name : "Product" };
}

function specRows(name: string) {
  return [
    ["Brand", "In-house"],
    ["Quantity", name],
    ["Type", name],
    ["Variant", "Raw"],
    ["Container Type", name],
    ["Model Name", name],
    ["Combo", /combo/i.test(name) ? "Yes" : "No"],
    ["Maximum Shelf Life", "12 Months"],
    ["Added Preservatives", "No"],
    ["Gift Pack", "No"],
    ["Manufactured By", "In-house"],
    ["Nutrient Content", "NA"],
    ["Net Quantity", name],
  ];
}

export default function ProductPage({ params }: { params: { hash: string } }) {
  const product = getProduct(params.hash);
  if (!product) notFound();

  const ratings = buildRatings(product.hash, product.image);
  const offer = specialOffer(product.hash, product.price);

  const inCat = getProductsByCategory(product.category).filter((p) => p.hash !== product.hash);
  const similar = inCat.slice(0, 5);
  const forYou = [...inCat.slice(5), ...products.filter((p) => p.category !== product.category)]
    .filter((p) => p.hash !== product.hash)
    .slice(0, 8);

  // Small independent rating pair for the top row (separate from reviews block).
  const tr = seededRandom("top:" + product.hash);
  const topRatings = 100 + Math.floor(tr() * 900);
  const topReviews = 10 + Math.floor(tr() * 50);
  const topStar = Math.floor(Number(ratings.average));

  return (
    <div className="pb-16 bg-[#f4f4f6]">
      {/* Image + carousel dot */}
      <div className="bg-white px-4 pt-4">
        <div className="w-full aspect-square bg-[#f7f7f9] rounded-lg overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
        </div>
        <div className="flex justify-center py-3">
          <span className="w-6 h-1 rounded-full" style={{ background: "var(--brand)" }} />
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <div className="pb-4">
            <h4 className="text-[15px] font-bold mb-2">{similar.length} Similar Products</h4>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              <ThumbLink href={`/product/${product.hash}`} src={product.image} active />
              {similar.map((s) => (
                <ThumbLink key={s.hash} href={`/product/${s.hash}`} src={s.image} />
              ))}
            </div>
          </div>
        )}
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
          {product.mrp > product.price && (
            <span className="text-[13px] text-[#9b9b9b] line-through">{formatPrice(product.mrp)}</span>
          )}
          {product.off && <span className="text-[13px] text-[#8b8ba3] font-semibold">{product.off}</span>}
        </div>

        {/* Special offers pill */}
        {/* offer pill — 12px demi #038D63 on #EAFAF3, trailing filled info dot */}
        <div className="inline-flex items-center gap-1.5 mt-2.5 bg-[#eafaf3] text-[#038d63] text-[12px] font-semibold rounded-full pl-2 pr-1 py-[3px]">
          {formatPrice(offer.amount)} with {offer.count} Special Offer{offer.count > 1 ? "s" : ""}
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="8" fill="#038d63" />
            <circle cx="8" cy="4.6" r="1" fill="#fff" />
            <rect x="7.2" y="6.6" width="1.6" height="5" rx="0.8" fill="#fff" />
          </svg>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 bg-[#038d63] text-white text-[13px] font-semibold px-2 py-0.5 rounded">
            {topStar}
            <Star />
          </span>
          <span className="text-[12px] text-[#8b8ba3]">
            {topRatings} ratings and {topReviews} reviews
          </span>
          <span className="w-1 h-1 rounded-full bg-[#c9c9d1]" />
          <TrustedBadge />
        </div>

        <p className="text-[13px] font-bold mt-3">Free Delivery</p>
      </div>

      {/* Product Details */}
      <div className="bg-white mt-2 px-4 py-4">
        <h6 className="font-bold text-[17px] mb-3">Product Details</h6>
        {/* spec td — 12px demi, #212529 */}
        <table className="w-full text-[12px]">
          <tbody>
            {specRows(product.name).map(([k, v]) => (
              <tr key={k} className="align-top">
                <td className="py-2.5 pr-3 text-[#8b8ba3] w-[112px] leading-snug">{k}</td>
                <td className="py-2.5 text-[#212529] font-semibold leading-snug">
                  <span className="text-[#7e808c] mr-2">•</span>
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ratings & Reviews */}
      <div className="bg-white mt-2" id="reviews">
        {/* heading block — padding 1px 16px */}
        <div className="px-4 py-px">
          <h6 className="font-bold text-[17px]">Product Ratings &amp; Reviews</h6>
        </div>

        {/* count wrapper — padding 4px 16px */}
        <div className="flex gap-4 px-4 py-1">
          <div className="shrink-0 w-[62px]">
            {/* average — 35px bold greenBase + 12px star, baseline-aligned */}
            <div className="flex items-center gap-1">
              <span className="text-[35px] leading-none font-bold text-[#038d63]">{ratings.average}</span>
              <Star size={12} fill="#038d63" />
            </div>
            <div className="text-[11px] text-[#8b8ba3] mt-2 leading-tight">{ratings.ratingCount} Ratings,</div>
            <div className="text-[11px] text-[#8b8ba3] mt-1.5 leading-tight">{ratings.reviewCount} Reviews</div>
          </div>
          <div className="flex-1 space-y-1.5 pt-1">
            {ratings.buckets.map((b) => (
              <div key={b.label} className="flex items-center text-[12px]">
                {/* .rating_label — 12px demi #212529, right-aligned, margin-right 12px */}
                <span className="w-[61px] mr-3 text-right text-[#212529] font-semibold shrink-0">{b.label}</span>
                <span className="flex-1 h-[6px] rounded-full bg-[#eaeaef] overflow-hidden">
                  <span className="block h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                </span>
                <span className="w-9 ml-3 text-right text-[#212529]">{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* comments — each card padding 10px 16px, separated by a full-width rule */}
        <div className="mt-2">
          {ratings.reviews.map((r, i) => (
            <div key={i} className={`px-4 py-2.5 ${i > 0 ? "border-t border-[#eaeaef]" : ""}`}>
              <div className="flex items-center gap-2">
                <UserAvatar />
                <span className="text-[13px] font-semibold text-[#212529]">{r.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 bg-[#038d63] text-white text-[13px] font-semibold px-2 py-0.5 rounded-[10px]">
                  {r.rating}
                  <Star size={8} />
                </span>
                <span className="text-[13px] text-[#353543]">{r.date}</span>
              </div>
              <p className="text-[13px] mt-2 text-[#353543]">{r.text}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.image} alt="" width={48} height={48} className="w-12 h-12 object-cover rounded mt-2 bg-[#f7f7f9]" />
              <p className="text-[13px] text-[#666] mt-2 flex items-center gap-1.5">
                {/* filled thumbs-up, matching the reference glyph */}
                <svg width="15" height="15" viewBox="0 0 16 16" fill="#666" aria-hidden>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.712 5.245 8.68 1.13a1.039 1.039 0 0 1 1.51-.008c.258.268.366.647.294 1.018l-.68 3.402h4.046c1.54 0 2.578 1.635 1.977 3.106L13.492 14.3c-.229.542-.745.899-1.318.899H5.73c-.788 0-1.432-.669-1.432-1.486V6.293c0-.394.15-.773.415-1.048Zm-1.847 8.471c0 .818-.645 1.486-1.433 1.486-.787 0-1.432-.668-1.432-1.486V7.773c0-.817.645-1.486 1.432-1.486.788 0 1.433.67 1.433 1.486v5.943Z"
                  />
                </svg>
                Helpful ({r.helpful})
              </p>
            </div>
          ))}
        </div>

        <Link href="#reviews" className="block px-4 pb-4 pt-2 text-[13px] font-bold tracking-wide" style={{ color: "var(--brand)" }}>
          VIEW ALL REVIEWS ›
        </Link>
      </div>

      {/* Blue trust strip */}
      <div className="mt-2 flex items-center justify-between px-2 py-4" style={{ background: "#eaf1ff" }}>
        <TrustItem label="Lowest Price" icon={<PriceIco />} />
        <span className="w-px h-8 bg-[#cdd8ef]" />
        <TrustItem label="Cash on Delivery" icon={<CodIco />} />
        <span className="w-px h-8 bg-[#cdd8ef]" />
        <TrustItem label="7-day Returns" icon={<ReturnIco />} />
      </div>

      {/* Products For You */}
      <div className="mt-2 bg-white pt-4">
        <h6 className="font-bold text-[19px] px-4 mb-1">Products For You</h6>
        <div className="product-grid">
          {forYou.map((p) => (
            <ProductCardOffer key={p.hash} product={p} />
          ))}
        </div>
      </div>

      <AddToCartBar product={product} />
    </div>
  );
}

/* ---------------------------- small pieces -------------------------------- */
function Star({ size = 9, fill = "#fff" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={fill} aria-hidden>
      <path d="M10 .3l2.6 6 6.5.5-4.9 4.2 1.5 6.3L10 14l-5.7 3.3 1.5-6.3L.9 6.8l6.5-.5L10 .3z" />
    </svg>
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
function TrustedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#60014a]">
      <svg width="13" height="15" viewBox="0 0 17 20" fill="none" aria-hidden>
        <path d="M8.5 1L1 3.5v6C1 14.5 4.4 17.5 8.5 19c4.1-1.5 7.5-4.5 7.5-9.5v-6L8.5 1z" fill="#60014A" />
        <path d="M5.3 9.8l2.3 2.2 4-4.4" stroke="#FF9D00" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Trusted
    </span>
  );
}
function ThumbLink({ href, src, active }: { href: string; src: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className="shrink-0 w-[70px] h-[70px] rounded-lg p-1.5 bg-white"
      style={{ border: active ? "1.5px solid var(--brand)" : "1px solid #eee" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="w-full h-full object-contain" />
    </Link>
  );
}
function UserAvatar() {
  return (
    <span className="w-7 h-7 rounded-full bg-[#F7F9FF] grid place-items-center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#c7d3f0">
        <circle cx="12" cy="9" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0z" />
      </svg>
    </span>
  );
}
function TrustItem({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5">
      {icon}
      <span className="text-[12px] font-semibold text-[#3f4a63]">{label}</span>
    </div>
  );
}
function PriceIco() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#DDE8FF" />
      <text x="12" y="21" fontSize="13" fontWeight="bold" fill="#038d63">₹</text>
      <path d="M21 12v7m0 0l-2.5-2.5M21 19l2.5-2.5" stroke="#038d63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CodIco() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#DDE8FF" />
      <rect x="8" y="12" width="16" height="9" rx="1.5" fill="#038d63" />
      <circle cx="16" cy="16.5" r="2.4" fill="#fff" />
      <text x="16" y="18.2" fontSize="3.6" fontWeight="bold" textAnchor="middle" fill="#038d63">₹</text>
    </svg>
  );
}
function ReturnIco() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#DDE8FF" />
      <path d="M11 13a6 6 0 1 1-1 3.5" stroke="#F4A93B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M8 9v4h4" stroke="#F4A93B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
