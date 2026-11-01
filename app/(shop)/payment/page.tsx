import { isPaytmConfigured } from "@/lib/paytm";
import PaymentClient from "./PaymentClient";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  return <PaymentClient gatewayReady={isPaytmConfigured()} />;
}
