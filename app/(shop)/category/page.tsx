import Link from "next/link";
import { getCategories, getCategorySamples } from "@/lib/catalog";
import SearchBar from "@/components/SearchBar";

export const metadata = { title: "Categories" };

// ISR: rendered once, served from the CDN for 60s. Admin edits go live
// instantly via /api/revalidate, with no cache or rebuild.
export const revalidate = 60;

export default async function CategoriesPage() {
  const [cats, samples] = await Promise.all([getCategories(), getCategorySamples()]);

  return (
    <div>
      <SearchBar />
      <h2 className="px-4 pt-4 pb-2 font-bold text-lg">Shop by Category</h2>
      <div className="grid grid-cols-3 gap-2 p-3">
        {cats.map((c) => {
          const sample = samples.find((p) => p.categories.includes(c.name));
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="flex flex-col items-center gap-2 p-2 rounded-lg border border-[#f0f0f0] no-underline text-inherit"
            >
              <div className="w-full aspect-square rounded-md bg-[#f7f7f9] overflow-hidden flex items-center justify-center">
                {sample && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sample.image} alt={c.name} className="w-full h-full object-contain" />
                )}
              </div>
              <span className="text-[11px] text-center leading-tight text-[#333]">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
