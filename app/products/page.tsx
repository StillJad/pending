import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { productCategories, products } from "@/lib/products";
import { parsePrice } from "@/lib/site";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();

  const catalog = products.map((product) => ({
    ...product,
    amount: parsePrice(product.price),
  }));

  const filteredProducts = query
    ? catalog.filter((product) =>
        [
          product.name,
          product.description,
          product.duration,
          product.badge,
          product.category,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : catalog;

  const grouped = productCategories.reduce<Record<string, typeof filteredProducts>>(
    (accumulator, category) => {
      accumulator[category] = filteredProducts
        .filter((product) => product.category === category)
        .sort((left, right) => left.amount - right.amount);
      return accumulator;
    },
    {}
  );

  return (
    <main className="page-transition space-y-10">
      <section className="ui-panel relative overflow-hidden px-6 py-14 sm:px-10 sm:py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative z-10 text-center">
          <p className="ui-overline">Catalog</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.08em] text-white sm:text-6xl">
            Catalog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/70">
            Pick a category, then choose the item you need.
          </p>

          <form action="/products" className="mx-auto mt-10 max-w-4xl">
            <label className="pending-search">
              <span className="pending-search-icon">
                <SearchIcon />
              </span>
              <input
                type="search"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search products"
                aria-label="Search products"
              />
            </label>
          </form>
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="ui-panel p-10 text-center">
          <p className="text-2xl font-semibold tracking-tight text-white">
            Nothing matched that search.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/62">
            Try a simpler keyword or clear the query to view the full catalog.
          </p>
          <div className="mt-6">
            <Link href="/products" className="ui-button-secondary">
              Clear search
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-12">
          {productCategories.map((category) => {
            const items = grouped[category];

            if (!items?.length) {
              return null;
            }

            return (
              <section key={category} className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <div className="flex items-end justify-between gap-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {category}
                    </h2>
                    <span className="text-sm text-white/58">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
