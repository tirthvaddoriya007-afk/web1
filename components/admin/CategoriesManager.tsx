"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { invalidateAll } from "@/lib/admin/revalidate";

function slugify(v: string): string {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Storefront category list — add / edit / delete. The storefront reads the
 * categories table with no-store, so changes go live instantly. Products keep
 * their own `category` name, so deleting a category never deletes products.
 */
export default function CategoriesManager({
  initial,
  counts,
}: {
  initial: Category[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [list, setList] = useState<Category[]>(initial);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Add form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setList(initial), [initial]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const s = slugify(slug);
    if (!name.trim()) return setError("Category name is required.");
    if (!s) return setError("Slug is required — letters, numbers and dashes only.");
    if (list.some((c) => c.slug === s)) return setError("That slug already exists.");
    setBusy(true);
    setError("");
    const { error: insertError } = await createClient().from("categories").insert({
      name: name.trim(),
      slug: s,
      orig_slug: "",
    });
    setBusy(false);
    if (insertError) return setError(insertError.message);
    invalidateAll();
    setName("");
    setSlug("");
    router.refresh();
  }

  async function saveEdit(c: Category) {
    const s = slugify(c.slug);
    if (!c.name.trim()) return setError("Category name is required.");
    if (!s) return setError("Slug is required — letters, numbers and dashes only.");
    if (list.some((x) => x.id !== c.id && x.slug === s))
      return setError("That slug already exists.");
    setBusy(true);
    setError("");
    const { error: updateError } = await createClient()
      .from("categories")
      .update({ name: c.name.trim(), slug: s })
      .eq("id", c.id);
    setBusy(false);
    if (updateError) return setError(updateError.message);
    invalidateAll();
    setEditingId(null);
    router.refresh();
  }

  async function remove(c: Category) {
    const n = counts[c.name] ?? 0;
    const msg =
      n > 0
        ? `Delete "${c.name}"? ${n} products use this category — they stay in the catalogue, but the category page and grid tile will disappear.`
        : `Delete "${c.name}"? Its grid tile and page will disappear from the storefront.`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    setError("");
    // Rows loaded from the static fallback have no id (the live table was
    // empty), and `eq("id", undefined)` makes PostgREST fail with a
    // "failed to parse undefined" syntax error. Delete by id when present,
    // otherwise by slug — both are unique.
    let query = createClient().from("categories").delete();
    query = c.id != null ? query.eq("id", c.id) : query.eq("slug", c.slug);
    const { error: delError } = await query;
    setBusy(false);
    if (delError) return setError(`Could not delete "${c.name}": ${delError.message}`);
    invalidateAll();
    setList((prev) => prev.filter((x) => (x.id ?? x.slug) !== (c.id ?? c.slug)));
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

  return (
    <div className="space-y-6">
      {/* Add form */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">Add category</h3>
        <p className="mt-1 text-xs text-gray-500">
          Shows up on the &quot;Shop by Category&quot; grid. Products are linked
          to a category by its name in the product form.
        </p>
        <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name, e.g. Kids Fashion"
            className={inputCls}
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug, e.g. kids-fashion"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--brand)" }}
          >
            Add
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-400">
          The slug becomes the page address: /category/kids-fashion
        </p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      {/* List */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{list.length}</span> categories
          </p>
        </div>
        <ul className="divide-y divide-gray-50">
          {list.map((c) => (
            <li key={c.id ?? c.slug} className="px-5 py-4">
              {editingId === c.id ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={c.name}
                    onChange={(e) =>
                      setList((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))
                    }
                    className={inputCls}
                  />
                  <input
                    value={c.slug}
                    onChange={(e) =>
                      setList((prev) => prev.map((x) => (x.id === c.id ? { ...x, slug: e.target.value } : x)))
                    }
                    className={inputCls}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(c)}
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
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                      <span className="truncate rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">
                        /category/{c.slug}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {(counts[c.name] ?? 0) > 0
                        ? `${counts[c.name]} products`
                        : "No products yet"}
                      {c.origSlug && c.origSlug !== c.slug
                        ? ` · old link /category/${c.origSlug} still works`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setEditingId(c.id ?? null)}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(c)}
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
              No categories yet — run migration 005 to seed the current list.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
