import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import type { Product, Category } from "./types";

export const products = productsData as Product[];
export const categories = categoriesData as Category[];

export function getProduct(hash: string): Product | undefined {
  return products.find((p) => p.hash === hash);
}

// Feed paging. Shared by the API route and the server-rendered first page, so
// the two can never disagree about page size.
export const PAGE_SIZE = 30;

export function getProductPage(page: number): { products: Product[]; page: number; total_page: number } {
  const p = Math.max(1, page);
  const start = (p - 1) * PAGE_SIZE;
  return {
    products: products.slice(start, start + PAGE_SIZE),
    page: p,
    total_page: Math.ceil(products.length / PAGE_SIZE),
  };
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug || c.origSlug === slug);
}

export function getProductsByCategory(name: string): Product[] {
  return products.filter((p) => p.categories.includes(name));
}

// Deterministic pseudo-random from a string seed (stable across renders/SSR).
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function formatPrice(n: number): string {
  return "₹" + n.toFixed(2);
}

// Seeded "₹X with N Special Offers" line (cosmetic, stable per product).
export function specialOffer(hash: string, price: number): { amount: number; count: number } {
  const r = seededRandom("offer:" + hash);
  const count = 1 + Math.floor(r() * 3); // 1..3
  const amount = Math.round(price * (1.2 + r() * 0.7));
  return { amount, count };
}
