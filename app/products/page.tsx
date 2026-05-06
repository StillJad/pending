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

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
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

  const visibleCategories = productCategories.filter(
    (category) => grouped[category]?.length
  );

  const totalProducts = filteredProducts.length;
  const cheapestProduct = filteredProducts
    .slice()
    .sort((left, right) => left.amount - right.amount)[0];

  return (
    <main className="page-transition space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[560px] -translate-x-1/2 rounded-full bg-white/[0.055] blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
              Storefront
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl">
              Product catalog
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/64">
              Pick a category, search if you need to, then open checkout.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {productCategories.map((category) => {
                const count = grouped[category]?.length ?? 0;

                return (
                  <a
                    key={category}
                    href={`#${category.toLowerCase().replaceAll(" ", "-")}`}
                    className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm font-semibold text-white/72 transition hover:border-white/20 hover:bg-white/[0.075] hover:text-white"
                  >
                    {category}
                    <span className="ml-2 text-white/38">{count}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
            <form action="/products">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white/72 transition focus-within:border-white/25 focus-within:text-white">
                <SearchIcon />
                <input
                  type="search"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Search the catalog"
                  aria-label="Search products"
                  className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/42"
                />
              </label>
            </form>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                  Items
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {totalProducts}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                  From
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  ${cheapestProduct?.amount.toFixed(2) ?? "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="rounded-[2rem] border border-white/10 bg-black/35 p-10 text-center backdrop-blur-xl">
          <p className="text-2xl font-semibold tracking-tight text-white">
            Nothing matched that search.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/62">
            Try a shorter keyword or clear the search.
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              Clear search
              <ArrowIcon />
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-14">
          {visibleCategories.map((category) => {
            const items = grouped[category];
            const cheapest = items[0];

            return (
              <section
                id={category.toLowerCase().replaceAll(" ", "-")}
                key={category}
                className="scroll-mt-32 space-y-6"
              >
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/42">
                      Category
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">
                      {category}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/55">
                    <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
                    <span className="h-1 w-1 rounded-full bg-white/25" />
                    <span>from ${cheapest.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
