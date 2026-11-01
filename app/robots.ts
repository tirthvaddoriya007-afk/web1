import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

// Keep well-behaved crawlers efficient: everything is indexable, the sitemap
// lists every route, and the /mobile-only loader page is excluded.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/mobile-only", "/admin"],
      },
    ],
    sitemap: `${brand.siteUrl}/sitemap.xml`,
  };
}
