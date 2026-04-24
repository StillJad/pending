import Link from "next/link";
import { LoginAuthPanel } from "@/components/login-auth-panel";
import { DISCORD_INVITE_URL } from "@/lib/site";
import { getSession, normalizeReturnToPath } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function getErrorMessage(error: string | undefined) {
  switch (error) {
    case "guild_required":
      return "Join the Discord server to continue";
    case "role_required":
      return "A required Discord role is missing.";
    case "oauth_failed":
      return "Discord login failed. Try again.";
    case "config":
      return "Discord login is not configured yet.";
    case "turnstile_failed":
      return "Verification failed. Try again.";
    default:
      return null;
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = normalizeReturnToPath(params.next);
  const viewer = await getSession();
  const message = getErrorMessage(params.error);
  const primaryHref = next === "/" ? "/products" : next;

  return (
    <main className="page-transition mx-auto max-w-6xl px-4 py-16">
      <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#8b5cf6]">
            Access
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
            {viewer ? "You’re already signed in" : "Continue with Discord"}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            {viewer
              ? "Your session is active. Continue browsing or go straight to your orders."
              : "Sign in before placing orders or opening support."}
          </p>

          <div className="mt-8 max-w-md divide-y divide-white/5 border-y border-white/5">
            <div className="flex items-center justify-between gap-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                Access
              </span>
              <span className="text-sm text-white/55">
                Server membership required
              </span>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                Orders
              </span>
              <span className="text-sm text-white/55">
                Tied to your Discord account
              </span>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                Support
              </span>
              <span className="text-sm text-white/55">
                Handled through Discord
              </span>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(139,92,246,0.07),rgba(0,0,0,0)_22%)] bg-black/20 p-6 sm:p-7">
          {viewer ? (
            <>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8b5cf6]">
                Active session
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Signed in
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                You’re signed in as {viewer.username}.
              </p>

              <div className="mt-6 rounded-xl border border-white/10 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                  Session
                </p>
                <p className="mt-2 text-sm text-white/75">{viewer.username}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={primaryHref}
                  className="rounded-lg bg-[#8b5cf6] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_16px_rgba(139,92,246,0.22)]"
                >
                  Continue
                </Link>
                <Link href="/orders" className="ui-button-secondary">
                  View orders
                </Link>
              </div>
            </>
          ) : (
            <LoginAuthPanel
              inviteUrl={DISCORD_INVITE_URL}
              message={message}
              next={next}
              requiresGuildJoin={params.error === "guild_required"}
            />
          )}
        </aside>
      </section>
    </main>
  );
}
