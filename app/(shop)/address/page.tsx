"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Address } from "@/lib/types";
import CheckoutSteps from "@/components/CheckoutSteps";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const empty: Address = { name: "", number: "", pin: "", city: "", flat: "", area: "", state: "Andhra Pradesh" };

type Errors = Partial<Record<keyof Address, string>>;

function validateField(k: keyof Address, v: string): string {
  const s = v.trim();
  switch (k) {
    case "name":
      if (!s) return "Full name is required.";
      if (s.length < 3) return "Name looks too short.";
      if (!/^[a-zA-Z][a-zA-Z\s.]*$/.test(s)) return "Use letters only.";
      return "";
    case "number":
      if (!s) return "Mobile number is required.";
      if (!/^[6-9]\d{9}$/.test(s)) return "Enter a valid 10-digit mobile number.";
      return "";
    case "pin":
      if (!s) return "Pincode is required.";
      if (!/^\d{6}$/.test(s)) return "Enter a valid 6-digit pincode.";
      return "";
    case "city":
      if (!s) return "City is required.";
      return "";
    case "flat":
      if (!s) return "This field is required.";
      return "";
    case "area":
      if (!s) return "This field is required.";
      return "";
    default:
      return "";
  }
}

export default function AddressPage() {
  const { address, saveAddress, items, ready } = useStore();
  const router = useRouter();
  const [form, setForm] = useState<Address>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Address, boolean>>>({});

  useEffect(() => {
    if (address) setForm({ ...empty, ...address });
  }, [address]);

  useEffect(() => {
    if (ready && items.length === 0) router.replace("/cart");
  }, [ready, items.length, router]);

  const update = (k: keyof Address, raw: string) => {
    // input hygiene
    let v = raw;
    if (k === "number") v = raw.replace(/\D/g, "").slice(0, 10);
    if (k === "pin") v = raw.replace(/\D/g, "").slice(0, 6);
    setForm((f) => ({ ...f, [k]: v }));
    if (touched[k]) setErrors((e) => ({ ...e, [k]: validateField(k, v) }));
  };

  const blur = (k: keyof Address) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((e) => ({ ...e, [k]: validateField(k, form[k] || "") }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const keys: (keyof Address)[] = ["name", "number", "pin", "city", "flat", "area"];
    const next: Errors = {};
    keys.forEach((k) => { const m = validateField(k, form[k] || ""); if (m) next[k] = m; });
    setErrors(next);
    setTouched(Object.fromEntries(keys.map((k) => [k, true])));
    if (Object.keys(next).length > 0) {
      // focus first invalid
      const first = keys.find((k) => next[k]);
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    saveAddress(form);
    router.push("/payment");
  };

  return (
    <div className="pb-24 bg-white min-h-screen">
      <CheckoutSteps active={2} />

      <form onSubmit={submit} noValidate className="px-4 pt-2">
        <h2 className="flex items-center gap-2 font-bold text-lg mb-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#5b6cf0">
            <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
          </svg>
          Address
        </h2>

        <Floating id="f-name" label="Full Name" value={form.name} error={errors.name}
          onChange={(v) => update("name", v)} onBlur={() => blur("name")} autoComplete="name" />
        <Floating id="f-number" label="Mobile number" value={form.number} error={errors.number}
          onChange={(v) => update("number", v)} onBlur={() => blur("number")} inputMode="numeric" autoComplete="tel" />
        <Floating id="f-pin" label="Pincode" value={form.pin} error={errors.pin}
          onChange={(v) => update("pin", v)} onBlur={() => blur("pin")} inputMode="numeric" autoComplete="postal-code" />

        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <Floating id="f-city" label="City" value={form.city} error={errors.city}
              onChange={(v) => update("city", v)} onBlur={() => blur("city")} autoComplete="address-level2" />
          </div>
          <div className="flex-1">
            <FloatingSelect label="State" value={form.state || ""} options={STATES}
              onChange={(v) => setForm((f) => ({ ...f, state: v }))} />
          </div>
        </div>

        <Floating id="f-flat" label="House No., Building Name" value={form.flat} error={errors.flat}
          onChange={(v) => update("flat", v)} onBlur={() => blur("flat")} autoComplete="address-line1" />
        <Floating id="f-area" label="Road name, Area, Colony" value={form.area} error={errors.area}
          onChange={(v) => update("area", v)} onBlur={() => blur("area")} autoComplete="address-line2" />

        <div className="action-bar">
          <button type="submit" className="btn-brand">Save Address and Continue</button>
        </div>
      </form>
    </div>
  );
}

/* ---- inputs ---- */
function fieldClass(error?: string) {
  return `w-full border rounded-lg px-3 py-3 text-[15px] font-bold text-[#212529] outline-none transition-colors ${
    error ? "border-[#e0402c] bg-[#fff5f4]" : "border-[#dcdce4] focus:border-[#5b6cf0] focus:bg-[#f2f4ff]"
  }`;
}

function Floating({
  id, label, value, onChange, onBlur, error, inputMode, autoComplete,
}: {
  id: string; label: string; value: string; error?: string;
  onChange: (v: string) => void; onBlur: () => void;
  inputMode?: "numeric"; autoComplete?: string;
  // Every field on this form uses the same floating-label treatment.
}) {
  return (
    <div className="mb-4">
      <label className="relative block">
        <span className={`absolute -top-2 left-3 px-1 bg-white text-[11px] ${error ? "text-[#e0402c]" : "text-[#7e808c]"}`}>{label}</span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={fieldClass(error)}
        />
      </label>
      {error && <p className="text-[#e0402c] text-[11px] mt-1 ml-1">{error}</p>}
    </div>
  );
}

function FloatingSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="relative block mb-4">
      <span className="absolute -top-2 left-3 px-1 bg-white text-[11px] text-[#7e808c] z-10">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#dcdce4] rounded-lg px-3 py-3 text-[15px] font-bold text-[#212529] outline-none focus:border-[#5b6cf0] appearance-none bg-white"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
    </label>
  );
}
