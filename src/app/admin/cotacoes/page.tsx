import Link from "next/link";
import {
  adminQuoteSortColumns,
  defaultAdminQuoteSort,
  getAdminQuotes,
  type AdminQuoteFilters,
  type AdminQuoteSort,
  type AdminQuoteSortKey,
  type AdminSortDirection
} from "@/lib/admin/queries";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";
import { QuoteFilters } from "@/components/admin/QuoteFilters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

const QUOTES_PER_PAGE = 20;

function formatDateTime(value: string) {
  const date = new Date(value);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return `${formattedDate} - ${formattedTime}`;
}

function formatMoney(value: number, currency: "BRL" | "USD" = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(value ?? 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function getClientLabel(row: Awaited<ReturnType<typeof getAdminQuotes>>["rows"][number]) {
  return row.client?.trade_name || row.client?.company_name || row.client?.contact_name || "-";
}

function hasSimulation(row: Awaited<ReturnType<typeof getAdminQuotes>>["rows"][number]) {
  return row.simulations.length > 0 || row.status === "simulation_requested";
}

function getSituation(row: Awaited<ReturnType<typeof getAdminQuotes>>["rows"][number]) {
  return hasSimulation(row) ? "Simulação solicitada" : "Recebida";
}

function getSituationVariant(row: Awaited<ReturnType<typeof getAdminQuotes>>["rows"][number]) {
  return hasSimulation(row) ? "info" : "neutral";
}

function parseFilters(params: Record<string, string | string[] | undefined>): AdminQuoteFilters {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };
  const situation = read("situation");

  return {
    client: read("client"),
    product: read("product"),
    hsCode: read("hsCode"),
    supplier: read("supplier"),
    situation: situation === "received" || situation === "simulation_requested" ? situation : undefined,
    dateFrom: read("dateFrom"),
    dateTo: read("dateTo")
  };
}

function parsePage(params: Record<string, string | string[] | undefined>) {
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
}

function parseSort(params: Record<string, string | string[] | undefined>): AdminQuoteSort {
  const sort = typeof params.sort === "string" ? params.sort : "";
  const direction = typeof params.direction === "string" ? params.direction : "";

  if (
    sort in adminQuoteSortColumns &&
    (direction === "asc" || direction === "desc")
  ) {
    return {
      sort: sort as AdminQuoteSortKey,
      direction: direction as AdminSortDirection
    };
  }

  return defaultAdminQuoteSort;
}

function appendSortParams(params: URLSearchParams, sort: AdminQuoteSort) {
  if (sort.sort !== defaultAdminQuoteSort.sort || sort.direction !== defaultAdminQuoteSort.direction) {
    params.set("sort", sort.sort);
    params.set("direction", sort.direction);
  }
}

function buildQuotesHref({
  filters,
  sort,
  page = 1
}: {
  filters?: AdminQuoteFilters;
  sort: AdminQuoteSort;
  page?: number;
}) {
  const params = new URLSearchParams();

  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  appendSortParams(params, sort);

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/admin/cotacoes?${query}` : "/admin/cotacoes";
}

function buildQuotesSortHref(filters: AdminQuoteFilters, currentSort: AdminQuoteSort, sortKey: string) {
  const nextDirection = currentSort.sort === sortKey && currentSort.direction === "asc" ? "desc" : "asc";

  return buildQuotesHref({
    filters,
    sort: {
      sort: sortKey as AdminQuoteSortKey,
      direction: nextDirection
    }
  });
}

function hasActiveFilters(filters: AdminQuoteFilters) {
  return Boolean(
    filters.client ||
      filters.product ||
      filters.hsCode ||
      filters.supplier ||
      filters.situation ||
      filters.dateFrom ||
      filters.dateTo
  );
}

export default async function QuotesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = parsePage(params);
  const sort = parseSort(params);
  const quotesPage = await getAdminQuotes(filters, {
    page,
    perPage: QUOTES_PER_PAGE
  }, sort);
  const quotes = quotesPage.rows;
  const totalPages = Math.max(1, Math.ceil(quotesPage.total / QUOTES_PER_PAGE));
  const firstItem = quotesPage.total === 0 ? 0 : (page - 1) * QUOTES_PER_PAGE + 1;
  const lastItem = Math.min(page * QUOTES_PER_PAGE, quotesPage.total);
  const clearFiltersHref = buildQuotesHref({ sort });

  const columns: DataTableColumn<(typeof quotes)[number]>[] = [
    {
      key: "created_at",
      header: "Data",
      sortable: true,
      sortKey: "created_at",
      render: (row) => formatDateTime(row.created_at)
    },
    {
      key: "client",
      header: "Cliente",
      render: (row) => getClientLabel(row)
    },
    {
      key: "product_name",
      header: "Produto",
      sortable: true,
      sortKey: "product_name",
      render: (row) => (
        <Link href={`/admin/cotacoes/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
          {row.product_name}
        </Link>
      )
    },
    {
      key: "hs_code",
      header: "HS/NCM",
      sortable: true,
      sortKey: "hs_code",
      render: (row) => row.hs_code || "-"
    },
    {
      key: "fob_total_usd",
      header: "FOB total",
      sortable: true,
      sortKey: "fob_total_usd",
      render: (row) => formatMoney(row.fob_total_usd, "USD")
    },
    {
      key: "quantity",
      header: "Quantidade",
      sortable: true,
      sortKey: "quantity",
      render: (row) => formatNumber(row.quantity)
    },
    {
      key: "total_cost_rpx_brl",
      header: "Via RPX",
      sortable: true,
      sortKey: "total_cost_rpx_brl",
      render: (row) => formatMoney(row.total_cost_rpx_brl)
    },
    {
      key: "savings_brl",
      header: "Economia",
      sortable: true,
      sortKey: "savings_brl",
      render: (row) => formatMoney(row.savings_brl)
    },
    {
      key: "status",
      header: "Situação",
      sortable: true,
      sortKey: "status",
      render: (row) => <StatusBadge variant={getSituationVariant(row)}>{getSituation(row)}</StatusBadge>
    },
    {
      key: "actions",
      header: "Ações",
      render: (row) => (
        <Link href={`/admin/cotacoes/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
          Abrir
        </Link>
      )
    }
  ];

  return (
    <>
      <CrudHeaderWithFilters
        title="Cotações"
        description="Cotações recebidas pela calculadora do cliente, com leitura administrativa dos dados enviados."
        filtersInitiallyOpen={hasActiveFilters(filters)}
      >
        <QuoteFilters filters={filters} sort={sort} clearHref={clearFiltersHref} />
      </CrudHeaderWithFilters>
      <div className="grid gap-8">
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-rpx-ink">{quotesPage.total}</span>{" "}
            {quotesPage.total === 1 ? "cotação encontrada" : "cotações encontradas"}
          </p>
          <p>
            Exibindo {firstItem}-{lastItem} de {quotesPage.total}
          </p>
        </div>
        <DataTable
          columns={columns}
          rows={quotes}
          emptyLabel="Nenhuma cotação encontrada com os filtros informados."
          sort={{
            key: sort.sort,
            direction: sort.direction
          }}
          getSortHref={(sortKey) => buildQuotesSortHref(filters, sort, sortKey)}
        />
        {totalPages > 1 ? (
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-600">
              Página <span className="font-semibold text-rpx-ink">{page}</span> de{" "}
              <span className="font-semibold text-rpx-ink">{totalPages}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildQuotesHref({ filters, sort, page: Math.max(1, page - 1) })}
                aria-disabled={page <= 1}
                className={`inline-flex min-h-10 items-center justify-center rounded-md border px-3 py-2 font-semibold transition ${
                  page <= 1
                    ? "pointer-events-none border-slate-200 text-slate-300"
                    : "border-rpx-blue/20 text-rpx-blue hover:bg-rpx-sky"
                }`}
              >
                Anterior
              </Link>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={buildQuotesHref({ filters, sort, page: pageNumber })}
                  aria-current={pageNumber === page ? "page" : undefined}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 py-2 font-semibold transition ${
                    pageNumber === page
                      ? "border-rpx-blue bg-rpx-blue text-white"
                      : "border-rpx-blue/20 text-rpx-blue hover:bg-rpx-sky"
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}
              <Link
                href={buildQuotesHref({ filters, sort, page: Math.min(totalPages, page + 1) })}
                aria-disabled={page >= totalPages}
                className={`inline-flex min-h-10 items-center justify-center rounded-md border px-3 py-2 font-semibold transition ${
                  page >= totalPages
                    ? "pointer-events-none border-slate-200 text-slate-300"
                    : "border-rpx-blue/20 text-rpx-blue hover:bg-rpx-sky"
                }`}
              >
                Próxima
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
