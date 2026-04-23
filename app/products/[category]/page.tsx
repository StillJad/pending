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
      <main className="text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Category not found</h1>
          <p className="mt-4 text-white/60">
            No products were found for {categoryName}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">{categoryName}</h1>
        <p className="mt-4 text-white/60">
          Browse available products in this category.
        </p>

        <div className="mt-10 grid gap-4">
          {categoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/checkout/${product.id}/${product.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_30px_rgba(120,119,198,0.15)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold transition group-hover:text-purple-300">{product.name}</h2>
                  <p className="mt-2 text-white/60">{product.description}</p>
                </div>
                <p className="text-2xl font-bold text-purple-300">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
