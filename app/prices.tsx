export default function PricesPage() {
  const products = [
    { id: 1, name: "Spotify Premium", price: "$3.00", category: "Spotify" },
    { id: 2, name: "Discord Nitro", price: "$7.99", category: "Discord" },
    { id: 3, name: "Roblox Product", price: "$5.00", category: "Roblox" },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Prices</h1>
        <p className="mt-3 text-white/70">
          Browse current prices. Orders are handled through Discord.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-sm text-white/50">{product.category}</p>
              <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
              <p className="mt-4 text-2xl font-bold">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
