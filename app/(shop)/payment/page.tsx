import { getUpiConfig } from "@/lib/settings";
import PaymentClient from "./PaymentClient";

// ISR: rendered once, served from the CDN for 1 hour. A UPI ID saved in /admin
// invalidates the cache instantly, so customers always get current UPI details.
export const revalidate = 3600;

export default async function PaymentPage() {
  const upi = await getUpiConfig();
  return <PaymentClient upi={upi} />;
}
