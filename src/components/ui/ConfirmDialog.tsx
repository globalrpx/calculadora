"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  children
}: {
  triggerLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-red-600 transition hover:text-red-700"
      >
        {triggerLabel}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-rpx-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ConfirmSubmitButton({
  label = "Confirmar exclusão"
}: {
  label?: string;
}) {
  return (
    <Button type="submit" className="bg-red-600 hover:bg-red-700">
      {label}
    </Button>
  );
}
