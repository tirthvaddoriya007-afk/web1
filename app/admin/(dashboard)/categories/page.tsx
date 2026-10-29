import { getCategories, getAllProducts } from "@/lib/catalog";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";
// Never cache — edits must show up immediately after save.
export const fetchCache = "force-no-store";

export default async function AdminCategoriesPage() {
  const [cats, products] = await Promise.all([getCategories(), getAllProducts()]);

  const counts: Record<string, number> = {};
  for (const p of products) {
    if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
  }

  return <CategoriesManager initial={cats} counts={counts} />;
}
