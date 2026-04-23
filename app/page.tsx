import Link from "next/link";
import { BRAND_NAME, DISCORD_INVITE_URL } from "@/lib/site";

const routes = [
  {
    href: "/products",
    title: "Buy",
    copy: "Browse. Select. Done.",
  },
  {
    href: "/ticket",
    title: "Support",
    copy: "Need help? Use Discord.",
  },
  {
    href: "/orders",
    title: "Tracking",
    copy: "Track your order.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <section className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
          Store
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-[2.75rem]">
          {BRAND_NAME}
        </h1>
        <p className="mt-4 max-w-xl text-sm text-white/70">
          Digital goods. Clear pricing. Discord handoff.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
          >
            Browse
          </Link>

          <Link
            href="/ticket"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-[#8b5cf6]/50 hover:text-white"
          >
            Need help?
          </Link>
        </div>

        <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-white/40">
          orders finish in discord
        </p>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="rounded-xl border border-white/10 bg-transparent p-5 transition hover:border-[#8b5cf6]/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.12)]"
          >
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
              Route
            </p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
              {route.title}
            </h2>
            <p className="mt-2 text-sm text-white/70">{route.copy}</p>
          </Link>
        ))}
      </section>

      <div className="mt-10 text-sm text-white/50">
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="transition hover:text-white"
        >
          Join Discord
        </a>
      </div>
    </main>
  );
}
