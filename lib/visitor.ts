"use client";

// Visitor identity for client-side analytics. The old API routes minted an
// httpOnly cookie server-side; the browser now stores the same UUID in
// localStorage — identical semantics (unique per browser), zero Vercel calls.
const KEY = "hs_vid";

export function getVisitorId(): string {
  let id = "";
  try {
    id = localStorage.getItem(KEY) ?? "";
  } catch {
    // localStorage unavailable (privacy mode) — analytics just won't group.
  }
  if (!id) {
    id = crypto.randomUUID();
    try {
      localStorage.setItem(KEY, id);
    } catch {
      // ignore
    }
  }
  return id;
}
