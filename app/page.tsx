import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="py-16 text-center">
          <h2 className="text-5xl font-bold">Pending</h2>
          <p className="mt-4 text-lg text-white/70">
            Prices, tracking, and Discord-based ordering.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/products"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <p className="text-sm text-white/50">Browse</p>
            <h3 className="mt-2 text-2xl font-semibold">Prices</h3>
            <p className="mt-3 text-white/70">
              View current product prices and available categories.
            </p>
          </Link>

          <Link
            href="/ticket"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <p className="text-sm text-white/50">Start</p>
            <h3 className="mt-2 text-2xl font-semibold">Create Ticket</h3>
            <p className="mt-3 text-white/70">
              Open a Discord ticket to place an order with our sellers.
            </p>
          </Link>

          <Link
            href="/orders"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <p className="text-sm text-white/50">Track</p>
            <h3 className="mt-2 text-2xl font-semibold">Orders</h3>
            <p className="mt-3 text-white/70">
              Check previous orders and view current order statuses.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
