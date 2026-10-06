"use client";

import { useEffect } from "react";

/**
 * Warms the browser cache for the home page's above-the-fold images while the
 * visitor is still on the welcome screen. By the time they tap "Continue to
 * Shopping", the banners and first product images are already loaded — the
 * home page paints instantly with no visible image loading.
 */
export default function PreloadImages({ srcs }: { srcs: string[] }) {
  useEffect(() => {
    for (const src of srcs) {
      if (!src) continue;
      const img = new Image();
      img.src = src;
    }
  }, [srcs]);

  return null;
}
