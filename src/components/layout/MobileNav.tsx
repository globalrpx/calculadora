"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { NavLinks } from "@/components/layout/NavLinks";

type NavItem = {
  href: string;
  label: string;
  disabled?: boolean;
};

export function MobileNav({ navItems, title = "Menu" }: { navItems: NavItem[]; title?: string }) {
  const [open, setOpen] = useState(false);

  const enabledItems = navItems.filter((item) => !item.disabled);
  const disabledItems = navItems.filter((item) => item.disabled);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-rpx-blue/20 bg-white text-rpx-blue transition hover:bg-rpx-sky lg:hidden"
      >
        <span className="flex flex-col gap-1">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </span>
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100] lg:hidden">
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="absolute inset-0 z-0 bg-slate-950/40"
              />
              <aside className="absolute left-0 top-0 z-10 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-slate-200 bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</p>
                  <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                  >
                    <span className="text-lg leading-none">×</span>
                  </button>
                </div>

                <nav className="mt-4 grid gap-1">
                  <NavLinks
                    navItems={enabledItems}
                    onNavigate={() => setOpen(false)}
                    itemClassName="px-3 py-3 text-sm"
                  />
                </nav>

                {disabledItems.length > 0 ? (
                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Em breve</p>
                    <div className="mt-2 grid gap-1">
                      {disabledItems.map((item) => (
                        <div key={item.href} className="rounded-md px-3 py-3 text-sm font-semibold text-slate-400">
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
