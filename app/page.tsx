import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";
import { BRAND_NAME, DISCORD_INVITE_URL, parsePrice } from "@/lib/site";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

export default function Home() {
  // pick better featured products: top 3 by price (simple + not random)
  const featuredProducts = products.slice(0, 3);

  return (
    <main className="page-transition space-y-12 sm:space-y-16">
      {/* HERO */}
      <section className="ui-panel relative overflow-hidden px-6 py-16 sm:px-10 sm:py-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="pending-badge">
            <span className="pending-dot" />
            fast digital delivery
          </span>

          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.08em] text-white sm:text-6xl lg:text-7xl">
            Buy digital products
            <br />
            without getting scammed.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Real products, fast delivery, and support through Discord. No fake
            promises, no weird checkout flows.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/products" className="ui-button-primary">
              Browse products
              <ArrowIcon />
            </Link>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="ui-button-secondary"
            >
              Join Discord
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="grid gap-5 sm:grid-cols-3">
        {[
          ["1. Browse", "Pick what you want from the catalog"],
          ["2. Checkout", "Open checkout instantly on-site"],
          ["3. Delivery", "Get everything through Discord"],
        ].map(([title, desc]) => (
          <div
            key={title}
            className="ui-panel p-5 text-center"
          >
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm text-white/65">{desc}</p>
          </div>
        ))}
      </section>

      {/* FEATURED */}
      <section id="products" className="space-y-8">
        <div className="text-center">
          <p className="ui-overline ui-overline-accent">Catalog</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
            Featured products
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/68">
            The most popular stuff people actually buy.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              ctaLabel="View product"
            />
          ))}
        </div>
      </section>

      {/* CTA / DISCORD */}
      <section className="pending-cta grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span className="pending-badge">
            <span className="pending-dot" />
            discord delivery
          </span>

          <h2 className="mt-8 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
            Need help or delivery?
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-white/72">
            Everything continues in Discord. Faster support, easier delivery,
            no waiting.
          </p>

          <div className="mt-8">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="ui-button-primary min-w-[220px]"
            >
              Join Discord
            </a>
          </div>
        </div>

        <div className="ui-panel relative overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-white" />
              <span className="h-3 w-3 rounded-full bg-white/20" />
              <span className="h-3 w-3 rounded-full bg-white/20" />
            </div>
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/90">
              discord.gg/pending
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/server-icon.png"
                className="h-14 w-14 rounded-2xl object-cover"
                alt="server"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div>
                <p className="text-2xl font-semibold tracking-tight text-white">
                  {BRAND_NAME}
                </p>
                <p className="mt-1 text-sm text-white/68">
                  Orders, delivery, and support in one place
                </p>
              </div>
            </div>

            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Join
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">Order updates</p>
            <p className="mt-2 text-sm leading-6 text-white/66">
              Open a ticket for support, delivery progress, and anything that
              needs manual follow-up.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
