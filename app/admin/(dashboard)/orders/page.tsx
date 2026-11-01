import { createClient } from "@/lib/supabase/server";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const SUMMARY_PAGE_SIZE = 1000;

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const [{ data, error }, firstConfirmedPage] = await Promise.all([
    supabase
    .from("orders")
    .select("id, customer_name, customer_phone, address, items, total, advance_amount, balance_due, payment_mode, payment_status, status, placed_at, tracking_number, tracking_url, meta_measurement_consent, purchase_event_sent_at")
    .order("placed_at", { ascending: false })
    .limit(200),
    supabase
      .from("orders")
      .select("total, placed_at")
      .eq("payment_status", "Verified")
      .neq("status", "Cancelled")
      .order("placed_at", { ascending: false })
      .range(0, SUMMARY_PAGE_SIZE - 1),
  ]);

  if (error) {
    console.error("Could not load admin orders:", error.message);
    return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">Could not load orders.</p>;
  }

  let summaryError = firstConfirmedPage.error?.message ?? null;
  const confirmedOrders = [...(firstConfirmedPage.data ?? [])];
  let offset = SUMMARY_PAGE_SIZE;

  while (!summaryError && confirmedOrders.length === offset) {
    const { data: nextPage, error: nextPageError } = await supabase
      .from("orders")
      .select("total, placed_at")
      .eq("payment_status", "Verified")
      .neq("status", "Cancelled")
      .order("placed_at", { ascending: false })
      .range(offset, offset + SUMMARY_PAGE_SIZE - 1);

    if (nextPageError) {
      console.error("Could not load daily confirmed order totals:", nextPageError.message);
      summaryError = nextPageError.message;
      break;
    }
    confirmedOrders.push(...(nextPage ?? []));
    offset += SUMMARY_PAGE_SIZE;
  }

  if (summaryError) {
    console.error("Could not load daily confirmed order totals:", summaryError);
  }

  const totalsByDay = new Map<string, { total: number; count: number }>();
  for (const order of confirmedOrders) {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(order.placed_at));
    const date = `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
    const current = totalsByDay.get(date) ?? { total: 0, count: 0 };
    current.total = Math.round((current.total + Number(order.total)) * 100) / 100;
    current.count += 1;
    totalsByDay.set(date, current);
  }

  const dailyTotals = [...totalsByDay.entries()]
    .map(([date, summary]) => ({ date, total: summary.total, count: summary.count }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <OrdersTable
      orders={data ?? []}
      dailyTotals={dailyTotals}
      dailyTotalsError={summaryError ? "Daily confirmed totals could not be loaded." : null}
    />
  );
}
