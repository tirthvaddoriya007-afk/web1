import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";
import SignOutButton from "./SignOutButton";

export const dynamic = "force-dynamic";
// The admin allowlist check must always hit Supabase fresh (no cached auth).
export const fetchCache = "force-no-store";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminUser();

  // Authenticated but not on the admins allowlist — treat as not an admin.
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-100">
      <header
        className="text-white"
        style={{ background: brand.colors.primaryDark }}
      >
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between">
          <span className="font-semibold">{brand.name} Admin</span>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/admin/analytics"
              className="opacity-80 hover:opacity-100 hover:underline"
            >
              Analytics
            </Link>
            <span className="opacity-80 hidden sm:inline">
              {session.admin.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
