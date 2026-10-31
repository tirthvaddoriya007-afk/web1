import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { PolicySection } from "../PolicyPage";

export const metadata: Metadata = {
  title: "Store policy | Mega sale",
  description: "Store information and guidance for shopping and managing orders with Mega sale.",
};

export default function StorePolicyPage() {
  return (
    <PolicyPage
      title="Store policy"
      description="Information and guidance for browsing products, placing orders, and getting support."
    >
      <PolicySection title="Getting started">
        <p>
          Browse the latest products, add the items you like to your cart, and follow the checkout steps
          to place an order. Your cart is saved in this browser so you can come back to it later.
        </p>
        <Link href="/home" className="inline-flex font-bold no-underline" style={{ color: "var(--brand)" }}>
          Start shopping →
        </Link>
      </PolicySection>

      <PolicySection title="After you order">
        <p>
          Keep your order confirmation handy. Visit the Orders page to look up order information and
          contact support if you have a question about delivery, a return, or a refund.
        </p>
        <Link href="/order" className="inline-flex font-bold no-underline" style={{ color: "var(--brand)" }}>
          View orders →
        </Link>
      </PolicySection>

      <PolicySection title="Need a hand?">
        <p>
          Visit our Help Centre for answers to common questions and support options. You can also read
          our return and refund or privacy policies below.
        </p>
        <Link href="/help" className="inline-flex font-bold no-underline" style={{ color: "var(--brand)" }}>
          Go to Help Centre →
        </Link>
      </PolicySection>
    </PolicyPage>
  );
}
