import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { PolicySection } from "../PolicyPage";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Store policy | ${brand.name}`,
  description: `Store information and guidance for shopping and managing orders with ${brand.name}.`,
};

export default function StorePolicyPage() {
  return (
    <PolicyPage
      title="Store policy"
      description="Information and guidance for browsing products, placing orders, and getting support."
    >
      <PolicySection title="Seller information">
        <p>Business name: {brand.seller.legalName}</p>
        <p>Proprietor: {brand.seller.proprietor}</p>
        <p>Business address: {brand.seller.address}</p>
        <p>GSTIN: {brand.seller.gstin ?? "Not registered"}</p>
      </PolicySection>

      <PolicySection title="Getting started">
        <p>
          Browse the latest products, add the items you like to your cart, and follow the checkout steps
          to place an order. Your cart is saved in this browser so you can come back to it later.
        </p>
        <Link href="/home" className="inline-flex font-bold no-underline" style={{ color: "var(--brand)" }}>
          Start shopping →
        </Link>
      </PolicySection>

      <PolicySection title="Delivery and payment">
        <p>
          We currently deliver across India. Standard shipping is free, and estimated delivery is
          7–10 days. You can pay the full order total by UPI, or choose cash on delivery with a ₹100
          UPI advance. The COD advance is credited toward the order total (or the full total if it is
          below ₹100); the remaining balance is due at delivery. Full-UPI orders are confirmed after
          the payment is manually verified; COD orders are confirmed after the advance is verified.
        </p>
      </PolicySection>

      <PolicySection title="After you order">
        <p>
          Keep your order confirmation handy. Enter the order ID and checkout phone number on the Orders
          page to check current status and any courier tracking details. Contact support if you need help.
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
