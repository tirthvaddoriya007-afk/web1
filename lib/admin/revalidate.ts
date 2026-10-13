"use client";

// Optional PHP storefront purge target. When the storefront is served by the
// PHP site (homeshop-php) on another host, set these two vars in the admin's
// environment (Vercel) and every admin save will ALSO clear the PHP file
// cache, so shoppers see edits instantly on both sites. Unset → PHP purge is
// simply skipped (storefront-only Next behaviour, unchanged).
const PHP_PURGE_URL = process.env.NEXT_PUBLIC_PHP_PURGE_URL;
const PHP_PURGE_TOKEN = process.env.NEXT_PUBLIC_PHP_PURGE_TOKEN;

/**
 * Purges the storefront caches after a successful admin mutation, so the
 * change is visible on the storefront instantly. Fire-and-forget — the next
 * shopper request revalidates lazily, so a failed purge is harmless.
 */
export function invalidateAll() {
  fetch("/api/revalidate", { method: "POST" }).catch(() => {});

  if (PHP_PURGE_URL && PHP_PURGE_TOKEN) {
    const url =
      PHP_PURGE_URL +
      (PHP_PURGE_URL.includes("?") ? "&" : "?") +
      "token=" +
      encodeURIComponent(PHP_PURGE_TOKEN);
    fetch(url, { method: "POST" }).catch(() => {});
  }
}
