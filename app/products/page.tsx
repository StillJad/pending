import Link from "next/link";
import { products } from "@/data/products";
import {
  BRAND_NAME,
  formatCurrency,
  getMonogram,
  parsePrice,
} from "@/lib/site";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type ProductWithAmount = (typeof products)[number] & {
  amount: number;
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

function buildStockLabel(id: number) {
  const states = [
    "in stock",
    "verified",
    "instant",
    "fast delivery",
    "private access",
  ];

  return states[id % states.length];
}

function getProductIcon(product: ProductWithAmount) {
  return "icon" in product && typeof product.icon === "string"
    ? product.icon
    : "";
}

function getProductBadge(product: ProductWithAmount) {
  return "badge" in product && typeof product.badge === "string"
    ? product.badge
    : "Live";
}

function getProductDuration(product: ProductWithAmount) {
  return "duration" in product && typeof product.duration === "string"
    ? product.duration
    : "Digital";
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();

  const catalog: ProductWithAmount[] = products.map((product) => ({
    ...product,
    amount: parsePrice(product.price),
  }));

  const filteredProducts = query
    ? catalog.filter((product) =>
        [
          product.name,
          product.category,
          product.description,
          getProductDuration(product),
          getProductBadge(product),
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
          {filteredProducts.map((product) => {
            const icon = getProductIcon(product);
            const badge = getProductBadge(product);
            const duration = getProductDuration(product);

            return (
              <Link
                key={product.id}
                href={`/checkout/${product.id}/${product.slug}`}
                className="pending-product-card block"
              >
                <div className="pending-product-media">
                  <span className="pending-stock-badge bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wider text-white/70 backdrop-blur">
                    {buildStockLabel(product.id)}
                  </span>

                  <div className="pending-product-box flex flex-col items-center justify-center text-center">
                    {icon ? (
                      <img
                        src={icon}
                        alt=""
                        className="mb-3 h-14 w-14 rounded-2xl object-contain"
                      />
                    ) : null}
                    <span className="text-xs uppercase tracking-[0.28em] text-white/42">
                      discord.gg/pending
                    </span>
                    <strong className="mt-2 text-3xl tracking-tight text-white">
                      {getMonogram(product.name)}
                    </strong>
                  </div>

                  <div className="pending-product-title">
                    {product.category}
                    <br />
                    {product.name.split(" ").slice(0, 2).join(" ")}
                  </div>
                </div>

                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="ui-overline">{product.category}</p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm text-white/45">{duration}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/62">
                      {badge}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/58">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                    <span className="text-xl font-semibold text-white">
                      {formatCurrency(product.amount)}
                    </span>
                    <span className="text-sm text-white/52">Open checkout</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
