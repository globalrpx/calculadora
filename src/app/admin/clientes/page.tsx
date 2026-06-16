import Link from "next/link";
import { getAdminClients, type AdminClientFilters } from "@/lib/admin/queries";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ClientFilters } from "@/components/admin/ClientFilters";
import { ClientRowActions } from "@/components/admin/ClientRowActions";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function parseFilters(params: Record<string, string | string[] | undefined>): AdminClientFilters {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  return {
    name: read("name"),
    company: read("company"),
    source: read("source"),
    status: read("status"),
    dateFrom: read("dateFrom"),
    dateTo: read("dateTo")
  };
}

function mapSource(source: string) {
  return source === "site" ? "Site" : "Painel admin";
}

function mapStatus(status: string) {
  return status === "active" ? "Ativo" : "Inativo";
}

function hasActiveFilters(filters: AdminClientFilters) {
  return Boolean(filters.name || filters.company || filters.source || filters.status || filters.dateFrom || filters.dateTo);
}

export default async function ClientsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const clients = await getAdminClients(filters);

  const columns: DataTableColumn<(typeof clients)[number]>[] = [
    {
      key: "company_name",
      header: "Empresa",
      render: (row) => (
        <Link href={`/admin/clientes/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
          {row.company_name || "Pessoa física"}
        </Link>
      )
    },
    {
      key: "contact_name",
      header: "Responsável",
      render: (row) => row.contact_name || "-"
    },
    {
      key: "contact_email",
      header: "E-mail",
      render: (row) => row.contact_email || "-"
    },
    {
      key: "source",
      header: "Origem",
      render: (row) => mapSource(row.source)
    },
    {
      key: "status",
      header: "Status",
      render: (row) => mapStatus(row.status)
    },
    {
      key: "created_at",
      header: "Cadastro",
      render: (row) => formatDate(row.created_at)
    },
    {
      key: "actions",
      header: "Ações",
      render: (row) => <ClientRowActions clientId={row.id} clientLabel={row.company_name || row.contact_name || "sem nome"} />
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
        <ClientFilters filters={filters} />
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
          Cliente desativado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.error ? (
        <DismissibleAlert variant="error">
          Não foi possível concluir a operação. Revise os dados e tente novamente.
        </DismissibleAlert>
      ) : null}
      <div className="grid gap-8">
        <DataTable columns={columns} rows={clients} emptyLabel="Nenhum cliente encontrado com os filtros informados." />
      </div>
    </>
  );
}
