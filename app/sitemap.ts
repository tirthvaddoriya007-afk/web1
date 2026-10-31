import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/catalog";

// Generated at build time (zero runtime cost): the main routes, every
// category and every product. Crawlers get a complete map so they stop
// guessing URLs and hammering the feed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://big-deal.online";
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/home`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/category`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/policy/return-refund`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/policy/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/policy/storepolicy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const cats = await getCategories();
    for (const c of cats) {
      entries.push({
        url: `${base}/category/${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Supabase unreachable at build — categories are omitted, not fatal.
  }

  try {
    const products = await getAllProducts();
    for (const p of products) {
      entries.push({
        url: `${base}/product/${p.hash}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Supabase unreachable at build — products are omitted, not fatal.
  }

  return entries;
}
