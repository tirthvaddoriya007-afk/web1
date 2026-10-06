/**
 * Analytics time ranges — a plain (server-safe) module so both the admin
 * analytics page (server component) and the dashboard (client component) can
 * use these without crossing the RSC client boundary.
 */
export const ANALYTICS_RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number]["key"];
