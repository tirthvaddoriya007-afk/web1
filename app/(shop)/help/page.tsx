import Link from "next/link";
import { brand } from "@/lib/brand";

export default function HelpPage() {
  const whatsappNumber = brand.support.whatsapp.replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-[#f4f4f6] px-4 py-5 pb-24">
      <div className="mx-auto max-w-xl">
        <header className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <h1 className="text-[20px] font-extrabold text-[#1a2024]">Help Centre</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-[#535766]">
            Contact us with your question. For an existing order, include the order number.
          </p>
        </header>

        <section className="mt-3 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h2 className="text-[15px] font-bold text-[#1a2024]">Contact support</h2>
          <div className="mt-3 flex flex-col gap-3 text-[14px]">
            <a
              href={`mailto:${brand.support.email}`}
              className="font-semibold no-underline"
              style={{ color: "var(--brand)" }}
            >
              Email: {brand.support.email}
            </a>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="font-semibold no-underline"
              style={{ color: "var(--brand)" }}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp: {brand.support.whatsapp}
            </a>
            <p className="text-[13px] text-[#535766]">Support hours: {brand.support.hours}</p>
            <Link href="/order" className="font-semibold no-underline" style={{ color: "var(--brand)" }}>
              View your orders
            </Link>
          </div>
        </section>

        <nav aria-label="Store policies" className="mt-3 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h2 className="text-[15px] font-bold text-[#1a2024]">Store policies</h2>
          <div className="mt-3 flex flex-col gap-3 text-[14px]">
            <Link href="/policy/return-refund" className="font-semibold no-underline" style={{ color: "var(--brand)" }}>
              Returns and refunds
            </Link>
            <Link href="/policy/privacy" className="font-semibold no-underline" style={{ color: "var(--brand)" }}>
              Privacy
            </Link>
            <Link href="/policy/storepolicy" className="font-semibold no-underline" style={{ color: "var(--brand)" }}>
              Store information
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
