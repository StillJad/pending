"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

function PendingLogo({ compact }: { compact: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.08]">
        <span className="absolute text-xs font-bold text-white">P</span>
        <img
          src="/server-icon.png"
          alt="Pending"
          className="relative z-10 h-8 w-8 rounded-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>
      <span
        className={`hidden text-sm font-semibold text-white transition-all duration-300 sm:inline ${
          compact ? "max-w-0 overflow-hidden opacity-0" : "max-w-[90px] opacity-100"
        }`}
      >
        Pending
      </span>
    </Link>
  );
}

export function SiteNav({ viewer }: SiteNavProps) {
  const pathname = usePathname() || "/";
  const loginHref = `/api/auth/discord?next=${encodeURIComponent(pathname)}`;
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeIndex = NAV_LINKS.findIndex((item) => isActive(pathname, item.href));

  return (
    <div
      className={`mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-white/12 bg-black/25 px-2.5 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 ${
        compact ? "py-1.5 scale-[0.94]" : "py-2 scale-100"
      }`}
    >
      <PendingLogo compact={compact} />

      <nav className="relative grid grid-cols-2 gap-1 rounded-full border border-white/8 bg-white/[0.035] p-1">
        {activeIndex >= 0 ? (
          <span
            aria-hidden="true"
            className="absolute inset-y-1 z-10 rounded-full border border-white/18 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_24px_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: "calc((100% - 0.25rem) / 2)",
              transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
            }}
          />
        ) : null}

        {NAV_LINKS.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative z-20 w-[124px] rounded-full px-3 py-1.5 text-center text-sm transition-colors duration-300 ${
                active
                  ? "font-semibold !text-white"
                  : "font-medium !text-white/55 hover:!text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/cart"
          aria-label="Cart"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1]"
        >
          <CartIcon />
        </Link>

        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
        >
          <DiscordIcon />
          <span className={compact ? "hidden lg:inline" : "hidden sm:inline"}>Discord</span>
        </a>

        {viewer ? (
          <>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-sm font-semibold text-white transition hover:bg-white/[0.1]">
              {viewer.avatar ? (
                <img
                  src={viewer.avatar}
                  alt={viewer.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-xs font-bold text-white">
                  {viewer.username.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span
                className={`max-w-[112px] truncate text-sm font-semibold text-white transition-all duration-300 ${
                  compact ? "hidden xl:inline" : "hidden md:inline"
                }`}
              >
                {viewer.username}
              </span>
            </div>

            <a
              href="/logout"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              Logout
            </a>
          </>
        ) : (
          <a
            href={loginHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
          >
            <LoginIcon />
            <span className={compact ? "hidden lg:inline" : "hidden sm:inline"}>Login</span>
          </a>
        )}
      </div>
    </div>
  );
}
