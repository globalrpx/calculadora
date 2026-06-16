"use client";

import { useState } from "react";
import { clsx } from "clsx";

const variants = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700"
};

export function DismissibleAlert({
  children,
  variant = "success",
  className
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={clsx(
        "mb-6 flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm",
        variants[variant],
        className
      )}
    >
      <div>{children}</div>
      <button
        type="button"
        aria-label="Fechar alerta"
        onClick={() => setVisible(false)}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-current/80 transition hover:bg-black/5 hover:text-current"
      >
        ×
      </button>
    </div>
  );
}
