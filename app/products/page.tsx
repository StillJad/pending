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
    <main className="page-shell">
      <section className="page-header">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top,rgba(79,174,255,0.18),transparent_54%)]" />

        <span className="page-kicker">
          <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.9)]" />
          Product catalog
        </span>

        <h1 className="section-title mt-6">
          Premium categories, organized for fast browsing.
        </h1>
        <p className="section-copy mt-4">
          Explore available collections, compare current pricing, and move into
          a polished cart-first checkout flow.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="chip">
            <span className="font-display text-white">
              {categories.length.toString().padStart(2, "0")}
            </span>
            categories
          </div>
          <div className="chip">
            <span className="font-display text-white">
              {products.length.toString().padStart(2, "0")}
            </span>
            total products
          </div>
          <div className="chip">Discord fulfillment after checkout</div>
        </div>
      </section>

      {categories.length === 0 ? (
        <section className="glass-panel p-8 text-center">
          <p className="font-display text-2xl tracking-[-0.04em] text-white">
            No categories are live right now.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Product groups will appear here once inventory is added.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              className={`glass-card card-hover group p-6 reveal-up stagger-${
                (index % 4) + 1
              }`}
            >
              <div className="card-glow" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] font-display text-sm tracking-[0.34em] text-white/78">
                    {getMonogram(category.name)}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                      Category
                    </p>
                    <h2 className="font-display mt-2 text-2xl tracking-[-0.04em] text-white">
                      {category.name}
                    </h2>
                  </div>
                </div>

                <div className="chip-muted">{category.count} items</div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                    Starts at
                  </p>
                  <p className="font-display mt-2 text-2xl tracking-[-0.04em] text-white">
                    {formatCurrency(category.minPrice)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                    Range
                  </p>
                  <p className="mt-2 text-sm text-white/68">
                    Up to {formatCurrency(category.maxPrice)}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-sm text-white/60 transition group-hover:text-white/82">
                <span>Open category</span>
                <span className="font-semibold">Browse</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
