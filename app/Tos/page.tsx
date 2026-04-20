export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Pending Bot",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-white/60">Last Updated: April 19, 2026</p>

        <div className="mt-10 space-y-10 text-white/85">
          <section className="space-y-3">
            <p>
              By using Pending Bot, you agree to these Terms of Service. If you do not agree,
              do not use the bot.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Use of the Bot</h2>
            <p>Pending Bot may provide features such as:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Ticket creation and management</li>
              <li>Proof and vouch systems</li>
              <li>Moderation utilities</li>
              <li>Welcome messages, autoroles, and server setup tools</li>
              <li>Other server-related utility features</li>
            </ul>
            <p>
              You agree not to use the bot in violation of Discord’s Terms of Service,
              Community Guidelines, or any applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Server Responsibility</h2>
            <p>
              Server owners and administrators are responsible for how the bot is configured
              and used in their server.
            </p>
            <p>
              We are not responsible for user-generated content, ticket messages, proof
              submissions, vouches, or any other content posted through the bot.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Availability</h2>
            <p>
              We do not guarantee that the bot will always be available, uninterrupted,
              secure, or error-free.
            </p>
            <p>
              Features may be changed, restricted, or removed at any time without notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Data and Privacy</h2>
            <p>
              Use of the bot is also governed by our Privacy Policy. By using Pending Bot, you
              consent to the collection and handling of data as described there.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Restrictions</h2>
            <p>You may not use Pending Bot to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Abuse, harass, or harm other users</li>
              <li>Spam, scam, or impersonate others</li>
              <li>Break Discord platform rules</li>
              <li>Attempt unauthorized access to systems or data</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Termination</h2>
            <p>
              We may restrict, suspend, or terminate access to Pending Bot at any time, with
              or without notice, if misuse, abuse, or rule violations are detected.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
            <p>
              Pending Bot is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We are not
              liable for any direct, indirect, incidental, or consequential damages resulting
              from the use of the bot.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Changes to These Terms</h2>
            <p>
              We may update these Terms of Service at any time. Continued use of the bot after
              changes are made means the updated terms are accepted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p>
              For questions regarding these Terms of Service, please contact the server
              administrators or the operator of Pending Bot.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
