import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";
import {
  BRAND_NAME,
  parsePrice,
} from "@/lib/site";

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
          product.category,
          product.description,
          product.duration,
          product.tag,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : catalog;

  return (
    <main className="page-transition space-y-10">
      <section className="ui-panel relative overflow-hidden px-6 py-14 sm:px-10 sm:py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute left-16 top-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.10),transparent_68%)] blur-3xl" />
        <div className="absolute right-14 top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_68%)] blur-3xl" />

        <div className="relative z-10 text-center">
          <p className="ui-overline">Catalog</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.08em] text-white sm:text-6xl">
            The <span className="text-white">Goods</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/64">
            Digital products, clean delivery, and support through Discord.
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

      <section className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
        <div className="ui-panel p-5">
          <p className="ui-overline">Items</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {filteredProducts.length}
          </p>
        </div>
        <div className="ui-panel p-5">
          <p className="ui-overline">Categories</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {new Set(filteredProducts.map((product) => product.category)).size}
          </p>
        </div>
        <div className="ui-panel p-5">
          <p className="ui-overline">Brand</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {BRAND_NAME}
          </p>
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
        <section className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </main>
  );
}
