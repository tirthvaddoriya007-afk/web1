import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

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

  return <AdminShell email={session.admin.email}>{children}</AdminShell>;
}
