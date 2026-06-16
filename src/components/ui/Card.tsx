import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Card({
  title,
  value,
  description,
  children,
  className
}: {
  title?: string;
  value?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-soft", className)}>
      {title ? <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2> : null}
      {value ? <p className="mt-3 text-3xl font-bold text-rpx-ink">{value}</p> : null}
      {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      {children}
    </section>
  );
}
