import Link from "next/link";
import { BRAND_NAME, DISCORD_INVITE_URL } from "@/lib/site";

const routes = [
  {
    href: "/products",
    title: "Buy",
    copy: "Browse products and current pricing.",
  },
  {
    href: "/ticket",
    title: "Support",
    copy: "Open a ticket through Discord.",
  },
  {
    href: "/orders",
    title: "Tracking",
    copy: "Check your order status.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
      <section className="max-w-2xl">
        <p className="text-sm font-medium text-[#8b5cf6]">Digital storefront</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {BRAND_NAME}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/70">
          Digital goods, clear pricing, and Discord-based delivery.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
          >
            Browse
          </Link>

          <Link
            href="/ticket"
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-[#8b5cf6]/40 hover:text-white"
          >
            Support
          </Link>
        </div>

        <p className="mt-4 text-sm text-white/50">
          Orders and support are handled through Discord.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#8b5cf6]/50 hover:bg-white/[0.03] hover:shadow-[0_0_18px_rgba(139,92,246,0.12)]"
          >
            <h2 className="text-lg font-medium text-white transition group-hover:text-[#8b5cf6]">
              {route.title}
            </h2>
            <p className="mt-2 text-sm text-white/60">{route.copy}</p>
            <p className="mt-6 text-sm text-[#8b5cf6]">Open</p>
          </Link>
        ))}
      </section>

      <div className="mt-8 text-sm text-white/50">
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-white/60 transition hover:text-[#8b5cf6]"
        >
          Join the Discord server
        </a>
      </div>
    </main>
  );
}
