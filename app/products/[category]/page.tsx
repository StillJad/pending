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
      <main className="page-shell">
        <section className="page-header">
          <span className="page-kicker">Missing category</span>
          <h1 className="section-title mt-6">Category not found.</h1>
          <p className="section-copy mt-4">
            No products were found for {categoryName}. Head back to the catalog
            to keep browsing active categories.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="button-base button-primary">
              Back to catalog
            </Link>
            <Link href="/ticket" className="button-base button-secondary">
              Contact support
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const prices = categoryProducts.map((product) => parsePrice(product.price));

  return (
    <main className="page-shell">
      <section className="page-header">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top,rgba(119,101,255,0.2),transparent_58%)]" />

        <Link
          href="/products"
          className="button-base button-ghost w-fit px-0 text-sm uppercase tracking-[0.22em] text-white/55 hover:text-white"
        >
          Back to all categories
        </Link>

        <span className="page-kicker mt-6">{categoryName}</span>
        <h1 className="section-title mt-6">{categoryName} collection</h1>
        <p className="section-copy mt-4">
          Review available products, compare descriptions, and move into
          checkout with a cleaner, more premium purchase flow.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="chip">
            <span className="font-display text-white">
              {categoryProducts.length.toString().padStart(2, "0")}
            </span>
            products live
          </div>
          <div className="chip">
            Starting from {formatCurrency(Math.min(...prices))}
          </div>
          <div className="chip">Discord fulfillment after cart review</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {categoryProducts.map((product, index) => (
          <Link
            key={product.id}
            href={`/checkout/${product.id}/${product.slug}`}
            className={`glass-card card-hover group p-6 reveal-up stagger-${
              (index % 4) + 1
            }`}
          >
            <div className="card-glow" />

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/40">
                    Product #{product.id}
                  </p>
                  <h2 className="font-display mt-4 text-3xl tracking-[-0.04em] text-white">
                    {product.name}
                  </h2>
                  <p className="mt-4 text-white/64">{product.description}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-left md:text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                    Price
                  </p>
                  <p className="font-display mt-2 text-3xl tracking-[-0.05em] text-white">
                    {formatCurrency(parsePrice(product.price))}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="chip-muted">Digital access</span>
                <span className="chip-muted">Cart-ready checkout</span>
                <span className="chip-muted">Discord handoff</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-5 text-sm text-white/58 transition group-hover:text-white/78">
                <span>Open product checkout</span>
                <span className="font-semibold">Review now</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
