import { AccountMenu } from "@/components/layout/AccountMenu";
import { Brand } from "@/components/layout/Brand";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavLinks } from "@/components/layout/NavLinks";
import type { AppUser } from "@/lib/types";
import type { NavGroup, NavItem } from "@/lib/navigation";

function getGreetingName(appUser: AppUser) {
  const fallback = appUser.email.split("@")[0];
  const [firstName] = (appUser.name || fallback).trim().split(/\s+/);

  return firstName || fallback;
}

export function AppShell({
  appUser,
  navItems,
  navGroups,
  variant = "client",
  children
}: {
  appUser: AppUser;
  navItems: NavItem[];
  navGroups?: NavGroup[];
  variant?: "admin" | "client";
  children: React.ReactNode;
}) {
  const greetingName = getGreetingName(appUser);
  const sidebarTitle = appUser.role === "admin" ? "Painel Administrativo" : "Área do cliente";
  const enabledItems = navItems.filter((item) => !item.disabled);
  const disabledItems = navItems.filter((item) => item.disabled);
  const enabledGroups = navGroups?.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.disabled)
  })).filter((group) => group.items.length > 0);

  if (variant === "admin") {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-rpx-mist">
        <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-full w-full items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <MobileNav navItems={navItems} navGroups={navGroups} title={sidebarTitle} />
              <Brand />
            </div>
            <div className="flex min-w-0 shrink items-center justify-end">
              <AccountMenu greetingName={greetingName} />
            </div>
          </div>
        </header>

        <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r border-slate-200 bg-white p-3 lg:block">
          {enabledGroups && enabledGroups.length > 0 ? (
            <nav className="grid gap-5">
              {enabledGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {group.label}
                  </p>
                  <div className="grid gap-1">
                    <NavLinks
                      navItems={group.items}
                      itemClassName="px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
              ))}
            </nav>
          ) : (
            <>
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {sidebarTitle}
              </p>
              <nav className="grid gap-1">
                <NavLinks
                  navItems={enabledItems}
                  itemClassName="px-3 py-2.5 text-sm"
                />
              </nav>
            </>
          )}
          {disabledItems.length > 0 ? (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Em breve</p>
              <div className="mt-2 grid gap-1">
                {disabledItems.map((item) => (
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

        <main className="min-w-0 overflow-x-hidden pt-16 lg:pl-72">
          <div className="min-h-[calc(100vh-4rem)] w-full px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-rpx-mist">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileNav navItems={navItems} navGroups={navGroups} title={sidebarTitle} />
            <Brand />
          </div>
          <div className="flex min-w-0 shrink items-center justify-end">
            <AccountMenu greetingName={greetingName} />
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl gap-5 overflow-x-hidden px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden rounded-lg border border-slate-200 bg-white p-3 shadow-soft lg:block lg:min-h-[calc(100vh-8rem)]">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {sidebarTitle}
          </p>
          <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            <NavLinks
              navItems={enabledItems}
              itemClassName="px-3 py-2.5 text-sm"
            />
          </nav>
          {disabledItems.length > 0 ? (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Em breve</p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {disabledItems.map((item) => (
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
