import Link from "next/link";
import { categories, getProductsByCategory } from "@/lib/data";
import SearchBar from "@/components/SearchBar";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div>
      <SearchBar />
      <h2 className="px-4 pt-4 pb-2 font-bold text-lg">Shop by Category</h2>
      <div className="grid grid-cols-3 gap-2 p-3">
        {categories.map((c) => {
          const sample = getProductsByCategory(c.name)[0];
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
