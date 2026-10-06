"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/brand";
import { formatPrice, seededRandom } from "@/lib/data";
import type { Product } from "@/lib/types";
import { trackWelcomeClick } from "@/lib/welcomeclick";
import PreloadImages from "@/components/PreloadImages";
import MetaPixel from "@/components/MetaPixel";

/**
 * Welcome landing — chromeless, exactly one call to action: get to /home.
 * Every tap anywhere on the page navigates there (and counts as a welcome
 * tap in admin analytics); if the visitor never taps, the auto-redirect
 * timer (settings.welcome_redirect_seconds, 0 = off) does it for them.
 */
export default function WelcomeClient({
  product,
  redirectSeconds,
  preload,
}: {
  product: Product | null;
  redirectSeconds: number;
  preload: string[];
}) {
  const router = useRouter();
  const navigating = useRef(false);

  // fromTap guards analytics: the auto-redirect timer is NOT a user tap.
  const goHome = useCallback(
    (fromTap: boolean) => {
      if (navigating.current) return;
      navigating.current = true;
      if (fromTap) trackWelcomeClick();
      router.replace("/home");
    },
    [router]
  );

  useEffect(() => {
    if (redirectSeconds <= 0) return;
    const t = window.setTimeout(() => goHome(false), redirectSeconds * 1000);
    return () => window.clearTimeout(t);
  }, [redirectSeconds, goHome]);

  // Stable per-product rating + count (seeded, mirrors ProductCard).
  const rnd = seededRandom(product?.hash ?? "welcome");
  const rating = (rnd() * (5 - 4) + 4).toFixed(1);
  const count = Math.floor(rnd() * 4900) + 100;

  return (
    <main
      onClick={() => goHome(true)}
      className="min-h-screen cursor-pointer bg-[#e9e9ee]"
    >
      <PreloadImages srcs={preload} />
      <div className="mx-auto flex min-h-screen w-full max-w-[400px] flex-col bg-white px-4 py-6 shadow-[0_0_24px_rgba(0,0,0,0.08)]">
        <h1 className="text-center text-[32px] font-extrabold leading-none text-[#333]">
          WELCOME
        </h1>

        {product && (
          <div className="mt-5 rounded-[20px] border border-[#f0f0f0] p-4 shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
            <div className="rounded-[15px] bg-[#f8f8f8] p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="mx-auto w-full max-w-[250px]"
                fetchPriority="high"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold leading-snug text-[#333]">
              {product.name}
            </h2>

            <div className="mt-2.5 flex items-center">
              <span className="rounded bg-[#388e3c] px-2 py-0.5 text-xs font-semibold text-white">
                {rating} ★
              </span>
              <span className="ml-2 text-sm text-[#777]">({count} Ratings)</span>
            </div>

            <div className="mt-3 flex items-center">
              <span className="text-[28px] font-bold leading-none text-[#333]">
                {formatPrice(product.price)}
              </span>
              <span className="ml-2.5 text-base text-[#888] line-through">
                {formatPrice(product.mrp)}
              </span>
              <span className="ml-2.5 text-base font-bold text-[#388e3c]">
                {product.off}
              </span>
            </div>

            <p className="mt-1.5 text-sm font-semibold text-[#03a685]">
              Free Delivery
            </p>
          </div>
        )}

        <button
          type="button"
          className="mt-5 block w-full rounded-[10px] bg-[#ff6400] px-4 py-4 text-center text-lg font-bold text-white"
        >
          🛒 Continue to Shopping
        </button>

        <p className="mt-4 text-center text-xs font-semibold text-[#9b9b9b]">
          7 Days Easy Return &nbsp;•&nbsp; Cash on Delivery &nbsp;•&nbsp; Lowest Prices
        </p>
        <p className="mt-2 pb-6 text-center text-xs text-[#9b9b9b]">
          © {new Date().getFullYear()} {brand.name}
        </p>
      </div>

      {/* Ads land here first, so fire the PageView on arrival. */}
      <MetaPixel pageView />
    </main>
  );
}
