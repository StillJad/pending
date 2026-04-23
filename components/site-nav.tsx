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
    <nav className="flex items-center gap-6 text-sm text-white/70">
      {NAV_LINKS.map((item) => {
        const active = pathname ? isActive(pathname, item.href) : false;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`hover:text-white ${active ? "text-white" : ""}`}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
