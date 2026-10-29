import Link from "next/link";

// Tappable search bar that opens the full search page. Placed on browse pages.
export default function SearchBar() {
  return (
    <div className="bg-white px-3 py-2.5 border-b">
      <Link
        href="/search"
        className="flex items-center gap-2 bg-[#f2f2f5] rounded-lg px-3 py-2.5 no-underline"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
        </svg>
        <span className="text-[14px] text-[#9b9b9b]">Search for Sarees, Kurtis, Cosmetics, etc.</span>
      </Link>
    </div>
  );
}
