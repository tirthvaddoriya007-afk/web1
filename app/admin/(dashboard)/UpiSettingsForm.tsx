"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { brand } from "@/lib/brand";

export interface UpiSettings {
  upi_vpa: string;
  upi_payee_name: string;
  upi_merchant_code: string;
  meta_pixel_id: string;
}

// A UPI ID / VPA looks like `name@bank`: no spaces, exactly one "@".
const VPA_RE = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
// Meta Pixel IDs are numeric, e.g. 4872181146361011.
const PIXEL_RE = /^\d{8,20}$/;

export default function UpiSettingsForm({ initial }: { initial: UpiSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<UpiSettings>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof UpiSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setStatus("idle");
    setError("");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vpa = form.upi_vpa.trim();
    const pixelId = form.meta_pixel_id.trim();

    if (!VPA_RE.test(vpa)) {
      setError("Enter a valid UPI ID, e.g. yourname@okhdfcbank");
      return;
    }
    if (pixelId && !PIXEL_RE.test(pixelId)) {
      setError("Meta Pixel ID must be numeric, e.g. 4872181146361011");
      return;
    }

    setStatus("saving");
    const { error: updateError } = await createClient()
      .from("settings")
      .update({
        upi_vpa: vpa,
        upi_payee_name: form.upi_payee_name.trim(),
        upi_merchant_code: form.upi_merchant_code.trim(),
        meta_pixel_id: pixelId,
      })
      .eq("id", 1);

    if (updateError) {
      setError(updateError.message);
      setStatus("idle");
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
      <Field
        label="UPI ID (VPA)"
        value={form.upi_vpa}
        onChange={set("upi_vpa")}
        placeholder="yourname@okhdfcbank"
        required
        hint="Money for every online order goes to this UPI ID."
      />
      <Field
        label="Payee name"
        value={form.upi_payee_name}
        onChange={set("upi_payee_name")}
        placeholder={brand.name}
        hint="Shown inside the customer's UPI app. Keep it short."
      />
      <Field
        label="Merchant code (optional)"
        value={form.upi_merchant_code}
        onChange={set("upi_merchant_code")}
        placeholder=""
        hint="Leave blank for a personal UPI ID."
      />
      <Field
        label="Meta Pixel ID (optional)"
        value={form.meta_pixel_id}
        onChange={set("meta_pixel_id")}
        placeholder="4872181146361011"
        hint="Tracks PageView / InitiateCheckout / Purchase events. Leave blank to disable the pixel."
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {status === "saved" && !error && (
        <p className="text-sm text-green-700">Saved.</p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-60"
        style={{ background: brand.colors.primary }}
      >
        {status === "saving" ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <input
        type="text"
        {...props}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
      />
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
