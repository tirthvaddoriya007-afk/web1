import { getCategories, getAllProducts } from "@/lib/catalog";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function NewProductPage() {
  const [cats, all] = await Promise.all([getCategories(), getAllProducts()]);
  const nextOrder = all.length
    ? Math.max(...all.map((p) => p.order_number ?? 0)) + 1
    : 1;

  return (
    <ProductForm
      product={null}
      categories={cats.map((c) => c.name)}
      nextOrder={nextOrder}
    />
  );
}
