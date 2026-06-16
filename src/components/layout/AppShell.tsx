import Link from "next/link";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { Brand } from "@/components/layout/Brand";
import { MobileNav } from "@/components/layout/MobileNav";
import type { AppUser } from "@/lib/types";
import type { NavItem } from "@/lib/navigation";

export function AppShell({
  appUser,
  navItems,
  children
}: {
  appUser: AppUser;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const greetingName = (appUser.name || appUser.email.split("@")[0]).trim();

  return (
    <div className="min-h-screen bg-rpx-mist">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <MobileNav navItems={navItems} />
            <Brand />
          </div>
          <div className="flex items-center gap-3">
            <AccountMenu greetingName={greetingName} />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 overflow-x-hidden px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden rounded-lg border border-slate-200 bg-white p-3 shadow-soft lg:block lg:min-h-[calc(100vh-8rem)]">
          <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {navItems
              .filter((item) => !item.disabled)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-rpx-sky hover:text-rpx-blue"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
          {navItems.some((item) => item.disabled) ? (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Em breve</p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {navItems
                  .filter((item) => item.disabled)
                  .map((item) => (
                    <div
                      key={item.href}
                      className="rounded-md px-3 py-2.5 text-sm font-semibold text-slate-400"
                    >
                      {item.label}
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </aside>
        <main className="min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
