import Link from "next/link";
import { BRAND_NAME, DISCORD_INVITE_URL } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          {BRAND_NAME}
        </h1>

        <p className="text-white/70 max-w-xl">
          Simple storefront for digital goods with fast Discord-based delivery.
        </p>

        <div className="flex gap-3">
          <Link
            href="/products"
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:opacity-90"
          >
            Browse
          </Link>

          <Link
            href="/ticket"
            className="px-4 py-2 rounded-lg border border-white/20 text-sm text-white/80 hover:text-white"
          >
            Support
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Link
          href="/products"
          className="border border-white/10 rounded-xl p-5 hover:border-white/30 transition"
        >
          <h2 className="text-lg font-medium text-white">Buy</h2>
          <p className="text-sm text-white/60 mt-2">
            Browse products and checkout fast.
          </p>
        </Link>

        <Link
          href="/ticket"
          className="border border-white/10 rounded-xl p-5 hover:border-white/30 transition"
        >
          <h2 className="text-lg font-medium text-white">Support</h2>
          <p className="text-sm text-white/60 mt-2">
            Open a ticket through Discord.
          </p>
        </Link>

        <Link
          href="/orders"
          className="border border-white/10 rounded-xl p-5 hover:border-white/30 transition"
        >
          <h2 className="text-lg font-medium text-white">Tracking</h2>
          <p className="text-sm text-white/60 mt-2">
            Check your order status.
          </p>
        </Link>
      </section>

      <section className="mt-12 text-sm text-white/60">
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white"
        >
          Join Discord
        </a>
      </section>
    </main>
  );
}
