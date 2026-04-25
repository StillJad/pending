import Link from "next/link";
import { products } from "@/data/products";
import { formatCurrency, parsePrice, toCategorySlug } from "@/lib/site";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const categoryProducts = products.filter(
    (product) => toCategorySlug(product.category) === category
  );

  const categoryName =
    categoryProducts[0]?.category ??
    category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  if (categoryProducts.length === 0) {
    return (
      <main className="space-y-6">
        <section className="ui-panel p-8 sm:p-10">
          <Link
            href="/products"
            className="ui-overline transition hover:text-white"
          >
            Back to categories
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
            Category not found
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/70">
            No products were found for {categoryName}. Go back and try another
            category.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="ui-button-primary">
              Back to catalog
            </Link>
            <Link href="/ticket" className="ui-button-secondary">
              Open support
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const prices = categoryProducts.map((product) => parsePrice(product.price));

  return (
    <main className="space-y-8">
      <section className="grid gap-8 border-b border-white/5 pb-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="max-w-2xl">
          <Link
            href="/products"
            className="ui-overline transition hover:text-white"
          >
            Back to categories
          </Link>
          <p className="ui-overline ui-overline-accent mt-6">{categoryName}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
            {categoryName}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Open a product. Move straight to checkout.
          </p>
        </div>

        <aside className="ui-panel p-5">
          <p className="ui-overline">Index</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="ui-overline">Products</span>
              <span className="font-mono text-xl text-white/90">
                {categoryProducts.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Start</span>
              <span className="font-mono text-base text-white/80">
                {formatCurrency(Math.min(...prices))}
              </span>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4">
        {categoryProducts.map((product) => (
          <Link
            key={product.id}
            href={`/checkout/${product.id}/${product.slug}`}
            className="ui-panel ui-panel-hover block p-6"
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
              <div>
                <p className="ui-overline">#{product.id}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {product.name}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                  {product.description}
                </p>
              </div>

              <div className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <p className="ui-overline">Price</p>
                <p className="mt-2 font-mono text-3xl text-white">
                  {formatCurrency(parsePrice(product.price))}
                </p>

                <div className="mt-8 border-t border-white/5 pt-4">
                  <p className="ui-overline">Action</p>
                  <p className="mt-2 text-sm text-white/65">Open checkout</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
