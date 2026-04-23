import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/lib/site";

const supportSteps = [
  {
    title: "Join the server",
    copy: "Open the Pending Discord.",
  },
  {
    title: "Start a ticket",
    copy: "Use a new thread for the request.",
  },
  {
    title: "Send the basics",
    copy: "Product, quantity, order ID.",
  },
] as const;

const supportDetails = [
  "Order ID if you have one",
  "Product and quantity",
  "Anything missing or delayed",
] as const;

export default function TicketPage() {
  return (
    <main className="space-y-8">
      <section className="grid gap-8 border-b border-white/5 pb-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="max-w-2xl">
          <p className="ui-overline ui-overline-accent">Support</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
            Use Discord
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Orders and support run through Discord. Start a ticket and keep it
            simple.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="ui-button-primary"
            >
              Join Discord
            </a>
            <Link href="/products" className="ui-button-secondary">
              Browse products
            </Link>
          </div>
        </div>

        <aside className="ui-panel p-5">
          <p className="ui-overline">Channel</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="ui-overline">Flow</span>
              <span className="font-mono text-sm uppercase tracking-[0.16em] text-[#8b5cf6]">
                discord
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Support</span>
              <span className="font-mono text-sm text-white/90">live</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Orders</span>
              <span className="font-mono text-sm text-white/90">linked</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {supportSteps.map((step, index) => (
          <div key={step.title} className="ui-panel ui-panel-hover p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8b5cf6]">
              0{index + 1}
            </p>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">{step.copy}</p>
          </div>
        ))}
      </section>

      <section className="ui-panel p-6">
        <p className="ui-overline">Include</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Keep it direct
        </h2>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {supportDetails.map((detail) => (
            <div
              key={detail}
              className="rounded-2xl border border-white/10 p-4 text-sm text-white/70"
            >
              {detail}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
