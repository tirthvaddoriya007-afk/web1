import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = { title: "Search" };

// Static shell — served straight from the CDN. The search itself (input +
// results) runs entirely in the browser and queries Supabase directly, so a
// shopper search never invokes a Vercel function.
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <SearchClient />
    </div>
  );
}
