"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
import SignOutButton from "@/app/admin/(dashboard)/SignOutButton";

const NAV = [
  {
    href: "/admin",
    label: "UPI Settings",
    exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
        <path d="M3 17l9 5 9-5" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3h8v8H3z" />
        <path d="M13 3h8v8h-8z" />
        <path d="M3 13h8v8H3z" />
        <path d="M13 13h8v8h-8z" />
      </svg>
    ),
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 12a8 8 0 1 1-4.5-7.2" />
        <path d="M21 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function titleFor(pathname: string): string {
  const item = NAV.find((n) => isActive(pathname, n.href, n.exact));
  return item?.label ?? "Admin";
}

function SidebarContent({ email, pathname }: { email: string; pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <p className="text-lg font-extrabold tracking-tight text-white">{brand.name} Admin</p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-white/50">
          Control Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r"
                  style={{ background: brand.colors.primary }}
                />
              )}
              <span className={active ? "opacity-100" : "opacity-80"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin identity */}
      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-xs font-medium text-white/80">{email}</p>
        <div className="mt-3">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block"
        style={{
          background: `linear-gradient(180deg, ${brand.colors.primaryDark} 0%, #3d0a33 100%)`,
        }}
      >
        <SidebarContent email={email} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute inset-y-0 left-0 w-64"
            style={{
              background: `linear-gradient(180deg, ${brand.colors.primaryDark} 0%, #3d0a33 100%)`,
            }}
          >
            <SidebarContent email={email} pathname={pathname} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-base font-bold text-gray-900">{titleFor(pathname)}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View Store
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
