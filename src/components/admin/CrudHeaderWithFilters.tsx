"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M4 6h16l-6 7v4l-4 2v-6L4 6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CrudHeaderWithFilters({
  title,
  description,
  newHref,
  filtersInitiallyOpen,
  children
}: {
  title: string;
  description: string;
  newHref: string;
  filtersInitiallyOpen: boolean;
  children: React.ReactNode;
}) {
  const [filtersOpen, setFiltersOpen] = useState(filtersInitiallyOpen);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <button
              type="button"
              aria-label={filtersOpen ? "Ocultar filtros" : "Exibir filtros"}
              title={filtersOpen ? "Ocultar filtros" : "Exibir filtros"}
              aria-pressed={filtersOpen}
              onClick={() => setFiltersOpen((value) => !value)}
              className={[
                "relative inline-flex h-11 w-11 items-center justify-center rounded-md border transition",
                filtersOpen
                  ? "border-rpx-blue bg-rpx-blue text-white hover:bg-rpx-navy"
                  : "border-rpx-blue/20 bg-white text-rpx-blue hover:bg-rpx-sky"
              ].join(" ")}
            >
              <FilterIcon />
              {filtersInitiallyOpen ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rpx-red" />
              ) : null}
            </button>
            <ButtonLink href={newHref} className="w-full sm:w-auto">
              Novo
            </ButtonLink>
          </div>
        }
      />
      {filtersOpen ? children : null}
    </>
  );
}
