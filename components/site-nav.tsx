"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthSession } from "@/lib/auth";
import { NAV_LINKS } from "@/lib/site";

type SiteNavProps = {
  viewer: AuthSession | null;
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ viewer }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 md:items-end">
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em]">
        {NAV_LINKS.map((item) => {
          const active = pathname ? isActive(pathname, item.href) : false;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`border-b pb-1 transition ${
                active
                  ? "border-[#8b5cf6] text-white"
                  : "border-transparent text-white/55 hover:border-white/15 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {viewer ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/75">
            {viewer.username}
          </span>
          <a
            href="/logout"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50 transition hover:text-white"
          >
            Logout
          </a>
        </div>
      ) : (
        <Link
          href="/login"
          className={`font-mono text-[11px] uppercase tracking-[0.18em] transition ${
            pathname === "/login"
              ? "text-[#8b5cf6]"
              : "text-white/55 hover:text-white"
          }`}
        >
          Login
        </Link>
      )}
    </div>
  );
}
