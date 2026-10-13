"use client";

import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/visitor";
import { isBot } from "@/lib/ua";

const METHODS = new Set(["gpay", "phonepe", "paytm", "cod"]);

/**
 * Pay Now / Place Order click beacon, written straight into Supabase
 * (table pay_clicks). Same fire-and-forget contract as before — the insert
 * goes direct from the browser, so Vercel sees no function call.
 */
export function trackPayClick(method: string, amount: number) {
  if (typeof window === "undefined") return;
  if (isBot(navigator.userAgent)) return;
  if (!METHODS.has(method)) return;
  createClient()
    .from("pay_clicks")
    .insert({
      visitor_id: getVisitorId(),
      method,
      amount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
    })
    .then(() => {}, () => {
      /* analytics must never break checkout */
    });
}
