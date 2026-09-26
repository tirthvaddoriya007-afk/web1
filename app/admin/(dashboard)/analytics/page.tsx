import { createClient } from "@/lib/supabase/server";
import AnalyticsDashboard, { type AnalyticsStats } from "@/components/admin/AnalyticsDashboard";

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
  const { data } = await supabase.rpc("page_views_stats", { days });

  return <AnalyticsDashboard stats={(data as AnalyticsStats) ?? null} days={days} />;
}
