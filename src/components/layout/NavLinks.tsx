"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { NavItem } from "@/lib/navigation";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({
  navItems,
  onNavigate,
  itemClassName
}: {
  navItems: NavItem[];
  onNavigate?: () => void;
  itemClassName?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const active = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={clsx(
              itemClassName,
              "rounded-md font-semibold transition",
              active
                ? "active bg-rpx-sky text-rpx-blue ring-1 ring-rpx-blue/25"
                : "text-slate-700 hover:bg-rpx-sky hover:text-rpx-blue"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
