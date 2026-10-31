import type { Metadata } from "next";
import PolicyPage, { PolicySection } from "../PolicyPage";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Mega sale",
  description: "Learn about return eligibility and refund processing for Mega sale orders.",
};

export default function ReturnRefundPage() {
  return (
    <PolicyPage
      title="Return & refund policy"
      description="We want you to feel confident shopping with us. Here is how returns and refunds work."
    >
      <PolicySection title="Return eligibility">
        <p>
          Most items are eligible for a return within 7 days of delivery. Eligibility can vary by product;
          check the product details and contact us if you are unsure.
        </p>
        <p>
          If an item arrives damaged, incorrect, or significantly different from its listing, report the
          issue within the applicable return window and include clear photos when possible.
        </p>
      </PolicySection>

      <PolicySection title="How to request a return">
        <p>
          Open the order confirmation or your order details and contact us with the order number, the item
          you want to return, and the reason. Our support team will confirm whether the item is eligible
          and explain the next steps.
        </p>
        <p>Please keep the item and its original packaging until your return request has been reviewed.</p>
      </PolicySection>

      <PolicySection title="Refunds">
        <p>
          Once an approved return has been received and checked, refunds are usually processed within
          3–5 business days. The time it takes for the funds to appear may also depend on your bank or
          payment provider.
        </p>
        <p>
          Cash-on-delivery refunds may require bank or UPI details. We will provide instructions when
          your return is approved. Shipping or other charges, if any, are handled according to the
          circumstances of the order and applicable law.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
