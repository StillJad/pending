"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
      {NAV_LINKS.map((item) => {
        const active = pathname ? isActive(pathname, item.href) : false;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`nav-link ${active ? "nav-link-active" : ""}`}
          >
            <span className="relative z-10">{item.label}</span>
            <span
              aria-hidden="true"
              className={`nav-link-indicator ${
                active ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
