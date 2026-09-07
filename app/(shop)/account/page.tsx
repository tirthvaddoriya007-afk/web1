"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { brand } from "@/lib/brand";
import type { Address } from "@/lib/types";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
const STATE_ABBR: Record<string, string> = {
  "Andhra Pradesh": "AP", "Assam": "AS", "Bihar": "BR", "Chhattisgarh": "CG",
  "Delhi": "DL", "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR",
  "Himachal Pradesh": "HP", "Jharkhand": "JH", "Karnataka": "KA", "Kerala": "KL",
  "Madhya Pradesh": "MP", "Maharashtra": "MH", "Odisha": "OD", "Punjab": "PB",
  "Rajasthan": "RJ", "Tamil Nadu": "TN", "Telangana": "TS", "Uttar Pradesh": "UP",
  "Uttarakhand": "UK", "West Bengal": "WB",
};

interface Profile { name: string; phone: string; email: string; gender: string; }
interface Prefs { whatsapp: boolean; promo: boolean; }
const emptyProfile: Profile = { name: "", phone: "", email: "", gender: "" };
const emptyAddr: Address = { name: "", number: "", pin: "", city: "", flat: "", area: "", state: "Andhra Pradesh" };

export default function AccountPage() {
  const { address, saveAddress } = useStore();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [addr, setAddr] = useState<Address>(emptyAddr);
  const [prefs, setPrefs] = useState<Prefs>({ whatsapp: false, promo: false });
  const [savedTag, setSavedTag] = useState("");

  useEffect(() => {
    try {
      const p = localStorage.getItem("profile");
      if (p) setProfile({ ...emptyProfile, ...JSON.parse(p) });
      const pr = localStorage.getItem("prefs");
      if (pr) setPrefs({ whatsapp: false, promo: false, ...JSON.parse(pr) });
    } catch {}
  }, []);

  // Prefill address from the order-flow address (shared store / localStorage).
  useEffect(() => {
    if (address) setAddr({ ...emptyAddr, ...address });
  }, [address]);

  const flash = (t: string) => { setSavedTag(t); setTimeout(() => setSavedTag(""), 1500); };

  const saveProfile = () => {
    try { localStorage.setItem("profile", JSON.stringify(profile)); } catch {}
    flash("profile");
  };
  const saveAddr = () => { saveAddress(addr); flash("address"); };
  const savePrefs = () => {
    try { localStorage.setItem("prefs", JSON.stringify(prefs)); } catch {}
    flash("prefs");
  };

  const initial = (profile.name.trim()[0] || "Y").toUpperCase();
  const stateAbbr = address ? (STATE_ABBR[address.state || ""] || (address.state || "").slice(0, 2).toUpperCase()) : "";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(#fdeef8, #f4f4f6 200px)" }}>
      {/* brand row */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold text-[14px]" style={{ color: "var(--brand)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
          {brand.name}
        </span>
        <span className="flex items-center gap-1 bg-[#f7ecf5] text-[#60014a] text-[11px] font-semibold px-2.5 py-1 rounded-full">
          <svg width="12" height="14" viewBox="0 0 17 20" fill="none"><path d="M8.5 1L1 3.5v6C1 14.5 4.4 17.5 8.5 19c4.1-1.5 7.5-4.5 7.5-9.5v-6L8.5 1z" fill="#60014A" /></svg>
          Buyer Protection
        </span>
      </div>

      {/* Profile card */}
      <Card icon={<IdIcon />} title="Profile">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#f5e6f1] grid place-items-center text-[20px] font-bold" style={{ color: "var(--brand)" }}>
            {initial}
          </div>
          <div>
            <p className="font-bold text-[15px] text-[#1a2024]">{profile.name || "Your Name"}</p>
            <p className="text-[13px] text-[#7e808c]">+91 {profile.phone || "——————"}</p>
          </div>
        </div>

        <Field label="Full Name">
          <input className={inp} placeholder="Enter your name" value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </Field>
        <Field label="Phone">
          <input className={inp} placeholder="10-digit mobile" inputMode="numeric" value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
        </Field>
        <Field label="Email (optional)">
          <input className={inp} type="email" placeholder="you@example.com" value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </Field>
        <Field label="Gender (optional)">
          <div className="relative">
            <select className={`${inp} appearance-none`} value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
            <Chevron />
          </div>
        </Field>

        <div className="flex gap-2 mt-1">
          <SaveBtn onClick={saveProfile} label={savedTag === "profile" ? "Saved ✓" : "Save Profile"} />
          <ClearBtn onClick={() => setProfile(emptyProfile)} />
        </div>
      </Card>

      {/* Delivery Address card */}
      <Card icon={<PinIcon />} title="Delivery Address">
        {address ? (
          <div className="text-[13px] leading-relaxed mb-4">
            <p className="font-semibold text-[#1a2024]">{address.name}</p>
            <p className="text-[#535766]">{address.flat} {address.area}</p>
            <p className="text-[#535766]">{address.city}, {stateAbbr}, {address.pin}</p>
            <p className="text-[#7e808c]">Phone: +91 {address.number}</p>
          </div>
        ) : (
          <p className="text-[13px] text-[#9b9b9b] mb-4">No address saved yet. Fill it below or during checkout.</p>
        )}

        <Field label="Name"><input className={inp} value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} /></Field>
        <Field label="Phone"><input className={inp} inputMode="numeric" value={addr.number} onChange={(e) => setAddr({ ...addr, number: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></Field>
        <Field label="Flat/House No."><input className={inp} value={addr.flat} onChange={(e) => setAddr({ ...addr, flat: e.target.value })} /></Field>
        <Field label="Area/Street"><input className={inp} value={addr.area} onChange={(e) => setAddr({ ...addr, area: e.target.value })} /></Field>
        <Field label="City"><input className={inp} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} /></Field>
        <Field label="State">
          <div className="relative">
            <select className={`${inp} appearance-none`} value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })}>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <Chevron />
          </div>
        </Field>
        <Field label="PIN Code"><input className={inp} inputMode="numeric" value={addr.pin} onChange={(e) => setAddr({ ...addr, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} /></Field>

        <div className="flex gap-2 mt-1">
          <SaveBtn onClick={saveAddr} label={savedTag === "address" ? "Saved ✓" : "Save Address"} />
          <ClearBtn onClick={() => setAddr(emptyAddr)} />
        </div>
      </Card>

      {/* Preferences card */}
      <Card icon={<GearIcon />} title="Preferences">
        <Toggle
          title="WhatsApp Updates" sub="Get order and delivery alerts on WhatsApp."
          on={prefs.whatsapp} onChange={(v) => setPrefs({ ...prefs, whatsapp: v })} />
        <Toggle
          title="Promotional Emails" sub="Occasional offers and recommendations."
          on={prefs.promo} onChange={(v) => setPrefs({ ...prefs, promo: v })} />
        <div className="mt-1">
          <SaveBtn onClick={savePrefs} label={savedTag === "prefs" ? "Saved ✓" : "Save Preferences"} />
        </div>
      </Card>

      <p className="text-center text-[12px] text-[#9b9b9b] py-6">
        © {new Date().getFullYear()} <span style={{ color: "var(--brand)" }}>{brand.name}</span> • Account
      </p>
    </div>
  );
}

const inp = "w-full bg-[#f4f4f6] rounded-lg px-3.5 py-3.5 text-[14px] text-[#1a2024] outline-none placeholder:text-[#b6b6bf] focus:ring-1 focus:ring-[var(--brand)]";

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 mt-3">
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-5">
        <h2 className="flex items-center gap-2 font-bold text-[16px] text-[#1a2024] mb-4">{icon}{title}</h2>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[13px] text-[#535766] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
function SaveBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center gap-2 text-[14px] font-bold rounded-lg px-4 py-2.5 text-white" style={{ background: "var(--brand)" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v5h7M8 14h8v7H8z" /></svg>
      {label}
    </button>
  );
}
function ClearBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center gap-2 text-[14px] font-bold rounded-lg px-4 py-2.5 bg-[#f7ecf5]" style={{ color: "var(--brand)" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7l3-3 4 4-3 3z" /><path d="M7 8l9 9M20 20H8" strokeLinecap="round" /></svg>
      Clear
    </button>
  );
}
function Toggle({ title, sub, on, onChange }: { title: string; sub: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between border border-[#eee] rounded-xl px-3 py-3 mb-2.5">
      <div className="pr-3">
        <p className="text-[14px] font-bold text-[#1a2024]">{title}</p>
        <p className="text-[12px] text-[#9b9b9b]">{sub}</p>
      </div>
      <button
        onClick={() => onChange(!on)}
        aria-pressed={on}
        className="w-11 h-6 rounded-full relative shrink-0 transition-colors"
        style={{ background: on ? "var(--brand)" : "#e6d7e2" }}
      >
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: on ? "22px" : "2px" }} />
      </button>
    </div>
  );
}
function Chevron() {
  return <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>;
}
function IdIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M13 10h5M13 14h5" strokeLinecap="round" /></svg>; }
function PinIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>; }
function GearIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L16 3H8l-.8 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5L3.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1L8 21h8l.8-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z" strokeLinejoin="round" /></svg>; }
