"use client";

import { useEffect, useState } from "react";

/**
 * Loads Meta's pixel with the ID configured in the admin panel (Supabase
 * `settings.meta_pixel_id`), fetched via /api/pixel-config so a change at
 * /admin takes effect without a redeploy. An empty ID disables the pixel.
 *
 * The snippet is idempotent (if fbq already exists it does nothing), so
 * rendering this component on several pages during SPA navigation is safe.
 *
 * `pageView` fires the automatic PageView event (home page per spec); the
 * other pages load the pixel only so they can fire their own events
 * (InitiateCheckout / Purchase).
 */
export default function MetaPixel({ pageView = false }: { pageView?: boolean }) {
  const [pixelId, setPixelId] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pixel-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { pixelId?: string } | null) => {
        if (!cancelled && d?.pixelId) setPixelId(d.pixelId);
      })
      .catch(() => {
        /* pixel stays disabled */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pixelId) return;
    const w = window as unknown as Record<string, any>;
    if (w.fbq) return; // already initialised on a previous page

    const n = function (...args: any[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    } as any;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    w.fbq = n;
    w._fbq = n;

    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = document.getElementsByTagName("script")[0];
    s?.parentNode?.insertBefore(t, s);

    n("init", pixelId);
    if (pageView) n("track", "PageView");
  }, [pixelId, pageView]);

  if (!pixelId || !pageView) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
