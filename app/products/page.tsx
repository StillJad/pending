import Link from "next/link";
import { products } from "../../data/products";

export default function ProductsPage() {
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  ).map((category) => {
    const slug = category.toLowerCase().replace(/\s+/g, "-");
    const count = products.filter((product) => product.category === category).length;

    return {
      name: category,
      slug,
      count,
    };
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Products</h1>
        <p className="mt-3 text-white/70">
          Browse categories to view products and services.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <h2 className="text-2xl font-semibold">{category.name}</h2>
              <p className="mt-3 text-white/70">
                {category.count} product{category.count === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
