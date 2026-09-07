"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
import { useStore } from "@/lib/store";

// Checkout pages: back + TITLE only (no icons).
const CHECKOUT_TITLES: Record<string, string> = {
  "/cart": "CART",
  "/address": "ADD DELIVERY ADDRESS",
  "/payment": "PAYMENT",
  "/summary": "ORDER SUMMARY",
};
// Tab pages: back + TITLE + icons.
const TAB_TITLES: Record<string, string> = {
  "/category": "CATEGORIES",
  "/order": "MY ORDER",
  "/help": "HELP",
  "/account": "ACCOUNT",
  "/search": "SEARCH",
};

export default function Header() {
  const { count, openCart } = useStore();
  const pathname = usePathname();
  const showBack = pathname !== "/";
  const checkoutTitle = CHECKOUT_TITLES[pathname];
  const tabTitle = TAB_TITLES[pathname];

  const BackBtn = () => (
    <button aria-label="Back" onClick={() => history.back()} className="-ml-1 flex items-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );

  const Icons = () => (
    <div className="flex items-center gap-4">
      <button aria-label="Wishlist" className="text-[#ED3843]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20.8 3.6 12.4a5.1 5.1 0 0 1 0-7.2 5.1 5.1 0 0 1 7.2 0l1.2 1.2 1.2-1.2a5.1 5.1 0 0 1 7.2 0 5.1 5.1 0 0 1 0 7.2z" />
        </svg>
      </button>
      <button aria-label="Cart" className="relative" onClick={openCart}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M2.5 3.5h1.9a1.1 1.1 0 0 1 1.08.9L5.9 6.6m0 0L7.6 15a1.4 1.4 0 0 0 1.37 1.12h7.72A1.4 1.4 0 0 0 18.06 15l1.44-8.4z" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9.5" cy="19.5" r="1.35" fill="var(--brand)" />
          <circle cx="16.5" cy="19.5" r="1.35" fill="var(--brand)" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#ED3843] text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </div>
  );

  // Checkout: back + title, no icons
  if (checkoutTitle) {
    return (
      <header className="app-header">
        <div className="flex items-center gap-2 px-3 py-3.5">
          <BackBtn />
          <span className="text-[15px] font-bold tracking-wide text-[#333]">{checkoutTitle}</span>
        </div>
      </header>
    );
  }

  // Tab page with title + icons
  if (tabTitle) {
    return (
      <header className="app-header">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <BackBtn />
            <span className="text-[15px] font-bold tracking-wide text-[#333]">{tabTitle}</span>
          </div>
          <Icons />
        </div>
      </header>
    );
  }

  // Default (home / product): logo + icons (+ back except home)
  return (
    <header className="app-header">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          {/* Drawer icon — decorative for now: not a button, not clickable.
              Sits left of the logo on home, where there is no back arrow. */}
          {!showBack && (
            <span className="flex items-center pr-1 pointer-events-none" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 17.2222C2 17.8359 2.49746 18.3333 3.11111 18.3333H20.8889C21.5025 18.3333 22 17.8359 22 17.2222C22 16.6086 21.5025 16.1111 20.8889 16.1111H3.11111C2.49746 16.1111 2 16.6086 2 17.2222ZM2 11.6667C2 12.2803 2.49746 12.7778 3.11111 12.7778H20.8889C21.5025 12.7778 22 12.2803 22 11.6667C22 11.053 21.5025 10.5556 20.8889 10.5556H3.11111C2.49746 10.5556 2 11.053 2 11.6667ZM3.11111 5C2.49746 5 2 5.49746 2 6.11111C2 6.72476 2.49746 7.22222 3.11111 7.22222H20.8889C21.5025 7.22222 22 6.72476 22 6.11111C22 5.49746 21.5025 5 20.8889 5H3.11111Z"
                  fill="#333333"
                />
              </svg>
            </span>
          )}
          {showBack && (
            <Link href="/" aria-label="Back to home" className="flex items-center pr-1 -ml-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2 no-underline">
            {brand.logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logoSrc} alt={brand.name} className="h-6 w-auto" />
            ) : (
              <span className="text-xl font-extrabold tracking-tight" style={{ color: "var(--brand-dark)" }}>
                {brand.name}
              </span>
            )}
          </Link>
        </div>
        <Icons />
      </div>
    </header>
  );
}
