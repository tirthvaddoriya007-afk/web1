import { getAllProducts } from "@/lib/catalog";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return <ProductsManager initial={products} />;
}
