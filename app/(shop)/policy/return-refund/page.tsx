import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { PolicySection } from "../PolicyPage";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Return & Refund Policy | ${brand.name}`,
  description: `Learn about return eligibility and refund processing for ${brand.name} orders.`,
};

export default function ReturnRefundPage() {
  return (
    <PolicyPage
      title="Return & refund policy"
      description="Returns are available for eligible items within 7 days of delivery."
    >
      <PolicySection title="Return eligibility">
        <p>
          Request a return within 7 calendar days of delivery for eligible non-perishable items that
          are unused and unopened, with their original packaging. Food and other perishable items can
          only be reported for a return or refund if they arrive damaged or incorrect. Contact support
          promptly and include your order number and details of the issue.
        </p>
        <p>
          We arrange and pay for return shipping for approved returns. Support will confirm the return
          instructions before an item is sent back.
        </p>
      </PolicySection>

      <PolicySection title="Order issues">
        <p>
          If we cancel an order or cannot fulfill it, any UPI amount already paid for that order,
          whether a COD advance or full payment, will be refunded to the original UPI account. For a
          customer cancellation, contact support as soon as possible; orders already dispatched are
          handled under the return terms above.
        </p>
      </PolicySection>

      <PolicySection title="Refunds and support">
        <p>
          After an approved return or cancellation, allow 24–48 hours for refund processing. The
          refund should reach the original payment account within 3–4 business days after processing,
          depending on the payment provider. Contact the{" "}
          <Link href="/help" className="font-semibold" style={{ color: "var(--brand)" }}>Help Centre</Link>{" "}
          with your order number if it has not arrived.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
