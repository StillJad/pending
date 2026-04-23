import Link from "next/link";
import { BRAND_NAME, DISCORD_INVITE_URL } from "@/lib/site";

const primaryActions = [
  {
    href: "/products",
    eyebrow: "Catalog",
    title: "Buy",
    copy: "Browse active categories, compare prices, and move straight into a polished checkout flow.",
    cta: "Explore products",
  },
  {
    href: "/ticket",
    eyebrow: "Concierge",
    title: "Support",
    copy: "Start a Discord ticket when you need guidance, fulfillment updates, or a direct handoff.",
    cta: "Open support",
  },
  {
    href: "/orders",
    eyebrow: "Visibility",
    title: "Tracking",
    copy: "Keep previous and active orders in one clean place with clear status visibility.",
    cta: "View tracking",
  },
] as const;

const premiumHighlights = [
  {
    title: "Transparent pricing",
    copy: "Every category keeps pricing clear, quick to scan, and easy to move into checkout.",
  },
  {
    title: "Discord-based fulfillment",
    copy: "Orders move cleanly from cart to Discord so support and delivery stay in one channel.",
  },
  {
    title: "Refined order flow",
    copy: "From catalog to tracking, the experience stays sleek, responsive, and intentionally minimal.",
  },
] as const;

const trustStrip = [
  "Dark luxury storefront",
  "Cart-first order flow",
  "Discord handoff ready",
] as const;

const heroSteps = [
  "Browse the catalog",
  "Review your cart",
  "Open Discord for fulfillment",
  "Track order status",
] as const;

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
  return (
    <main className="page-shell">
      <section className="page-header">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(98,114,255,0.22),transparent_52%)]" />
        <div className="pointer-events-none absolute -left-16 top-8 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(129,96,255,0.26),transparent_66%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(76,174,255,0.22),transparent_68%)] blur-3xl" />

        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="reveal-up">
            <span className="page-kicker">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
              Discord-based fulfillment
            </span>

            <h1 className="page-title mt-6">
              <span className="gradient-text">{BRAND_NAME}</span>
              <br />
              Premium storefront for digital delivery.
            </h1>

            <p className="page-lead mt-6">
              Clean pricing, polished checkout, and a premium path from
              discovery to Discord handoff without the clutter.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="button-base button-primary cta-pulse group"
              >
                Browse catalog
                <ArrowIcon />
              </Link>
              <Link href="/ticket" className="button-base button-secondary">
                Open support
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {trustStrip.map((item, index) => (
                <div
                  key={item}
                  className={`glass-card p-4 text-sm text-white/72 reveal-up stagger-${
                    index + 1
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.95)]" />
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-up stagger-2">
            <div className="glass-panel p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.28em] text-white/55">
                    Why Pending
                  </p>
                  <h2 className="mt-3 font-display text-3xl tracking-[-0.04em] text-white">
                    Built to feel deliberate.
                  </h2>
                </div>
                <div className="chip">Premium flow</div>
              </div>

              <div className="mt-8 grid gap-3">
                {heroSteps.map((step, index) => (
                  <div
                    key={step}
                    className="glass-card flex items-center gap-4 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 font-display text-sm tracking-[0.2em] text-white/78">
                      0{index + 1}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-white/40">
                        Step
                      </p>
                      <p className="mt-1 text-base text-white/82">{step}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-sm text-white/62">
                Discord stays at the center of fulfillment so support, updates,
                and delivery happen in one trusted flow.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="soft-divider" />

      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="page-kicker">Core routes</span>
            <h2 className="section-title mt-5">A cleaner path through the site.</h2>
            <p className="section-copy mt-4">
              The essentials stay simple: browse, get support, and check your
              order status with stronger hierarchy and better interaction states.
            </p>
          </div>

          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="button-base button-ghost w-fit px-0 text-sm uppercase tracking-[0.22em] text-white/60 hover:text-white"
          >
            Join Discord
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {primaryActions.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`glass-card card-hover group p-6 reveal-up stagger-${
                index + 1
              }`}
            >
              <div className="card-glow" />
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                {item.eyebrow}
              </p>
              <h3 className="font-display mt-4 text-3xl tracking-[-0.04em] text-white">
                {item.title}
              </h3>
              <p className="mt-4 max-w-sm text-white/64">{item.copy}</p>
              <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/78 transition group-hover:text-white">
                {item.cta}
                <ArrowIcon />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <span className="page-kicker">Why Pending</span>
            <h2 className="section-title mt-5">
              Cohesive, premium, and purpose-built.
            </h2>
            <p className="section-copy mt-4">
              Pending is centered on fast product discovery, clean cart review,
              and a refined Discord fulfillment path that feels more deliberate
              end to end.
            </p>
          </div>

          <div className="chip w-fit">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.85)]" />
            Dark luxury UI
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {premiumHighlights.map((item, index) => (
            <div
              key={item.title}
              className={`glass-card p-6 reveal-up stagger-${index + 1}`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] font-display text-sm tracking-[0.24em] text-white/78">
                P{index + 1}
              </div>
              <h3 className="font-display text-2xl tracking-[-0.04em] text-white">
                {item.title}
              </h3>
              <p className="mt-4 text-white/62">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
