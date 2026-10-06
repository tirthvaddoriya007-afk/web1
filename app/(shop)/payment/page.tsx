import { getUpiConfig } from "@/lib/settings";
import MetaPixel from "@/components/MetaPixel";
import PaymentClient from "./PaymentClient";

// Served through the 10s SWR cache — a UPI ID saved in /admin invalidates the
// cache instantly, so customers always get the current UPI details.
export const dynamic = "force-dynamic";

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
