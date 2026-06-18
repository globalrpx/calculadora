import Link from "next/link";
import { clsx } from "clsx";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  sortKey?: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
};

export type DataTableSortState = {
  key: string;
  direction: "asc" | "desc";
};

export function DataTable<T>({
  columns,
  rows,
  emptyLabel = "Nenhum registro encontrado.",
  sort,
  getSortHref
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyLabel?: string;
  sort?: DataTableSortState;
  getSortHref?: (sortKey: string) => string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-[880px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((column) => {
                const sortKey = column.sortKey ?? String(column.key);
                const isSorted = sort?.key === sortKey;
                const canSort = Boolean(column.sortable && getSortHref);
                const sortHref = canSort && getSortHref ? getSortHref(sortKey) : "";

                return (
                  <th
                    key={String(column.key)}
                    className={clsx("px-4 py-3 font-semibold whitespace-nowrap", column.headerClassName)}
                    aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                  >
                    {canSort ? (
                      <Link
                        href={sortHref}
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-sm text-left transition hover:text-rpx-blue",
                          isSorted ? "text-rpx-blue" : "text-slate-600"
                        )}
                      >
                        <span>{column.header}</span>
                        <span className="text-xs" aria-hidden="true">
                          {isSorted ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      </Link>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={String(column.key)} className={clsx("px-4 py-4 align-top text-slate-600", column.className)}>
                      {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
