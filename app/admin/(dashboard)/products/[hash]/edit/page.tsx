import { notFound } from "next/navigation";
import { getCategories, getProductByHash, getAllProducts } from "@/lib/catalog";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function EditProductPage({
  params,
}: {
  params: { hash: string };
}) {
  const product = await getProductByHash(params.hash);
  if (!product) notFound();

  const [cats, all] = await Promise.all([getCategories(), getAllProducts()]);
  const nextOrder = all.length
    ? Math.max(...all.map((p) => p.order_number ?? 0)) + 1
    : 1;

  return (
    <ProductForm
      product={product}
      categories={cats.map((c) => c.name)}
      nextOrder={nextOrder}
    />
  );
}
