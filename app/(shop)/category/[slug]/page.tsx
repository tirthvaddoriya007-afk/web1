import { notFound } from "next/navigation";
import ProductCardOffer from "@/components/ProductCardOffer";
import { getCategories, getProductsByCategory } from "@/lib/catalog";

// Live catalogue — served through the 10s SWR cache; category edits go live
// instantly via /api/revalidate.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === params.slug || c.origSlug === params.slug);
  return { title: cat ? cat.name : "Category" };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === params.slug || c.origSlug === params.slug);
  if (!cat) notFound();
  const list = await getProductsByCategory(cat.name);

  return (
    <div>
      <div className="px-4 pt-4 pb-1">
        <h2 className="font-bold text-lg">{cat.name}</h2>
        <p className="text-xs text-gray-500">{list.length} products</p>
      </div>
      <div className="product-grid">
        {list.map((p) => (
          <ProductCardOffer key={p.hash} product={p} />
        ))}
      </div>
    </div>
  );
}
