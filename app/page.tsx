import Link from "next/link";

export default function Home() {
  return (
    <main className="text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="py-20 text-center">
          <h1 className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            /Pending
          </h1>
          <p className="mt-6 text-lg text-white/70 md:text-xl">
            Digital Goods. Instant Delivery.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Link
            href="/products"
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_30px_rgba(120,119,198,0.15)]"
          >
            <p className="text-sm text-white/50">Browse</p>
            <h3 className="mt-2 text-2xl font-semibold transition group-hover:text-purple-300">Buy</h3>
            <p className="mt-3 text-white/70">
              Browse available products and current pricing.
            </p>
          </Link>

          <Link
            href="/ticket"
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_30px_rgba(120,119,198,0.15)]"
          >
            <p className="text-sm text-white/50">Start</p>
            <h3 className="mt-2 text-2xl font-semibold transition group-hover:text-purple-300">Support</h3>
            <p className="mt-3 text-white/70">
              Open a Discord ticket to place an order.
            </p>
          </Link>

          <Link
            href="/orders"
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_30px_rgba(120,119,198,0.15)]"
          >
            <p className="text-sm text-white/50">Track</p>
            <h3 className="mt-2 text-2xl font-semibold transition group-hover:text-purple-300">Tracking</h3>
            <p className="mt-3 text-white/70">
              View your orders and check their status.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
          </Link>

          <Link
            href="/orders"
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_30px_rgba(120,119,198,0.15)]"
          >
            <p className="text-sm text-white/50">Track</p>
            <h3 className="mt-2 text-2xl font-semibold transition group-hover:text-purple-300">Tracking</h3>
            <p className="mt-3 text-white/70">
              View your orders and check their status.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
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
