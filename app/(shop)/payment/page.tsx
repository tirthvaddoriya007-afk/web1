import { getUpiConfig } from "@/lib/settings";
import MetaPixel from "@/components/MetaPixel";
import PaymentClient from "./PaymentClient";

// Read on every request so a UPI ID saved in /admin takes effect immediately.
// fetchCache force-no-store: Next 14 otherwise caches the Supabase GET in its
// server data cache, serving customers the OLD UPI ID after an admin update.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PaymentPage() {
  const upi = await getUpiConfig();
  return (
    <>
      <PaymentClient upi={upi} />
      {/* Pixel library only — Purchase fires on the Pay Now click */}
      <MetaPixel />
    </>
  );
}
