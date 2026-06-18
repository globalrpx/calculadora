import Link from "next/link";
import {
  adminUserSortColumns,
  defaultAdminUserSort,
  getAdminUsers,
  type AdminSortDirection,
  type AdminUserFilters,
  type AdminUserSort,
  type AdminUserSortKey
} from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/get-session-profile";
import { AdminUserFilters as AdminUserFiltersForm } from "@/components/admin/AdminUserFilters";
import { AdminUserRowActions } from "@/components/admin/AdminUserRowActions";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { StatusBadge } from "@/components/ui/StatusBadge";

const USERS_PER_PAGE = 20;

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

function parseFilters(params: Record<string, string | string[] | undefined>): AdminUserFilters {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  return {
    name: read("name"),
    email: read("email"),
    status: read("status"),
    dateFrom: read("dateFrom"),
    dateTo: read("dateTo")
  };
}

function parsePage(params: Record<string, string | string[] | undefined>) {
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
}

function parseSort(params: Record<string, string | string[] | undefined>): AdminUserSort {
  const sort = typeof params.sort === "string" ? params.sort : "";
  const direction = typeof params.direction === "string" ? params.direction : "";

  if (
    sort in adminUserSortColumns &&
    (direction === "asc" || direction === "desc")
  ) {
    return {
      sort: sort as AdminUserSortKey,
      direction: direction as AdminSortDirection
    };
  }

  return defaultAdminUserSort;
}

function appendSortParams(params: URLSearchParams, sort: AdminUserSort) {
  if (sort.sort !== defaultAdminUserSort.sort || sort.direction !== defaultAdminUserSort.direction) {
    params.set("sort", sort.sort);
    params.set("direction", sort.direction);
  }
}

function buildUsersHref({
  filters,
  sort,
  page = 1
}: {
  filters?: AdminUserFilters;
  sort: AdminUserSort;
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
  return query ? `/admin/usuarios?${query}` : "/admin/usuarios";
}

function buildUsersSortHref(filters: AdminUserFilters, currentSort: AdminUserSort, sortKey: string) {
  const nextDirection = currentSort.sort === sortKey && currentSort.direction === "asc" ? "desc" : "asc";

  return buildUsersHref({
    filters,
    sort: {
      sort: sortKey as AdminUserSortKey,
      direction: nextDirection
    }
  });
}

function mapRole(role: string) {
  return role === "admin" ? "Admin" : role;
}

function mapStatus(status: string) {
  return status === "active" ? "Ativo" : "Inativo";
}

function mapStatusVariant(status: string) {
  return status === "active" ? "success" : "neutral";
}

function hasActiveFilters(filters: AdminUserFilters) {
  return Boolean(filters.name || filters.email || filters.status || filters.dateFrom || filters.dateTo);
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = parsePage(params);
  const sort = parseSort(params);
  const [{ appUser }, usersPage] = await Promise.all([
    requireRole("admin"),
    getAdminUsers(filters, {
      page,
      perPage: USERS_PER_PAGE
    }, sort)
  ]);
  const users = usersPage.rows;
  const totalPages = Math.max(1, Math.ceil(usersPage.total / USERS_PER_PAGE));
  const firstItem = usersPage.total === 0 ? 0 : (page - 1) * USERS_PER_PAGE + 1;
  const lastItem = Math.min(page * USERS_PER_PAGE, usersPage.total);
  const clearFiltersHref = buildUsersHref({ sort });
  const postActionPage = users.length === 1 && page > 1 ? page - 1 : page;
  const postActionRedirectTo = buildUsersHref({ filters, sort, page: postActionPage });

  const columns: DataTableColumn<(typeof users)[number]>[] = [
    {
      key: "name",
      header: "Nome",
      sortable: true,
      sortKey: "name",
      render: (row) => (
        <Link href={`/admin/usuarios/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
          {row.name || "Admin sem nome"}
        </Link>
      )
    },
    {
      key: "email",
      header: "E-mail",
      sortable: true,
      sortKey: "email"
    },
    {
      key: "role",
      header: "Papel",
      render: (row) => mapRole(row.role)
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
        <AdminUserRowActions
          userId={row.id}
          userLabel={row.name || row.email}
          status={row.status}
          redirectTo={postActionRedirectTo}
          isCurrentUser={row.id === appUser.id}
        />
      )
    }
  ];

  return (
    <>
      <CrudHeaderWithFilters
        title="Usuários"
        description="Gerencie as contas administrativas que operam o painel da Global RPX."
        newHref="/admin/usuarios/novo"
        newLabel="Novo usuário"
        filtersInitiallyOpen={hasActiveFilters(filters)}
      >
        <AdminUserFiltersForm filters={filters} sort={sort} clearHref={clearFiltersHref} />
      </CrudHeaderWithFilters>
      {params.created ? (
        <DismissibleAlert variant="success">
          Usuário administrativo criado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.updated ? (
        <DismissibleAlert variant="success">
          Usuário administrativo atualizado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.deactivated ? (
        <DismissibleAlert variant="warning">
          Usuário administrativo inativado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.reactivated ? (
        <DismissibleAlert variant="success">
          Usuário administrativo reativado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.selfDeactivate ? (
        <DismissibleAlert variant="warning">
          Você não pode inativar a própria conta administrativa.
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
            <span className="font-bold text-rpx-ink">{usersPage.total}</span>{" "}
            {usersPage.total === 1 ? "usuário encontrado" : "usuários encontrados"}
          </p>
          <p>
            Exibindo {firstItem}-{lastItem} de {usersPage.total}
          </p>
        </div>
        <DataTable
          columns={columns}
          rows={users}
          emptyLabel="Nenhum usuário administrativo encontrado com os filtros informados."
          sort={{
            key: sort.sort,
            direction: sort.direction
          }}
          getSortHref={(sortKey) => buildUsersSortHref(filters, sort, sortKey)}
        />
        {totalPages > 1 ? (
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-600">
              Página <span className="font-semibold text-rpx-ink">{page}</span> de{" "}
              <span className="font-semibold text-rpx-ink">{totalPages}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildUsersHref({ filters, sort, page: Math.max(1, page - 1) })}
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
                  href={buildUsersHref({ filters, sort, page: pageNumber })}
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
                href={buildUsersHref({ filters, sort, page: Math.min(totalPages, page + 1) })}
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
