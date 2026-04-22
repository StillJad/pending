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
    <main className="text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Buy
        </h1>
        <p className="mt-4 text-white/60">
          Browse categories to view products and services.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_30px_rgba(120,119,198,0.15)]"
            >
              <h2 className="text-2xl font-semibold transition group-hover:text-purple-300">
                {category.name}
              </h2>
              <p className="mt-3 text-white/60">
                {category.count} product{category.count === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
