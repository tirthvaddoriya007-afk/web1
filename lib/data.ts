// Pure, client-safe helpers + shared constants. No Supabase, no JSON imports —
// these are bundled into client components (cards, cart) as well as the server.
// Product/review/home-content data access now lives in lib/catalog.ts (async,
// Supabase-backed, never cached) so admin edits appear instantly everywhere.
import { PAGE_SIZE } from "./paging";

export { PAGE_SIZE };

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
