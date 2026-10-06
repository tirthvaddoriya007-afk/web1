import { createClient } from "@/lib/supabase/server";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics";
import AnalyticsDashboard, {
  type AnalyticsStats,
  type PayClickStats,
  type WelcomeClickStats,
} from "@/components/admin/AnalyticsDashboard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const requested = searchParams.range ?? "7d";
  const range: AnalyticsRange = ANALYTICS_RANGES.some((r) => r.key === requested)
    ? (requested as AnalyticsRange)
    : "7d";

  const supabase = createClient();
  const [views, clicks, welcomeClicks] = await Promise.all([
    supabase.rpc("page_views_stats", { p_window: range }),
    supabase.rpc("pay_clicks_stats"),
    supabase.rpc("welcome_clicks_stats"),
  ]);

  return (
    <AnalyticsDashboard
      stats={(views.data as AnalyticsStats) ?? null}
      payClicks={(clicks.data as PayClickStats) ?? null}
      welcomeClicks={(welcomeClicks.data as WelcomeClickStats) ?? null}
      range={range}
    />
  );
}
