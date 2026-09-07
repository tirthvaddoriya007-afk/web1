import { notFound } from "next/navigation";
import ProductCardOffer from "@/components/ProductCardOffer";
import { categories, getCategoryBySlug, getProductsByCategory } from "@/lib/data";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const cat = getCategoryBySlug(params.slug);
  return { title: cat ? cat.name : "Category" };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) notFound();
  const list = getProductsByCategory(cat.name);

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
