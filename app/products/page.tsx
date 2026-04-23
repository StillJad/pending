import Link from "next/link";
import { products } from "@/data/products";
import {
  formatCurrency,
  getMonogram,
  parsePrice,
  toCategorySlug,
} from "@/lib/site";

export default function ProductsPage() {
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  ).map((category) => {
    const categoryProducts = products.filter(
      (product) => product.category === category
    );
    const prices = categoryProducts.map((product) => parsePrice(product.price));

    return {
      name: category,
      slug: toCategorySlug(category),
      count: categoryProducts.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">Products</h1>
        <p className="text-white/70 max-w-xl">
          Browse categories and view available products.
        </p>

        <div className="flex gap-4 text-sm text-white/60">
          <span>{categories.length} categories</span>
          <span>{products.length} products</span>
        </div>
      </section>

      {categories.length === 0 ? (
        <section className="text-center py-12">
          <p className="text-xl text-white">No categories available.</p>
          <p className="text-white/60 mt-2">Check back later.</p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              className="border border-white/10 rounded-xl p-5 hover:border-white/30 transition"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-sm text-white/70">
                  {getMonogram(category.name)}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">{category.name}</h2>
                  <p className="text-sm text-white/60">{category.count} items</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-white/60">
                {formatCurrency(category.minPrice)} – {formatCurrency(category.maxPrice)}
              </div>

              <div className="mt-4 text-sm text-white/70">
                View category
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
