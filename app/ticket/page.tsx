import Link from "next/link";
import { TicketAccessPanel } from "@/components/ticket-access-panel";
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
    <main className="page-transition space-y-10">
      <section className="grid gap-10 border-b border-white/5 pb-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
        <div className="max-w-2xl">
          <p className="ui-overline ui-overline-accent">Support</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
            Use Discord
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Orders and support run through Discord. Start a ticket and keep the
            details direct.
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

        <aside className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="ui-overline">Channel</p>
          <div className="mt-5 space-y-5">
            <div>
              <p className="font-mono text-xl uppercase tracking-[0.16em] text-[#8b5cf6]">
                discord
              </p>
              <p className="mt-2 text-sm text-white/55">
                Support and fulfillment stay in one place.
              </p>
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <span className="ui-overline">Support</span>
                <span className="font-mono text-sm text-white/90">live</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="ui-overline">Orders</span>
                <span className="font-mono text-sm text-white/90">linked</span>
              </div>
            </div>
          </div>

          <TicketAccessPanel />
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="ui-panel p-6 sm:p-7">
          <p className="ui-overline">Flow</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Open a ticket
          </h2>

          <div className="mt-8 space-y-0">
            {supportSteps.map((step, index) => (
              <div
                key={step.title}
                className="grid gap-4 border-t border-white/5 py-5 first:border-t-0 first:pt-0 md:grid-cols-[64px_minmax(0,1fr)]"
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8b5cf6]">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-white/68">
                    {step.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="ui-panel p-6">
          <p className="ui-overline">Include</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
            Keep it direct
          </h2>

          <div className="mt-6 space-y-3">
            {supportDetails.map((detail) => (
              <div
                key={detail}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/68"
              >
                {detail}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
