import Link from "next/link";
import { products } from "../../../data/products";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const categoryName = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const categoryProducts = products.filter(
    (product) =>
      product.category.toLowerCase().replace(/\s+/g, "-") === category
  );

  if (categoryProducts.length === 0) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold">Category not found</h1>
          <p className="mt-3 text-white/70">
            No products were found for {categoryName}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">{categoryName}</h1>
        <p className="mt-3 text-white/70">
          Browse available products in this category.
        </p>

        <div className="mt-10 grid gap-4">
          {categoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/checkout/${product.id}/${product.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{product.name}</h2>
                  <p className="mt-2 text-white/70">{product.description}</p>
                </div>
                <p className="text-2xl font-bold">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
