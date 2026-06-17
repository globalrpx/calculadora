"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={["h-4 w-4 transition", open ? "rotate-180" : ""].join(" ")}
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AccountMenu({
  greetingName
}: {
  greetingName: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Abrir menu da conta"
        className="inline-flex min-h-11 max-w-[150px] items-center gap-2 rounded-md border border-rpx-blue/20 bg-white px-3 py-2 text-sm font-semibold text-rpx-ink transition hover:bg-rpx-sky sm:max-w-[220px]"
      >
        <span className="min-w-0 truncate">Olá, {greetingName}!</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-[180px] rounded-lg border border-slate-200 bg-white p-2 shadow-soft">
          <Link
            href="/conta"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-rpx-sky hover:text-rpx-blue"
          >
            Minha conta
          </Link>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-rpx-sky hover:text-rpx-blue"
            >
              Sair
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
