import Link from "next/link";
import { products } from "@/data/products";
import {
  BRAND_NAME,
  DISCORD_INVITE_URL,
  formatCurrency,
  getMonogram,
  parsePrice,
} from "@/lib/site";

const heroPills = [
  "High Quality",
  "Fast Support",
  "Verified Products",
  "Secure Orders",
] as const;

const reviews = [
  {
    quote: "Orders are clean, support replies fast, and the whole flow feels intentional.",
    name: "Tenman",
  },
  {
    quote: "Pending feels tighter than most Discord-first stores. Less friction, better follow-through.",
    name: "_mandate",
  },
  {
    quote: "Good catalog, good delivery",
    name: "Relits",
  },
] as const;

const comparisonStrengths = [
  "Fast Discord support",
  "Clean order tracking",
  "Verified products",
  "Secure checkout",
  "Ticket support",
  "Lifetime-style access where applicable",
] as const;

const comparisonWeaknesses = [
  "Slow support",
  "Messy delivery",
  "Unclear status",
  "dumbass owners",
  "Random product quality",
  "Basic security",
] as const;

const faqs = [
  {
    title: "How long do orders take?",
    answer:
      "Most orders are processed quickly after checkout. If anything needs manual handling, the Discord ticket flow keeps you updated without guesswork.",
  },
  {
    title: "How can I get support?",
    answer:
      "Support runs through Discord. Open a ticket, drop the order details, and staff will continue the handoff there.",
  },
  {
    title: "What payment methods do you accept?",
    answer:
      "Available payment options appear during checkout and order handling. If you need a specific method, ask inside Discord before placing the order.",
  },
  {
    title: "How do I track my order?",
    answer:
      "You can review saved orders on-site and continue the actual delivery and support thread inside Discord for the clearest status updates.",
  },
] as const;

const stats = [
  { label: "Members", value: "12.5K" },
  { label: "Tickets solved", value: "23.5K" },
  { label: "Avg response", value: "1.3m" },
] as const;

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

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

function buildStockLabel(id: number) {
  const count = (id % 4) + 2;
  return `${count} products`;
}

export default function Home() {
  const featuredProducts = products.slice(0, 3).map((product) => ({
    ...product,
    amount: parsePrice(product.price),
  }));

  return (
    <main className="page-transition space-y-10 sm:space-y-14">
      <section className="hero-shimmer pending-grid-glow ui-panel soft-float relative overflow-hidden px-6 py-16 sm:px-10 sm:py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_68%)] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="pending-badge">
            <span className="pending-dot" />
            Premium Digital Products
          </span>

          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.08em] text-white sm:text-6xl lg:text-7xl">
            Experience Quality with{" "}
            <span className="text-white">{BRAND_NAME}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
            Digital goods, Discord support, fast delivery, and clean order
            tracking.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {heroPills.map((pill) => (
              <span key={pill} className="pending-pill">
                <span className="pending-dot" />
                {pill}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="ui-button-primary"
            >
              Join Discord
              <ArrowIcon />
            </a>
            <Link href="/products" className="ui-button-secondary">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      <section id="products" className="space-y-8">
        <div className="text-center">
          <p className="ui-overline ui-overline-accent">Catalog</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
            The Goods
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/62">
            Digital products that actually matter.
          </p>
        </div>

        <form action="/products" className="mx-auto max-w-4xl">
          <label className="pending-search">
            <span className="pending-search-icon">
              <SearchIcon />
            </span>
            <input
              type="search"
              name="q"
              placeholder="Search products"
              aria-label="Search products"
            />
          </label>
        </form>

        <div className="grid gap-5 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/checkout/${product.id}/${product.slug}`}
              className="pending-product-card block"
            >
              <div className="pending-product-media">
                <span className="pending-stock-badge">{buildStockLabel(product.id)}</span>

                <div className="pending-product-box">
                  <span className="pending-product-mark">{BRAND_NAME}</span>
                  <strong>{getMonogram(product.name)}</strong>
                </div>

                <div className="pending-product-title">
                  {product.category}
                  <br />
                  {product.name.split(" ").slice(0, 2).join(" ")}
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="ui-overline">{product.category}</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      {product.name}
                    </h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/65">
                    Verified
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/58">
                  {product.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                  <span className="text-xl font-semibold text-white">
                    {formatCurrency(product.amount)}
                  </span>
                  <span className="text-sm text-white/52">View product</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="reviews" className="grid gap-4 md:grid-cols-3">
        {reviews.map((review, index) => (
          <article key={review.name} className="ui-panel p-6">
            <div className="flex items-center justify-between">
              <span className="ui-overline">0{index + 1}</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/62">
                trusted
              </span>
            </div>
            <p className="mt-8 text-lg leading-8 text-white/86">
              “{review.quote}”
            </p>
            <p className="mt-8 text-sm font-medium text-white/54">
              {review.name}
            </p>
          </article>
        ))}
      </section>

      <section id="comparison" className="space-y-8">
        <div className="text-center">
          <p className="ui-overline ui-overline-accent">Comparison</p>
          <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
            Tired of compromising on quality?
          </h2>
        </div>

        <div className="ui-panel relative overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="pending-comparison-glow border-b border-white/8 p-7 lg:border-b-0 lg:border-r">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    {BRAND_NAME}
                  </p>
                  <p className="mt-2 text-sm text-white/56">score 10/10</p>
                </div>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                  premium
                </span>
              </div>

              <div className="mt-8 space-y-3">
                {comparisonStrengths.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                      +
                    </span>
                    <span className="text-sm text-white/86">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pending-muted-panel p-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    Other stores
                  </p>
                  <p className="mt-2 text-sm text-white/56">score 6/10</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm font-semibold text-white/62">
                  mixed
                </span>
              </div>

              <div className="mt-8 space-y-3">
                {comparisonWeaknesses.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-sm font-semibold text-white/62">
                      -
                    </span>
                    <span className="text-sm text-white/62">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black text-2xl font-semibold text-white shadow-[0_0_36px_rgba(255,255,255,0.08)] lg:flex">
            VS
          </div>
        </div>
      </section>

      <section id="faq" className="space-y-6">
        <div className="text-center">
          <p className="ui-overline ui-overline-accent">FAQ</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
            Quick Answers
          </h2>
        </div>

        <div className="mx-auto max-w-5xl space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={faq.title}
              className="pending-accordion group"
              open={index === 0}
            >
              <summary className="flex cursor-pointer items-center gap-5 px-5 py-5 sm:px-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base font-semibold text-white">
                  {index + 1}
                </span>
                <span className="flex-1 text-left text-xl font-semibold tracking-tight text-white">
                  {faq.title}
                </span>
                <span className="text-xl text-white transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-white/8 px-7 py-5 text-sm leading-7 text-white/66">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="pending-cta grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span className="pending-badge">
            <span className="h-2.5 w-2.5 rounded-full bg-[#47ff8a] shadow-[0_0_14px_rgba(71,255,138,0.45)]" />
            Live, friendly & fast
          </span>

          <h2 className="mt-8 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
            Join our <span className="text-white">Discord.</span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-white/72">
            Support, order updates, product drops, and ticket help all happen
            in Discord.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="pending-pill">24/7 staff</span>
            <span className="pending-pill">Verified products</span>
            <span className="pending-pill">Private tickets</span>
          </div>

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
              <span className="h-3 w-3 rounded-full bg-[#47ff8a]" />
              <span className="h-3 w-3 rounded-full bg-white/20" />
              <span className="h-3 w-3 rounded-full bg-white/20" />
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/66">
              Instant help
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white">
                P
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-white">
                  {BRAND_NAME}
                </p>
                <p className="mt-1 text-sm text-white/56">
                  Premium Digital Products
                </p>
              </div>
            </div>

            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Join
            </a>
          </div>

          <div className="mt-6 inline-flex items-center rounded-full border border-[#47ff8a]/24 bg-[#47ff8a]/10 px-4 py-2 text-sm text-white/86">
            Live updating...
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-3xl font-semibold tracking-tight text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-white/52">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
