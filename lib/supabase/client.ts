"use client";

import { createBrowserClient } from "@supabase/ssr";

// Supabase client for Client Components. Uses the anon key, so every query is
// still subject to the RLS policies in supabase/schema.sql.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
