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
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
          Support
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Use Discord
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          Orders and support run through Discord. Start a ticket and keep it
          simple.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
          >
            Join Discord
          </a>
          <Link
            href="/products"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-[#8b5cf6]/50 hover:text-white"
          >
            Browse products
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {supportSteps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-xl border border-white/10 bg-transparent p-5 transition hover:border-[#8b5cf6]/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.12)]"
          >
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
              0{index + 1}
            </p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
              {step.title}
            </h2>
            <p className="mt-2 text-sm text-white/70">{step.copy}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Include
        </h2>
        <div className="mt-4 space-y-3">
          {supportDetails.map((detail) => (
            <div key={detail} className="flex items-start gap-3 text-sm text-white/70">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40" />
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
