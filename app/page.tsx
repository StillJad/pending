import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/lib/site";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a.07.07 0 0 0-.08.04c-.21.38-.45.88-.62 1.27a18.27 18.27 0 0 0-5.49 0 12.64 12.64 0 0 0-.63-1.27.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.96 1.57.07.07 0 0 0-.03.03C.33 9.05-.32 13.58.1 18.06c0 .02.01.04.03.05a19.9 19.9 0 0 0 6.08 3.05.08.08 0 0 0 .08-.03c.47-.64.89-1.32 1.24-2.03a.08.08 0 0 0-.04-.1 13.1 13.1 0 0 1-1.9-.9.08.08 0 0 1-.01-.13l.37-.28a.07.07 0 0 1 .08 0c3.96 1.8 8.24 1.8 12.16 0a.07.07 0 0 1 .08 0l.38.28a.08.08 0 0 1-.01.13c-.6.35-1.24.65-1.9.9a.08.08 0 0 0-.04.1c.36.7.77 1.39 1.24 2.03a.08.08 0 0 0 .08.03 19.83 19.83 0 0 0 6.09-3.05.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.85-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="page-transition flex min-h-[calc(100vh-190px)] items-center justify-center px-4 py-20 sm:py-28">
      <section className="relative mx-auto max-w-5xl text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_65%)] blur-3xl" />

        <div className="relative z-10">
          <p className="mx-auto inline-flex items-center rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            pending.cc
          </p>

          <h1 className="mx-auto mt-9 max-w-5xl text-5xl font-black tracking-[-0.08em] text-white sm:text-7xl lg:text-8xl">
            The Best Supplier.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
            I NEED HELP BRUH NIGGER
          </p>

          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-3 text-sm font-bold text-white shadow-[0_0_35px_rgba(255,255,255,0.06)] transition hover:bg-white/[0.12]"
            >
              <DiscordIcon />
              Join Discord
            </a>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/92 transition hover:bg-white/[0.09] hover:text-white"
            >
              View catalog
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
