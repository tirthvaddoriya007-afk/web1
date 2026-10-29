import type { MetadataRoute } from "next";

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
    sitemap: "https://big-deal.online/sitemap.xml",
  };
}
