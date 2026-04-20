export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Pending Bot",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-white/60">Last Updated: April 19, 2026</p>

        <div className="mt-10 space-y-10 text-white/85">
          <section className="space-y-3">
            <p>
              Pending Bot (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates a Discord bot that provides
              ticket management, vouch systems, proof handling, moderation tools, and server
              utility features.
            </p>
            <p>
              This Privacy Policy explains what information may be collected, how it may be
              used, and how it may be handled when users interact with the bot.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
            <p>Depending on how the bot is used, we may collect and process the following:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Discord user IDs</li>
              <li>Discord server IDs</li>
              <li>Channel IDs</li>
              <li>Role IDs</li>
              <li>Messages sent through bot commands or bot-managed systems</li>
              <li>Ticket transcripts and ticket-related metadata</li>
              <li>Attachments submitted for proof, vouches, or moderation purposes</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">How We Use Information</h2>
            <p>Information may be used to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Operate ticketing, proof, vouch, and support systems</li>
              <li>Generate logs and transcripts</li>
              <li>Store server-specific configuration settings</li>
              <li>Prevent abuse, misuse, or unauthorized access</li>
              <li>Maintain and improve bot functionality</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Data Storage</h2>
            <p>
              Some data may be stored temporarily or persistently, depending on the feature
              being used. This may include configuration values, ticket metadata, and proof or
              transcript records.
            </p>
            <p>
              We do not sell personal data and we do not share collected data with third
              parties except where required by law or necessary to operate the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Data Retention</h2>
            <p>
              Data is retained only for as long as reasonably necessary to support bot
              functionality, moderation, logging, and operational needs.
            </p>
            <p>
              Server administrators may delete bot-related content by removing the bot,
              deleting channels, or discontinuing use of the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Security</h2>
            <p>
              We take reasonable steps to protect stored information. Still, no storage or
              transmission method is completely secure, so absolute security cannot be
              guaranteed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">User Rights</h2>
            <p>
              Users who wish to request deletion of data should contact the server
              administrators responsible for the server where the bot is being used.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Continued use of Pending
              Bot after changes are made means the updated policy is accepted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p>
              For questions regarding this Privacy Policy, please contact the server
              administrators or the operator of Pending Bot.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
