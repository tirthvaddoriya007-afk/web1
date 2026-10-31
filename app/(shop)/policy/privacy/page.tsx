import type { Metadata } from "next";
import PolicyPage, { PolicySection } from "../PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Mega sale",
  description: "Learn how Mega sale uses information when you browse and place an order.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy policy"
      description="This page explains what information is used when you browse Mega sale or place an order."
    >
      <PolicySection title="Information you provide">
        <p>
          When you place an order, we use the name, phone number, and delivery address you provide to
          process and deliver it. Your order details, selected items, payment method, and order status
          are also recorded to manage and support the order. Optional profile details and preferences
          are saved when you choose to enter them.
        </p>
      </PolicySection>

      <PolicySection title="How information is stored and used">
        <p>
          Cart contents, saved delivery details, order details, and profile preferences may be stored in
          your browser&apos;s local storage so the storefront can remember them on that device. Orders
          placed through the site are also sent to our order-storage provider so we can process and
          fulfill them.
        </p>
        <p>
          We use this information to operate the shop, process orders, provide customer support, and
          improve the shopping experience. Access to information stored in your browser may be available
          to anyone who can use that browser or device.
        </p>
      </PolicySection>

      <PolicySection title="Analytics and advertising">
        <p>
          The site uses Meta Pixel and Conversions API to measure page visits and shopping events such
          as product views, searches, cart activity, and purchases. These services may receive event
          details, browser and device information, IP address, and relevant Meta cookies to measure
          advertising performance.
        </p>
      </PolicySection>

      <PolicySection title="Your choices and questions">
        <p>
          You can clear this site&apos;s browser storage using your browser settings; doing so may remove
          saved cart, address, order, and profile information from that device. For questions about
          information associated with an order, contact us through the Help Centre and include the
          order number where possible.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
