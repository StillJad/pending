import { redirect } from "next/navigation";
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
    case "oauth_failed":
      return "Discord login failed. Try again.";
    case "config":
      return "Discord login is not configured yet.";
    default:
      return null;
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = normalizeReturnToPath(params.next);
  const viewer = await getSession();

  if (viewer) {
    redirect(next);
  }

  const message = getErrorMessage(params.error);
  const continueHref = `/api/auth/discord?next=${encodeURIComponent(next)}`;

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <section className="ui-panel w-full max-w-md p-8 text-center sm:p-10">
        <p className="ui-overline ui-overline-accent">Login</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
          Login
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/70">
          {params.error === "guild_required"
            ? "Join the Discord server to continue."
            : "Login with Discord before placing orders or opening support."}
        </p>

        {message ? (
          <p className="mt-4 text-sm text-[#c4b5fd]">{message}</p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          {params.error === "guild_required" ? (
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white transition hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
            >
              Join the Discord server
            </a>
          ) : null}

          <a
            href={continueHref}
            className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white transition hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
          >
            Continue with Discord
          </a>
        </div>
      </section>
    </main>
  );
}
