import type { Product } from "@/lib/types";
import { brand } from "@/lib/brand";

export default function StoreHeroBanner({ products }: { products: Product[] }) {
  const featuredProducts = products.slice(0, 3);

  return (
    <section aria-label="Discover products" className="px-3 pt-3 pb-2">
      <div className="relative isolate min-h-[218px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#4e123f] via-[#8d176e] to-[#c33b91] px-5 py-5 text-white shadow-[0_12px_28px_rgba(87,11,71,0.2)]">
        <div aria-hidden className="absolute -right-14 -top-20 h-52 w-52 rounded-full border-[26px] border-white/10" />
        <div aria-hidden className="absolute right-[35%] -bottom-24 h-44 w-44 rounded-full bg-[#f7be55]/20 blur-[1px]" />

        <div className="relative z-10 max-w-[58%]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffd166]" />
            Welcome to {brand.name}
          </span>
          <h1 className="mt-3 text-[26px] font-extrabold leading-[1.05] tracking-[-0.04em]">
            Discover your
            <br />
            next favourite.
          </h1>
          <p className="mt-2 max-w-[190px] text-[11px] leading-relaxed text-white/80">
            Explore styles and everyday finds for your home.
          </p>
          <a
            href="#products"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-extrabold text-[#701154] no-underline shadow-sm transition-transform hover:scale-[1.03]"
          >
            Explore products
            <svg aria-hidden width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div aria-hidden className="absolute inset-y-0 right-0 w-[47%]">
          <div className="absolute right-4 top-4 h-[132px] w-[100px] rotate-[7deg] overflow-hidden rounded-[17px] border-[3px] border-white/90 bg-white shadow-[0_12px_22px_rgba(36,0,26,0.28)]">
            {featuredProducts[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredProducts[0].image} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          {featuredProducts[1] && (
            <div className="absolute right-[84px] top-[74px] h-[88px] w-[68px] -rotate-[10deg] overflow-hidden rounded-[14px] border-[3px] border-white/90 bg-white shadow-[0_10px_18px_rgba(36,0,26,0.25)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredProducts[1].image} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          {featuredProducts[2] && (
            <div className="absolute bottom-3 right-2 h-[66px] w-[54px] rotate-[8deg] overflow-hidden rounded-[12px] border-[3px] border-white/90 bg-white shadow-[0_8px_15px_rgba(36,0,26,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredProducts[2].image} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <span className="absolute bottom-5 right-[54px] grid h-8 w-8 place-items-center rounded-full bg-[#ffd166] text-[#65114d] shadow-lg">
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="m12 2 2.5 6.2L21 9l-5 4.2 1.6 6.6-5.6-3.6-5.6 3.6L8 13.2 3 9l6.5-.8L12 2Z" fill="currentColor" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
