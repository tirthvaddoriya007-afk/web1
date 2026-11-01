// Pure, client-safe helpers + shared constants. No Supabase, no JSON imports —
// these are bundled into client components (cards, cart) as well as the server.
// Product/review/home-content data access now lives in lib/catalog.ts (async,
// Supabase-backed, never cached) so admin edits appear instantly everywhere.
import { PAGE_SIZE } from "./paging";

export { PAGE_SIZE };

export function formatPrice(n: number): string {
  return "₹" + n.toFixed(2);
}
