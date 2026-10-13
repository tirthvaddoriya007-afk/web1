"use client";

import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/visitor";
import { isBot } from "@/lib/ua";

/**
 * Fire a welcome-tap beacon straight into Supabase (table welcome_clicks).
 * Call only from client event handlers — same fire-and-forget contract as
 * before, but no Vercel function is involved. A tap is any click anywhere on
 * the welcome landing (every tap sends the visitor to /home); the
 * auto-redirect timer does NOT count as a tap.
 */
export function trackWelcomeClick() {
  if (typeof window === "undefined") return;
  if (isBot(navigator.userAgent)) return;
  createClient()
    .from("welcome_clicks")
    .insert({ visitor_id: getVisitorId() })
    .then(() => {}, () => {
      /* analytics must never block navigation */
    });
}
