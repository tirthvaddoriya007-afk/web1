"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/visitor";
import { classifyUserAgent, isBot } from "@/lib/ua";

/**
 * Invisible analytics beacon. Mounted once in the storefront layout, it
 * inserts one row into public.page_views on every navigation — directly from
 * the browser to Supabase, so Vercel never sees a function call. The same
 * filters as the old /api/track route apply: bots, admin/api/asset paths are
 * ignored, and the visitor UUID is the shared localStorage id.
 */
const BLOCKED_PREFIXES = ["/api/", "/_next/", "/admin", "/favicon"];
const ASSET_RE = /\.[a-z0-9]{2,5}(\?|$)/i;

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef("");

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    if (url === lastSent.current) return; // already recorded this navigation
    lastSent.current = url;

    const ua = navigator.userAgent || "";
    if (isBot(ua)) return;
    if (
      !url.startsWith("/") ||
      BLOCKED_PREFIXES.some((p) => url.startsWith(p)) ||
      ASSET_RE.test(url)
    ) {
      return;
    }

    // Referrer: keep the domain only; drop same-site navigations.
    let referrer = "";
    try {
      const raw = document.referrer;
      if (raw) {
        const u = new URL(raw);
        if (u.hostname && u.hostname !== location.hostname) {
          referrer = u.hostname.slice(0, 200);
        }
      }
    } catch {
      referrer = "";
    }

    const { client, device } = classifyUserAgent(ua);

    createClient()
      .from("page_views")
      .insert({
        visitor_id: getVisitorId(),
        path: url.slice(0, 500),
        referrer,
        utm_source: (searchParams.get("utm_source") ?? "").slice(0, 200),
        utm_medium: (searchParams.get("utm_medium") ?? "").slice(0, 200),
        utm_campaign: (searchParams.get("utm_campaign") ?? "").slice(0, 200),
        client,
        device,
      })
      .then(() => {}, () => {
        /* analytics must never break the page */
      });
  }, [pathname, searchParams]);

  return null;
}
