import { notFound } from "next/navigation";
import ProductCardOffer from "@/components/ProductCardOffer";
import { getCategories, getProductsByCategory } from "@/lib/catalog";

// ISR: rendered once, served from the CDN for 1 hour. Category edits go live
// instantly via /api/revalidate.
export const revalidate = 3600;

// Category pages are pre-rendered at build time (both the slug and the
// legacy orig_slug variants) so crawlers hit static CDN files. New categories
// added later still work through on-demand ISR.
export async function generateStaticParams() {
  try {
    const cats = await getCategories();
    return cats.flatMap((c) => [
      { slug: c.slug },
      ...(c.origSlug && c.origSlug !== c.slug ? [{ slug: c.origSlug }] : []),
    ]);
  } catch {
    return [];
  }
}

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
