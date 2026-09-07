import { getUpiConfig } from "@/lib/settings";
import PaymentClient from "./PaymentClient";

// Read on every request so a UPI ID saved in /admin takes effect immediately.
export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const upi = await getUpiConfig();
  return <PaymentClient upi={upi} />;
}
