import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { brand } from "@/lib/brand";
import { emptyUpiConfig, type UpiConfig } from "@/lib/upi";

/**
 * Site-wide settings reads (UPI + pixel ID). Cached 10s with the "settings"
 * tag — shopper pages don't wait on Supabase, and an admin save at /admin
 * triggers /api/revalidate (revalidateTag("settings")) so changes go live
 * immediately. Uses the anon key (public RLS read) instead of the cookie-based
 * session client, so a stale/expired admin session can never break the
 * storefront's payment page — reading these settings is public by design.
 */
const settingsClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

/** Data-Cache wrapper: 10s SWR + "settings" tag for admin-triggered purges. */
function cachedSettings<T>(key: string[], fn: () => Promise<T>): Promise<T> {
  return unstable_cache(fn, key, { revalidate: 10, tags: ["settings"] })();
}

export const getUpiConfig = cache((): Promise<UpiConfig> =>
  cachedSettings(["upi"], async () => {
    try {
      const { data } = await settingsClient
        .from("settings")
        .select("upi_vpa, upi_payee_name, upi_merchant_code")
        .eq("id", 1)
        .maybeSingle();

      if (!data?.upi_vpa) return emptyUpiConfig;

      return {
        vpa: data.upi_vpa,
        payeeName: data.upi_payee_name || brand.name,
        merchantCode: data.upi_merchant_code || "",
      };
    } catch {
      // Supabase not reachable / not configured yet — fall back to
      // "unconfigured" so the payment page shows COD rather than building a
      // broken UPI link.
      return emptyUpiConfig;
    }
  })
);

/** Meta Pixel ID — read client-side by MetaPixel straight from Supabase. */
