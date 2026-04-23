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
    <nav className="flex flex-wrap items-center gap-4 text-sm">
      {NAV_LINKS.map((item) => {
        const active = pathname ? isActive(pathname, item.href) : false;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`transition ${
              active
                ? "font-medium text-[#8b5cf6]"
                : "text-white/70 hover:text-[#8b5cf6]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
