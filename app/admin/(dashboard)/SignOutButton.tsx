"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="w-full rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25"
    >
      Sign out
    </button>
  );
}
