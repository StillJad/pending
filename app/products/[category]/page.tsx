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
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="space-y-4">
          <h1 className="text-3xl font-semibold text-white">Category not found</h1>
          <p className="text-white/70 max-w-xl">
            No products found for {categoryName}.
          </p>
          <div className="flex gap-3">
            <Link href="/products" className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">
              Back
            </Link>
            <Link href="/ticket" className="px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm">
              Support
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const prices = categoryProducts.map((product) => parsePrice(product.price));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="space-y-4">
        <Link
          href="/products"
          className="text-sm text-white/60 hover:text-white"
        >
          ← Back to products
        </Link>

        <h1 className="text-3xl font-semibold text-white">{categoryName}</h1>

        <p className="text-white/70 max-w-xl">
          Browse available products and choose what you need.
        </p>

        <div className="text-sm text-white/60">
          {categoryProducts.length} products
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {categoryProducts.map((product, index) => (
          <Link
            key={product.id}
            href={`/checkout/${product.id}/${product.slug}`}
            className="border border-white/10 rounded-xl p-5 hover:border-white/30 transition"
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-white">{product.name}</h2>
                  <p className="text-sm text-white/60 mt-1">
                    {product.description}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-white text-lg font-medium">
                    {formatCurrency(parsePrice(product.price))}
                  </p>
                </div>
              </div>

              <div className="text-sm text-white/70">
                View product
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
