"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";

export default function MetaPixel() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname === "/mobile-only") return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackMetaEvent("PageView");
  }, [pathname]);

  return null;
}
