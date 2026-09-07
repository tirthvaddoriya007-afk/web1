"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICONS } from "./navIcons";

// Pages that have their own sticky action bar (Add to Cart / checkout) and so
// hide the tab footer — matching the reference.
const HIDE_PREFIXES = ["/product", "/cart", "/address", "/payment", "/summary"];

const ITEMS = [
  { href: "/", key: "home", label: "Home", match: (p: string) => p === "/" },
  { href: "/category", key: "categories", label: "Categories", match: (p: string) => p.startsWith("/category") },
  { href: "/order", key: "orders", label: "My Orders", match: (p: string) => p.startsWith("/order") },
  { href: "/help", key: "help", label: "Help", match: (p: string) => p.startsWith("/help") },
  { href: "/account", key: "account", label: "Account", match: (p: string) => p.startsWith("/account") },
];

// Recolor the reference SVG for active (brand) vs inactive (grey) states.
function tint(svg: string, active: boolean): string {
  if (active) {
    // greys -> brand; the Home icon keeps its multicolor fills.
    return svg.replace(/#616173/g, "#9f2089").replace(/#666/g, "#9f2089");
  }
  // inactive: neutralize the Home icon's colors and keep others grey.
  return svg
    .replace(/#9F2089/g, "#616173")
    .replace(/#60014A/g, "#616173")
    .replace(/#FF9D00/g, "#616173")
    .replace(/#666/g, "#616173");
}

export default function BottomNav() {
  const pathname = usePathname();
  if (HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {ITEMS.map((it) => {
        const active = it.match(pathname);
        return (
          <Link key={it.href} href={it.href} className={active ? "active" : ""}>
            <span
              className="nav-ic"
              dangerouslySetInnerHTML={{ __html: tint(NAV_ICONS[it.key], active) }}
            />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
