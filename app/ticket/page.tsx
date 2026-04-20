export default function TicketPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">Create Ticket</h1>
        <p className="mt-3 text-white/70">
          Open a ticket in our Discord server to place an order.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70">
            All orders are handled through Discord. Click the button below to join and open a ticket.
          </p>

          <a
            href="https://discord.gg/pending"
            target="_blank"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-black font-semibold hover:opacity-80"
          >
            Join Discord & Create Ticket
          </a>
        </div>
      </div>
    </main>
  );
}
