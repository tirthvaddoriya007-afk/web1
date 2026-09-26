import { createClient } from "@/lib/supabase/server";
import AnalyticsDashboard, {
  type AnalyticsStats,
  type PayClickStats,
} from "@/components/admin/AnalyticsDashboard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const requested = Number.parseInt(searchParams.days ?? "7", 10);
  const days = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 90) : 7;

  const supabase = createClient();
  const [views, clicks] = await Promise.all([
    supabase.rpc("page_views_stats", { days }),
    supabase.rpc("pay_clicks_stats"),
  ]);

  return (
    <AnalyticsDashboard
      stats={(views.data as AnalyticsStats) ?? null}
      payClicks={(clicks.data as PayClickStats) ?? null}
      days={days}
    />
  );
}
