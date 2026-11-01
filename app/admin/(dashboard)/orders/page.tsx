import { createClient } from "@/lib/supabase/server";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, customer_phone, address, items, total, advance_amount, balance_due, payment_mode, payment_status, status, placed_at, tracking_number, tracking_url, meta_measurement_consent, purchase_event_sent_at")
    .order("placed_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Could not load admin orders:", error.message);
    return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">Could not load orders.</p>;
  }

  return <OrdersTable orders={data ?? []} />;
}
