import Link from "next/link";
import {
  adminSimulationSortColumns,
  defaultAdminSimulationSort,
  getAdminSimulations,
  type AdminSimulationFilters,
  type AdminSimulationSort,
  type AdminSimulationSortKey,
  type AdminSortDirection
} from "@/lib/admin/queries";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";
import { SimulationFilters } from "@/components/admin/SimulationFilters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { simulationStatusOptions } from "@/lib/admin/simulation-form-state";
import { SimulationFilesCell } from "@/components/admin/SimulationFilesCell";

const SIMULATIONS_PER_PAGE = 20;

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

function mapStatus(status: string) {
  return simulationStatusOptions.find((option) => option.value === status)?.label ?? status;
}

function mapStatusVariant(status: string) {
  switch (status) {
    case "finalizado":
    case "published":
      return "success";
    case "em_producao":
      return "info";
    case "cancelado":
      return "danger";
    case "aguardando":
    case "draft":
    default:
      return "neutral";
  }
}

function getClientLabel(row: Awaited<ReturnType<typeof getAdminSimulations>>["rows"][number]) {
  return row.client?.trade_name || row.client?.company_name || row.client?.contact_name || "-";
}

function parseFilters(params: Record<string, string | string[] | undefined>): AdminSimulationFilters {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  return {
    client: read("client"),
    product: read("product"),
    hsCode: read("hsCode"),
    supplier: read("supplier"),
    status: read("status"),
    dateFrom: read("dateFrom"),
    dateTo: read("dateTo")
  };
}

function parsePage(params: Record<string, string | string[] | undefined>) {
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
}

function parseSort(params: Record<string, string | string[] | undefined>): AdminSimulationSort {
  const sort = typeof params.sort === "string" ? params.sort : "";
  const direction = typeof params.direction === "string" ? params.direction : "";

  if (
    sort in adminSimulationSortColumns &&
    (direction === "asc" || direction === "desc")
  ) {
    return {
      sort: sort as AdminSimulationSortKey,
      direction: direction as AdminSortDirection
    };
  }

  return defaultAdminSimulationSort;
}

function appendSortParams(params: URLSearchParams, sort: AdminSimulationSort) {
  if (sort.sort !== defaultAdminSimulationSort.sort || sort.direction !== defaultAdminSimulationSort.direction) {
    params.set("sort", sort.sort);
    params.set("direction", sort.direction);
  }
}

function buildSimulationsHref({
  filters,
  sort,
  page = 1
}: {
  filters?: AdminSimulationFilters;
  sort: AdminSimulationSort;
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
  return query ? `/admin/simulacoes?${query}` : "/admin/simulacoes";
}

function buildSimulationsSortHref(filters: AdminSimulationFilters, currentSort: AdminSimulationSort, sortKey: string) {
  const nextDirection = currentSort.sort === sortKey && currentSort.direction === "asc" ? "desc" : "asc";

  return buildSimulationsHref({
    filters,
    sort: {
      sort: sortKey as AdminSimulationSortKey,
      direction: nextDirection
    }
  });
}

function hasActiveFilters(filters: AdminSimulationFilters) {
  return Boolean(
    filters.client ||
      filters.product ||
      filters.hsCode ||
      filters.supplier ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo
  );
}

export default async function SimulationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = parsePage(params);
  const sort = parseSort(params);
  const simulationsPage = await getAdminSimulations(filters, {
    page,
    perPage: SIMULATIONS_PER_PAGE
  }, sort);
  const simulations = simulationsPage.rows;
  const totalPages = Math.max(1, Math.ceil(simulationsPage.total / SIMULATIONS_PER_PAGE));
  const firstItem = simulationsPage.total === 0 ? 0 : (page - 1) * SIMULATIONS_PER_PAGE + 1;
  const lastItem = Math.min(page * SIMULATIONS_PER_PAGE, simulationsPage.total);
  const clearFiltersHref = buildSimulationsHref({ sort });

  const columns: DataTableColumn<(typeof simulations)[number]>[] = [
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
      key: "title",
      header: "Produto",
      sortable: true,
      sortKey: "title",
      render: (row) => (
        <Link href={`/admin/simulacoes/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
          {row.quote?.product_name || row.title}
        </Link>
      )
    },
    {
      key: "hs_code",
      header: "HS/NCM",
      render: (row) => row.quote?.hs_code || "-"
    },
    {
      key: "fob_total_usd",
      header: "FOB",
      render: (row) => (row.quote ? formatMoney(row.quote.fob_total_usd, "USD") : "-")
    },
    {
      key: "quantity",
      header: "Quantidade",
      render: (row) => (row.quote ? formatNumber(row.quote.quantity) : "-")
    },
    {
      key: "supplier",
      header: "Fornecedor",
      render: (row) => row.quote?.supplier_name || "-"
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortKey: "status",
      render: (row) => <StatusBadge variant={mapStatusVariant(row.status)}>{mapStatus(row.status)}</StatusBadge>
    },
    {
      key: "file",
      header: "Arquivo",
      render: (row) => <SimulationFilesCell uploads={row.uploads} />
    },
    {
      key: "actions",
      header: "Ações",
      render: (row) => (
        <div className="flex flex-wrap gap-3 whitespace-nowrap">
          <Link href={`/admin/simulacoes/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
            Editar
          </Link>
        </div>
      )
    }
  ];

  return (
    <>
      <CrudHeaderWithFilters
        title="Simulações"
        description="Gerencie solicitações e simulações vinculadas às cotações dos clientes."
        newHref="/admin/simulacoes/nova"
        newLabel="Nova simulação"
        filtersInitiallyOpen={hasActiveFilters(filters)}
      >
        <SimulationFilters filters={filters} sort={sort} clearHref={clearFiltersHref} />
      </CrudHeaderWithFilters>
      {params.created ? (
        <DismissibleAlert variant="success">
          Simulação criada com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.updated ? (
        <DismissibleAlert variant="success">
          Simulação atualizada com sucesso.
        </DismissibleAlert>
      ) : null}
      <div className="grid gap-8">
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-rpx-ink">{simulationsPage.total}</span>{" "}
            {simulationsPage.total === 1 ? "simulação encontrada" : "simulações encontradas"}
          </p>
          <p>
            Exibindo {firstItem}-{lastItem} de {simulationsPage.total}
          </p>
        </div>
        <DataTable
          columns={columns}
          rows={simulations}
          emptyLabel="Nenhuma simulação encontrada com os filtros informados."
          sort={{
            key: sort.sort,
            direction: sort.direction
          }}
          getSortHref={(sortKey) => buildSimulationsSortHref(filters, sort, sortKey)}
        />
        {totalPages > 1 ? (
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-600">
              Página <span className="font-semibold text-rpx-ink">{page}</span> de{" "}
              <span className="font-semibold text-rpx-ink">{totalPages}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildSimulationsHref({ filters, sort, page: Math.max(1, page - 1) })}
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
                  href={buildSimulationsHref({ filters, sort, page: pageNumber })}
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
                href={buildSimulationsHref({ filters, sort, page: Math.min(totalPages, page + 1) })}
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
