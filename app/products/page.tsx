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
    <main className="space-y-8">
      <section className="grid gap-8 border-b border-white/5 pb-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="max-w-2xl">
          <p className="ui-overline ui-overline-accent">Catalog</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
            Browse categories
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Pick a group. Then open the item list.
          </p>
        </div>

        <aside className="ui-panel p-5">
          <p className="ui-overline">Index</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="ui-overline">Groups</span>
              <span className="font-mono text-xl text-white/90">
                {categories.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Products</span>
              <span className="font-mono text-xl text-white/90">
                {products.length.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </aside>
      </section>

      {categories.length === 0 ? (
        <section className="ui-panel p-10 text-center">
          <p className="text-xl font-semibold tracking-tight text-white">
            Nothing live right now.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/65">
            Categories will appear here once products are added.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              className="ui-panel ui-panel-hover block p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 font-mono text-sm uppercase text-[#8b5cf6]">
                    {getMonogram(category.name)}
                  </div>
                  <div>
                    <p className="ui-overline">Category</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                      {category.name}
                    </h2>
                  </div>
                </div>

                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {category.count} items
                </span>
              </div>

              <div className="mt-8 grid gap-4 border-t border-white/5 pt-4 sm:grid-cols-2">
                <div>
                  <p className="ui-overline">Start</p>
                  <p className="mt-2 font-mono text-2xl text-[#8b5cf6]">
                    {formatCurrency(category.minPrice)}
                  </p>
                </div>

                <div>
                  <p className="ui-overline">Range</p>
                  <p className="mt-2 font-mono text-sm text-white/85">
                    {formatCurrency(category.minPrice)} -{" "}
                    {formatCurrency(category.maxPrice)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="ui-overline">Open category</span>
                <span className="text-sm text-white/65">View</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
