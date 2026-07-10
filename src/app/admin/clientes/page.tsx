import Link from "next/link";
import {
  adminClientSortColumns,
  defaultAdminClientSort,
  getAdminClients,
  type AdminClientFilters,
  type AdminClientSort,
  type AdminClientSortKey,
  type AdminSortDirection
} from "@/lib/admin/queries";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ClientFilters } from "@/components/admin/ClientFilters";
import { ClientRowActions } from "@/components/admin/ClientRowActions";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";
import { StatusBadge } from "@/components/ui/StatusBadge";

function formatDate(value: string) {
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

const CLIENTS_PER_PAGE = 20;

function parseFilters(params: Record<string, string | string[] | undefined>): AdminClientFilters {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  return {
    name: read("name"),
    company: read("company"),
    source: read("source"),
    clientType: read("clientType"),
    status: read("status"),
    dateFrom: read("dateFrom"),
    dateTo: read("dateTo")
  };
}

function parsePage(params: Record<string, string | string[] | undefined>) {
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
}

function parseSort(params: Record<string, string | string[] | undefined>): AdminClientSort {
  const sort = typeof params.sort === "string" ? params.sort : "";
  const direction = typeof params.direction === "string" ? params.direction : "";

  if (
    sort in adminClientSortColumns &&
    (direction === "asc" || direction === "desc")
  ) {
    return {
      sort: sort as AdminClientSortKey,
      direction: direction as AdminSortDirection
    };
  }

  return defaultAdminClientSort;
}

function appendSortParams(params: URLSearchParams, sort: AdminClientSort) {
  if (sort.sort !== defaultAdminClientSort.sort || sort.direction !== defaultAdminClientSort.direction) {
    params.set("sort", sort.sort);
    params.set("direction", sort.direction);
  }
}

function buildClientsHref({
  filters,
  sort,
  page = 1
}: {
  filters?: AdminClientFilters;
  sort: AdminClientSort;
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
  return query ? `/admin/clientes?${query}` : "/admin/clientes";
}

function buildClientsSortHref(filters: AdminClientFilters, currentSort: AdminClientSort, sortKey: string) {
  const nextDirection = currentSort.sort === sortKey && currentSort.direction === "asc" ? "desc" : "asc";

  return buildClientsHref({
    filters,
    sort: {
      sort: sortKey as AdminClientSortKey,
      direction: nextDirection
    }
  });
}

function mapSource(source: string) {
  return source === "site" ? "Site" : "Painel admin";
}

function mapStatus(status: string) {
  return status === "active" ? "Ativo" : "Inativo";
}

function mapStatusVariant(status: string) {
  return status === "active" ? "success" : "neutral";
}

function mapClientType(clientType: string) {
  return clientType === "lead" ? "Lead" : "Cliente";
}

function mapClientTypeVariant(clientType: string): "warning" | "info" {
  return clientType === "lead" ? "warning" : "info";
}

function hasActiveFilters(filters: AdminClientFilters) {
  return Boolean(filters.name || filters.company || filters.source || filters.clientType || filters.status || filters.dateFrom || filters.dateTo);
}

export default async function ClientsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = parsePage(params);
  const sort = parseSort(params);
  const clientsPage = await getAdminClients(filters, {
    page,
    perPage: CLIENTS_PER_PAGE
  }, sort);
  const clients = clientsPage.rows;
  const totalPages = Math.max(1, Math.ceil(clientsPage.total / CLIENTS_PER_PAGE));
  const firstItem = clientsPage.total === 0 ? 0 : (page - 1) * CLIENTS_PER_PAGE + 1;
  const lastItem = Math.min(page * CLIENTS_PER_PAGE, clientsPage.total);
  const postDeletePage = clients.length === 1 && page > 1 ? page - 1 : page;
  const postDeleteRedirectTo = buildClientsHref({ filters, sort, page: postDeletePage });
  const clearFiltersHref = buildClientsHref({ sort });

  const columns: DataTableColumn<(typeof clients)[number]>[] = [
    {
      key: "company_name",
      header: "Empresa",
      sortable: true,
      sortKey: "company_name",
      render: (row) => (
        <Link href={`/admin/clientes/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
          {row.company_name || "Pessoa física"}
        </Link>
      )
    },
    {
      key: "contact_name",
      header: "Responsável",
      sortable: true,
      sortKey: "responsible_name",
      render: (row) => row.contact_name || "-"
    },
    {
      key: "contact_email",
      header: "E-mail",
      sortable: true,
      sortKey: "email",
      render: (row) => row.contact_email || "-"
    },
    {
      key: "source",
      header: "Origem",
      sortable: true,
      sortKey: "source",
      render: (row) => mapSource(row.source)
    },
    {
      key: "client_type",
      header: "Tipo",
      sortable: true,
      sortKey: "client_type",
      render: (row) => <StatusBadge variant={mapClientTypeVariant(row.client_type)}>{mapClientType(row.client_type)}</StatusBadge>
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortKey: "status",
      render: (row) => <StatusBadge variant={mapStatusVariant(row.status)}>{mapStatus(row.status)}</StatusBadge>
    },
    {
      key: "created_at",
      header: "Cadastro",
      sortable: true,
      sortKey: "created_at",
      render: (row) => formatDate(row.created_at)
    },
    {
      key: "actions",
      header: "Ações",
      render: (row) => (
        <ClientRowActions
          clientId={row.id}
          clientLabel={row.company_name || row.contact_name || "sem nome"}
          redirectTo={postDeleteRedirectTo}
        />
      )
    }
  ];

  return (
    <>
      <CrudHeaderWithFilters
        title="Clientes"
        description="Lista consolidada dos clientes que chegaram pelo site e dos cadastros criados pela equipe."
        newHref="/admin/clientes/novo"
        filtersInitiallyOpen={hasActiveFilters(filters)}
      >
        <ClientFilters filters={filters} sort={sort} clearHref={clearFiltersHref} />
      </CrudHeaderWithFilters>
      {params.created ? (
        <DismissibleAlert variant="success">
          Cliente cadastrado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.updated ? (
        <DismissibleAlert variant="success">
          Cliente atualizado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.deleted ? (
        <DismissibleAlert variant="warning">
          Cliente inativado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.error ? (
        <DismissibleAlert variant="error">
          Não foi possível concluir a operação. Revise os dados e tente novamente.
        </DismissibleAlert>
      ) : null}
      <div className="grid gap-8">
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-rpx-ink">{clientsPage.total}</span>{" "}
            {clientsPage.total === 1 ? "cliente encontrado" : "clientes encontrados"}
          </p>
          <p>
            Exibindo {firstItem}-{lastItem} de {clientsPage.total}
          </p>
        </div>
        <DataTable
          columns={columns}
          rows={clients}
          emptyLabel="Nenhum cliente encontrado com os filtros informados."
          sort={{
            key: sort.sort,
            direction: sort.direction
          }}
          getSortHref={(sortKey) => buildClientsSortHref(filters, sort, sortKey)}
        />
        {totalPages > 1 ? (
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-600">
              Página <span className="font-semibold text-rpx-ink">{page}</span> de{" "}
              <span className="font-semibold text-rpx-ink">{totalPages}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildClientsHref({ filters, sort, page: Math.max(1, page - 1) })}
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
                  href={buildClientsHref({ filters, sort, page: pageNumber })}
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
                href={buildClientsHref({ filters, sort, page: Math.min(totalPages, page + 1) })}
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
