import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/Button";
import type { AppUser } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
};

export function AppShell({
  appUser,
  navItems,
  children,
  tone = "client"
}: {
  appUser: AppUser;
  navItems: NavItem[];
  children: React.ReactNode;
  tone?: "client" | "admin";
}) {
  return (
    <div className="min-h-screen bg-rpx-mist">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Brand />
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <p className="font-semibold text-rpx-ink">{appUser.name ?? appUser.email}</p>
              <p className="text-xs uppercase text-slate-500">{tone === "admin" ? "Admin RPX" : "Cliente"}</p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="secondary">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[248px_1fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft lg:min-h-[calc(100vh-8rem)]">
          <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-rpx-sky hover:text-rpx-blue"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
