"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Invisible analytics beacon. Mounted once in the storefront layout, it POSTs
 * every navigation to /api/track (path, referrer, UTM params). The server
 * derives browser/webview and device from the User-Agent, so the client only
 * sends what the browser already knows.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef("");

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    if (url === lastSent.current) return; // already recorded this navigation
    lastSent.current = url;

    const body = JSON.stringify({
      path: url,
      referrer: document.referrer,
      utm_source: searchParams.get("utm_source") ?? "",
      utm_medium: searchParams.get("utm_medium") ?? "",
      utm_campaign: searchParams.get("utm_campaign") ?? "",
    });

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true, // survives the tab closing right after navigation
    }).catch(() => {
      /* analytics must never break the page */
    });
  }, [pathname, searchParams]);

  return null;
}
