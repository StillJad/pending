import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/lib/site";

const supportSteps = [
  {
    title: "Join the server",
    copy: "Enter the Pending Discord and head to the ticket or support area.",
  },
  {
    title: "Open a ticket",
    copy: "Create a fresh ticket so your order or question has a clean thread.",
  },
  {
    title: "Share order details",
    copy: "Include the product, quantity, and any tracking or order ID context.",
  },
] as const;

const supportDetails = [
  "Order ID if one already exists",
  "Products or quantities you want help with",
  "Any payment or fulfillment context needed",
] as const;

export default function TicketPage() {
  return (
    <main className="page-shell">
      <section className="page-header">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top,rgba(97,178,255,0.18),transparent_58%)]" />

        <span className="page-kicker">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
          Support concierge
        </span>
        <h1 className="section-title mt-6">Open a Discord ticket with Pending.</h1>
        <p className="section-copy mt-4">
          All fulfillment and support continue through Discord, so the fastest
          path is to open a ticket with your product and order details ready.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="button-base button-primary cta-pulse"
          >
            Join Discord &amp; create ticket
          </a>
          <Link href="/products" className="button-base button-secondary">
            Browse products first
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {supportSteps.map((step, index) => (
          <div
            key={step.title}
            className={`glass-card p-6 reveal-up stagger-${index + 1}`}
          >
            <div className="card-glow" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] font-display text-sm tracking-[0.24em] text-white/78">
              0{index + 1}
            </div>
            <h2 className="font-display mt-5 text-2xl tracking-[-0.04em] text-white">
              {step.title}
            </h2>
            <p className="mt-4 text-white/62">{step.copy}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel p-6 sm:p-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <span className="page-kicker">What to include</span>
            <h2 className="section-title mt-5">Make the ticket easy to act on.</h2>
            <p className="section-copy mt-4">
              Bringing the right context up front helps support move faster and
              keeps the fulfillment handoff smoother.
            </p>
          </div>

          <div className="chip w-fit">Discord-first workflow</div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {supportDetails.map((detail, index) => (
            <div
              key={detail}
              className={`glass-card p-5 reveal-up stagger-${(index % 4) + 1}`}
            >
              <p className="text-sm text-white/72">{detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
