import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loading…",
  robots: { index: false, follow: false },
};

// The store is phone-only: middleware rewrites desktop/tablet visitors here.
// A bare spinner and nothing else — deliberately unbranded and silent.
export default function MobileOnlyPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-white">
      <div
        role="status"
        aria-label="Loading"
        className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-400"
      />
    </main>
  );
}
