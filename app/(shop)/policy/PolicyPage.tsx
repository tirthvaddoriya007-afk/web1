import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/policy/return-refund", label: "Return & refund" },
  { href: "/policy/privacy", label: "Privacy" },
  { href: "/policy/storepolicy", label: "Store policy" },
];

export default function PolicyPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f4f6] px-4 py-5 pb-24">
      <div className="mx-auto max-w-xl">
        <Link href="/help" className="text-[13px] font-semibold no-underline" style={{ color: "var(--brand)" }}>
          ← Help Centre
        </Link>

        <header className="mt-4 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--brand)" }}>
            Mega sale · Policies
          </p>
          <h1 className="mt-2 text-[22px] font-extrabold text-[#1a2024]">{title}</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#7e808c]">{description}</p>
        </header>

        <div className="mt-3 space-y-3">{children}</div>

        <nav aria-label="Policy pages" className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px]">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="font-semibold no-underline" style={{ color: "var(--brand)" }}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="text-[15px] font-bold text-[#1a2024]">{title}</h2>
      <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-[#535766]">{children}</div>
    </section>
  );
}
