"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { invalidateAll } from "@/lib/admin/revalidate";

/**
 * Shared reviews — every product page shows these same reviews, each rendered
 * with that product's own image. Add / edit / delete here; changes go live
 * across all product pages instantly (no-store reads on the storefront).
 */
export default function ReviewsManager({ initial }: { initial: Review[] }) {
  const router = useRouter();
  const [list, setList] = useState<Review[]>(initial);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Add form
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setList(initial), [initial]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError("Name and review text are required.");
      return;
    }
    setBusy(true);
    setError("");
    const { error: insertError } = await createClient().from("reviews").insert({
      name: name.trim(),
      rating: parseInt(rating, 10),
      comment: comment.trim(),
    });
    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    invalidateAll();
    setName("");
    setComment("");
    setRating("5");
    router.refresh();
  }

  async function saveEdit(r: Review) {
    setBusy(true);
    setError("");
    const { error: updateError } = await createClient()
      .from("reviews")
      .update({ name: r.name.trim(), rating: r.rating, comment: r.comment.trim() })
      .eq("id", r.id);
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    invalidateAll();
    setEditingId(null);
    router.refresh();
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this review? It disappears from every product page.")) return;
    setBusy(true);
    setError("");
    const { error: delError } = await createClient().from("reviews").delete().eq("id", id);
    setBusy(false);
    if (delError) {
      setError(delError.message);
      return;
    }
    invalidateAll();
    setList((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

  return (
    <div className="space-y-6">
      {/* Add form */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">Add review</h3>
        <p className="mt-1 text-xs text-gray-500">
          Shown on every product page with each product&apos;s own image.
        </p>
        <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_96px_1fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={inputCls} />
          <select value={rating} onChange={(e) => setRating(e.target.value)} className={inputCls}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Review text" className={inputCls} />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--brand)" }}
          >
            Add
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      {/* List */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{list.length}</span> reviews
          </p>
        </div>
        <ul className="divide-y divide-gray-50">
          {list.map((r) => (
            <li key={r.id} className="px-5 py-4">
              {editingId === r.id ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_96px_1fr_auto]">
                  <input
                    value={r.name}
                    onChange={(e) =>
                      setList((prev) => prev.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))
                    }
                    className={inputCls}
                  />
                  <select
                    value={r.rating}
                    onChange={(e) =>
                      setList((prev) =>
                        prev.map((x) => (x.id === r.id ? { ...x, rating: parseInt(e.target.value, 10) } : x))
                      )
                    }
                    className={inputCls}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                  <input
                    value={r.comment}
                    onChange={(e) =>
                      setList((prev) => prev.map((x) => (x.id === r.id ? { ...x, comment: e.target.value } : x)))
                    }
                    className={inputCls}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(r)}
                      disabled={busy}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: "var(--brand)" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                      <span className="rounded bg-green-700 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {r.rating} ★
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{r.comment}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setEditingId(r.id)}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      disabled={busy}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {list.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-gray-400">
              No reviews yet — product pages will fall back to default reviews.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
