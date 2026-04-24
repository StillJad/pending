"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DISCORD_INVITE_URL, NAV_LINKS } from "@/lib/site";

type SiteNavProps = {
  viewer: import("@/lib/auth").AuthSession | null;
};

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) {
    return pathname === "/";
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function CartIcon() {
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
      <circle cx="9" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
      <path d="M3 4h2l2.1 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
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
      <path d="M19.54 5.59A16.7 16.7 0 0 0 15.45 4c-.18.32-.39.76-.53 1.1a15.43 15.43 0 0 0-5.84 0A11.8 11.8 0 0 0 8.54 4a16.65 16.65 0 0 0-4.1 1.6C1.85 9.52 1.15 13.34 1.5 17.1a16.92 16.92 0 0 0 5.03 2.54c.41-.56.78-1.15 1.1-1.78-.6-.23-1.16-.51-1.69-.83.14-.1.27-.2.4-.31 3.25 1.53 6.77 1.53 9.98 0 .14.11.27.21.4.31-.53.32-1.1.6-1.69.83.32.63.69 1.22 1.1 1.78a16.83 16.83 0 0 0 5.04-2.54c.42-4.35-.73-8.13-2.63-11.51ZM8.87 14.8c-.98 0-1.8-.9-1.8-2s.79-2 1.8-2c1 0 1.82.9 1.8 2 0 1.1-.8 2-1.8 2Zm6.26 0c-.99 0-1.8-.9-1.8-2s.79-2 1.8-2c1 0 1.82.9 1.8 2 0 1.1-.8 2-1.8 2Z" />
    </svg>
  );
}

function LoginIcon() {
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
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

function PendingLogo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] shadow-[0_0_28px_rgba(255,255,255,0.08)] transition group-hover:border-white/30 group-hover:bg-white/[0.07]">
        <img
          src="/server-icon.png"
          alt="Pending"
          className="h-8 w-8 rounded-xl object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span className="absolute text-sm font-black tracking-tight text-white/90">P</span>
      </div>
      <span className="text-lg font-black tracking-tight text-white">Pending</span>
    </Link>
  );
}

export function SiteNav({ viewer }: SiteNavProps) {
  const pathname = usePathname() || "/";
  const loginHref = `/api/auth/discord?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      <PendingLogo />
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-white/62 md:justify-center">
        {NAV_LINKS.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`transition ${
                active ? "text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.22)]" : "text-white/58 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <Link
          href="/cart"
          aria-label="Cart"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.035] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        >
          <CartIcon />
        </Link>

        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/14 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_0_22px_rgba(255,255,255,0.08)]"
        >
          <DiscordIcon />
          Discord
        </a>

        {viewer ? (
          <>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.035] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {viewer.avatar ? (
                <img
                  src={viewer.avatar}
                  alt={viewer.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-xs font-semibold text-white">
                  {viewer.username.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="max-w-[112px] truncate text-sm font-semibold text-white">
                {viewer.username}
              </span>
            </div>

            <a
              href="/logout"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/14 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white"
            >
              Logout
            </a>
          </>
        ) : (
          <a
            href={loginHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white px-5 py-3 text-sm font-black text-black shadow-[0_0_28px_rgba(255,255,255,0.16)] transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-[0_0_34px_rgba(255,255,255,0.22)]"
          >
            <LoginIcon />
            Login
          </a>
        )}
      </div>
    </div>
  );
}
