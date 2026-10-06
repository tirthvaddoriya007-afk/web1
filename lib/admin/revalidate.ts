"use client";

/**
 * Purges the storefront SWR caches after a successful admin mutation, so the
 * change is visible on the storefront instantly. Fire-and-forget — the next
 * shopper request revalidates lazily, so a failed purge is harmless.
 */
export function invalidateAll() {
  fetch("/api/revalidate", { method: "POST" }).catch(() => {});
}
