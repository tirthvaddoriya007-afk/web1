"use client";

import Link from "next/link";
import { useState } from "react";
import { brand } from "@/lib/brand";

const TILES = [
  { title: "Orders", sub: "Track, modify,…", icon: "📦" },
  { title: "Returns", sub: "Policy & pickup", icon: "↩️" },
  { title: "Payments", sub: "Refunds & C…", icon: "💳" },
  { title: "Contact", sub: "Chat, email &…", icon: "🎧" },
];

const CATEGORIES = [
  { title: "Delivery", sub: "Delay, reschedule", icon: DeliveryIcon },
  { title: "Returns", sub: "Pickup, exchange", icon: ReturnIcon },
  { title: "Payments", sub: "Invoice, GST, refunds", icon: PayIcon },
  { title: "Account", sub: "Login, addresses", icon: AccountIcon },
  { title: "Notifications", sub: "SMS, WhatsApp", icon: BellIcon },
  { title: "Offers", sub: "Coupons, credits", icon: TagIcon },
];

const FAQS = [
  { q: "How do I track my order?", a: "Go to Orders → select the order → tap Track. You'll see live updates for Processing, Shipped, and Delivery." },
  { q: "Can I cancel or modify my order?", a: "You can cancel until the order is Shipped. For address changes, cancel and reorder with the correct address." },
  { q: "What is the return policy?", a: "Most items are eligible for 7-day easy returns. Open the order → Return/Exchange and choose a reason." },
  { q: "Item is damaged/wrong—what should I do?", a: "Raise a return within the window and upload photos of the issue. Our team will arrange a pickup and replacement/refund." },
  { q: "When will I receive my refund?", a: "Once we receive the item, refunds are processed in 3–5 business days to your original payment method. COD refunds go to bank/UPI." },
  { q: "How can I download my invoice?", a: "Open the order → tap Download Invoice. For GST invoices, add your GSTIN in the order before checkout." },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(#fdeef8, #ffffff 240px)" }}>
      {/* Search card */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4">
          <h1 className="text-[20px] font-extrabold text-[#1a2024]">How can we help?</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--brand)" }}>
            Search for orders, refunds, returns, delivery timelines and more.
          </p>
          <div className="flex items-center gap-2 bg-[#f2f2f5] rounded-lg mt-3 pl-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
            <input placeholder="Search help (e.g., refund status, r…" className="flex-1 bg-transparent py-3 text-[14px] outline-none" />
            <button className="btn-brand !w-auto px-4 !py-2 m-1 text-[13px]">Search</button>
          </div>

          {/* Quick tiles */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {TILES.map((t) => (
              <div key={t.title} className="flex items-center gap-2.5 border border-[#f0e6f0] rounded-xl p-3">
                <span className="w-9 h-9 rounded-lg bg-[#f7ecf5] grid place-items-center text-[16px]">{t.icon}</span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#1a2024]">{t.title}</p>
                  <p className="text-[11px] text-[#9b9b9b] truncate">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by category */}
      <Section title="Browse by Category" icon={<LayersIcon />}>
        <div className="space-y-2">
          {CATEGORIES.map(({ title, sub, icon: Icon }) => (
            <div key={title} className="flex items-center gap-3 border border-[#eee] rounded-xl px-3 py-3">
              <Icon />
              <div>
                <span className="text-[14px] font-bold text-[#1a2024]">{title}</span>
                <span className="text-[12px] text-[#9b9b9b] ml-2">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Popular FAQs */}
      <Section title="Popular FAQs" icon={<QIcon />}>
        <div className="space-y-2.5">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </Section>

      {/* Need more help */}
      <Section title="Need more help?" icon={<HeadsetIcon />}>
        <div className="space-y-2.5">
          <ContactCard icon={<ChatIcon />} title="Chat with us" sub="Get instant answers from our virtual assistant." />
          <ContactCard icon={<MailIcon />} title="Email Support" sub="We usually respond within 24 hours." />
          <ContactCard icon={<PhoneIcon />} title={`Call us: ${brand.support.whatsapp}`} sub={brand.support.hours} />
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 bg-[#f7ecf5] text-[#60014a] text-[11px] font-semibold px-2 py-1 rounded">
            <HeartShield /> Buyer Protection
          </span>
          <p className="text-[12px] text-[#9b9b9b] mt-2 leading-snug">
            Full refunds for eligible orders if your item doesn&apos;t arrive, is damaged, or differs significantly from the listing.
          </p>
        </div>
      </Section>

      <p className="text-center text-[12px] text-[#9b9b9b] py-6">
        © {new Date().getFullYear()} <span style={{ color: "var(--brand)" }}>{brand.name} Help Centre</span> · Policies · Terms · Privacy
      </p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-4 mt-4">
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-4">
        <h2 className="flex items-center gap-2 font-bold text-[15px] mb-3">{icon}{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#eee] rounded-xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-3 py-3 text-left">
        <PinIcon />
        <span className="text-[14px] font-semibold text-[#1a2024] flex-1">{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "none", transition: ".2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <p className="px-3 pb-3 text-[13px] text-[#535766] leading-relaxed">{a}</p>}
    </div>
  );
}

function ContactCard({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="border border-[#eee] rounded-xl p-3">
      <div className="mb-1.5">{icon}</div>
      <p className="text-[14px] font-bold text-[#1a2024]">{title}</p>
      <p className="text-[12px] text-[#9b9b9b]">{sub}</p>
    </div>
  );
}

/* icons */
const P = "var(--brand)";
function LayersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8" strokeLinejoin="round"><path d="M12 2l10 6-10 6L2 8z" /><path d="M2 12l10 6 10-6M2 16l10 6 10-6" /></svg>; }
function QIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 16.5h.01" strokeLinecap="round" /></svg>; }
function HeadsetIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2M20 13a2 2 0 0 0-2 2v2a2 2 0 0 0 4 0v-2M18 19a5 5 0 0 1-5 3" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function DeliveryIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" /><circle cx="7" cy="17" r="1.5" /><circle cx="17" cy="17" r="1.5" /></svg>; }
function ReturnIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></svg>; }
function PayIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></svg>; }
function AccountIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" /></svg>; }
function BellIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 19a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function TagIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><path d="M3 12l9-9 9 9-9 9z" /><circle cx="9" cy="9" r="1.4" fill={P} /></svg>; }
function PinIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill={P}><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>; }
function ChatIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><path d="M4 5h16v11H8l-4 3z" strokeLinejoin="round" /></svg>; }
function MailIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>; }
function PhoneIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8"><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinejoin="round" /></svg>; }
function HeartShield() { return <svg width="12" height="14" viewBox="0 0 17 20" fill="none"><path d="M8.5 1L1 3.5v6C1 14.5 4.4 17.5 8.5 19c4.1-1.5 7.5-4.5 7.5-9.5v-6L8.5 1z" fill="#60014A" /></svg>; }
