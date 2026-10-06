"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeContent } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { uploadStoreImage } from "@/lib/supabase/storage";
import { invalidateAll } from "@/lib/admin/revalidate";
import Marquee from "@/components/Marquee";

/**
 * Home page content: the two top banners and the marquee promo line.
 * Saves straight to the settings row (RLS-gated); the storefront home reads
 * it fresh on every request, so edits go live instantly.
 */
export default function HomeContentForm({ initial }: { initial: HomeContent }) {
  const router = useRouter();
  const [form, setForm] = useState<HomeContent>(initial);
  const [uploading, setUploading] = useState<"b1" | "b2" | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved">("idle");
  const [error, setError] = useState("");

  const set = (k: Exclude<keyof HomeContent, "welcome_redirect_seconds">) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setStatus("idle");
    setError("");
  };

  const setRedirectSeconds = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(0, Math.floor(Number(e.target.value) || 0));
    setForm((f) => ({ ...f, welcome_redirect_seconds: v }));
    setStatus("idle");
    setError("");
  };

  async function uploadBanner(which: "b1" | "b2", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Banner is larger than 3 MB — please upload a smaller file.");
      return;
    }
    setUploading(which);
    setError("");
    try {
      const url = await uploadStoreImage(file, "banners");
      setForm((f) =>
        which === "b1" ? { ...f, banner1_url: url } : { ...f, banner2_url: url }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Check the storage bucket in Supabase.");
    } finally {
      setUploading(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const { error: updateError } = await createClient()
      .from("settings")
      .update({
        banner1_url: form.banner1_url.trim(),
        banner1_link: form.banner1_link.trim(),
        banner1_alt: form.banner1_alt.trim(),
        banner2_url: form.banner2_url.trim(),
        banner2_link: form.banner2_link.trim(),
        banner2_alt: form.banner2_alt.trim(),
        promo_text: form.promo_text.trim(),
        welcome_redirect_seconds: form.welcome_redirect_seconds,
      })
      .eq("id", 1);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStatus("saved");
    invalidateAll();
    router.refresh();
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";
  const labelCls = "block text-sm font-medium text-gray-800";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <BannerSection
        title="Banner 1 — top strip"
        hint="Shown at the very top of the home page. Recommended size 1200 × 120 px (wide strip)."
        url={form.banner1_url}
        link={form.banner1_link}
        alt={form.banner1_alt}
        uploading={uploading === "b1"}
        onUpload={(e) => uploadBanner("b1", e)}
        onUrl={set("banner1_url")}
        onLink={set("banner1_link")}
        onAlt={set("banner1_alt")}
        inputCls={inputCls}
        labelCls={labelCls}
      />

      <BannerSection
        title="Banner 2 — main hero"
        hint="The big hero banner below the strip. Recommended size 800 × 333 px."
        url={form.banner2_url}
        link={form.banner2_link}
        alt={form.banner2_alt}
        uploading={uploading === "b2"}
        onUpload={(e) => uploadBanner("b2", e)}
        onUrl={set("banner2_url")}
        onLink={set("banner2_link")}
        onAlt={set("banner2_alt")}
        inputCls={inputCls}
        labelCls={labelCls}
      />

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">Promo line (marquee)</h3>
        <p className="mt-1 text-xs text-gray-500">
          The scrolling purple strip under the hero banner.
        </p>
        <label className={`${labelCls} mt-4`}>
          Text
          <input
            value={form.promo_text}
            onChange={set("promo_text")}
            placeholder="Buy 2 Get 1 Free (Add 3 item to cart)"
            className={inputCls}
          />
        </label>
        <div className="mt-4 overflow-hidden rounded-lg">
          <Marquee text={form.promo_text || "Preview…"} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">Welcome page auto-redirect</h3>
        <p className="mt-1 text-xs text-gray-500">
          Seconds a visitor stays on the welcome landing before being sent to the
          home page automatically. Visitors can always tap anywhere on the page to
          go immediately. Set 0 to disable the timer.
        </p>
        <label className={`${labelCls} mt-4`}>
          Redirect after (seconds)
          <input
            type="number"
            min={0}
            step={1}
            value={form.welcome_redirect_seconds}
            onChange={setRedirectSeconds}
            className={inputCls}
          />
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--brand)" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && !error && (
          <span className="text-sm font-medium text-green-700">Saved — live on the store now.</span>
        )}
      </div>
    </form>
  );
}

function BannerSection(props: {
  title: string;
  hint: string;
  url: string;
  link: string;
  alt: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUrl: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLink: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAlt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputCls: string;
  labelCls: string;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">{props.title}</h3>
      <p className="mt-1 text-xs text-gray-500">{props.hint}</p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        {/* Preview */}
        <div className="w-full shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-[#fafafa] sm:w-72">
          {props.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={props.url} alt={props.alt || "Banner preview"} className="w-full object-contain" />
          ) : (
            <div className="flex aspect-[800/333] items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <label className="relative inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            {props.uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={props.uploading}
              onChange={props.onUpload}
            />
          </label>

          <label className={props.labelCls}>
            Image URL (or use upload)
            <input value={props.url} onChange={props.onUrl} placeholder="/banners/top.gif" className={props.inputCls} />
          </label>
          <label className={props.labelCls}>
            Link (where the banner opens)
            <input value={props.link} onChange={props.onLink} placeholder="/category/grocery" className={props.inputCls} />
          </label>
          <label className={props.labelCls}>
            Alt text
            <input value={props.alt} onChange={props.onAlt} placeholder="Sale is live" className={props.inputCls} />
          </label>
        </div>
      </div>
    </section>
  );
}
