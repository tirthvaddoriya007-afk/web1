import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { brand } from "@/lib/brand";
import { emptyUpiConfig, type UpiConfig } from "@/lib/upi";

/** Anon client for the public-readable settings row (no session needed). */
function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // cache: "no-store" — otherwise Next 14's data cache can keep serving a
      // stale settings row (e.g. an old pixel ID) on Vercel after an admin save.
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}

/**
 * Site-wide UPI details, as saved by an admin at /admin. Server-side only —
 * call it from a Server Component and pass the result into client components.
 *
 * Uses the anon key (public RLS read) instead of the cookie-based session
 * client, so a stale/expired admin session can never break the storefront's
 * payment page — reading these settings is public by design.
 */
export async function getUpiConfig(): Promise<UpiConfig> {
  try {
    const { data } = await anonClient()
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
    // Supabase not reachable / not configured yet — fall back to "unconfigured"
    // so the payment page shows COD rather than building a broken UPI link.
    return emptyUpiConfig;
  }
}

/**
 * Meta Pixel ID from the admin settings row. Empty string disables the pixel.
 */
export async function getMetaPixelId(): Promise<string> {
  try {
    const { data } = await anonClient()
      .from("settings")
      .select("meta_pixel_id")
      .eq("id", 1)
      .maybeSingle();

    return data?.meta_pixel_id || "";
  } catch {
    return "";
  }
}
