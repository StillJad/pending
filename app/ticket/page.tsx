import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/lib/site";

const supportSteps = [
  {
    title: "Join the server",
    copy: "Enter the Pending Discord and go to the ticket area.",
  },
  {
    title: "Open a ticket",
    copy: "Create a new thread for your order or support request.",
  },
  {
    title: "Share the basics",
    copy: "Include the product, quantity, and any order details you have.",
  },
] as const;

const supportDetails = [
  "Order ID if you already have one",
  "Products or quantities you need help with",
  "Any payment or delivery context",
] as const;

export default function TicketPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="max-w-2xl">
        <p className="text-sm font-medium text-[#8b5cf6]">Support</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Open a Discord ticket
        </h1>
        <p className="mt-3 max-w-xl text-white/70">
          Orders and support are handled through Discord. Start a ticket and
          include the basics so we can help quickly.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
          >
            Join Discord
          </a>
          <Link
            href="/products"
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-[#8b5cf6]/40 hover:text-white"
          >
            Browse products
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {supportSteps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#8b5cf6]/50 hover:bg-white/[0.03]"
          >
            <p className="text-sm text-[#8b5cf6]">0{index + 1}</p>
            <h2 className="mt-3 text-lg font-medium text-white">{step.title}</h2>
            <p className="mt-2 text-sm text-white/60">{step.copy}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="text-lg font-medium text-white">What to include</h2>
        <div className="mt-4 space-y-3">
          {supportDetails.map((detail) => (
            <div key={detail} className="flex items-start gap-3 text-sm text-white/70">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#8b5cf6]/60" />
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
