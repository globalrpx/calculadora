import { clsx } from "clsx";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function FormField({
  label,
  help,
  error,
  errorId,
  children
}: {
  label: string;
  help?: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid min-w-0 content-start gap-2 self-start text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
      {error ? (
        <span id={errorId} className="text-xs font-normal leading-5 text-red-600">
          {error}
        </span>
      ) : help ? (
        <span className="text-xs font-normal leading-5 text-slate-500">{help}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className, "aria-invalid": ariaInvalid, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  return (
    <input
      className={clsx(
        "h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10",
        invalid && "border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/10",
        className
      )}
      aria-invalid={ariaInvalid}
      {...props}
    />
  );
}

export function NumberInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput className={className} type="number" step="0.01" min="0" {...props} />;
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10",
        className
      )}
      {...props}
    />
  );
}
