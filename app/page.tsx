import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { brand } from "@/lib/brand";
import { getFeaturedProducts, getHomeContent } from "@/lib/catalog";
import WelcomeClient from "@/components/WelcomeClient";

export const metadata: Metadata = {
  title: `Welcome - ${brand.name}`,
  description: `${brand.name} — mega sale is live. Continue to shopping and grab today's deals.`,
};

// Live product data (the catalogue row for this card comes from Supabase,
// served through the 10s SWR cache with instant admin invalidation).
export const dynamic = "force-dynamic";

// Welcome landing (the reference's index.php equivalent). Lives outside the
// (shop) group on purpose: this page is chromeless — no header, no bottom
// nav, no cart drawer — exactly one call to action: get to /home. WelcomeClient
// handles the interactions: tap anywhere to go home, and an admin-tunable
// auto-redirect timer for visitors who never tap.
export default async function WelcomePage() {
  const content = await getHomeContent();

  // Admin switched the welcome landing OFF — skip it entirely and send
  // visitors straight to the home page.
  if (!content.welcome_enabled) redirect("/home");

  const featured = await getFeaturedProducts(2);
  const product = featured[0];
  const second = featured[1];

  // While the visitor reads this card we preload the home page's
  // above-the-fold images (banners + first two product images).
  const preload = [
    content.banner1_url,
    content.banner2_url,
    product?.image,
    second?.image,
  ].filter(Boolean) as string[];

  return (
    <WelcomeClient
      product={product ?? null}
      redirectSeconds={content.welcome_redirect_seconds}
      preload={preload}
    />
  );
}
