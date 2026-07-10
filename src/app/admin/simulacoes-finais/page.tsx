import Link from "next/link";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listFinalSimulations } from "@/features/final-simulations/queries";
import type { FinalSimulationListFilters, FinalSimulationListRow } from "@/features/final-simulations/types";

const FINAL_SIMULATIONS_PER_PAGE = 20;

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  needs_adjustment: "Ajuste necessário",
  approved: "Aprovada",
  sent_to_customer: "Enviada ao cliente",
  archived: "Arquivada"
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function mapStatusVariant(status: string): "success" | "neutral" | "warning" | "info" {
  switch (status) {
    case "approved":
    case "sent_to_customer":
      return "success";
    case "in_review":
      return "info";
    case "needs_adjustment":
      return "warning";
    case "archived":
      return "neutral";
    case "draft":
    default:
      return "neutral";
  }
}

function parseFilters(params: Record<string, string | string[] | undefined>): FinalSimulationListFilters {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  return {
    code: read("code"),
    number: read("number"),
    customer: read("customer"),
    status: read("status")
  };
}

function parsePage(params: Record<string, string | string[] | undefined>) {
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
}

function buildHref(filters: FinalSimulationListFilters, page = 1) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/admin/simulacoes-finais?${query}` : "/admin/simulacoes-finais";
}

function hasActiveFilters(filters: FinalSimulationListFilters) {
  return Boolean(filters.code || filters.number || filters.customer || filters.status);
}

export default async function FinalSimulationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = parsePage(params);
  const simulationsPage = await listFinalSimulations(filters, {
    page,
    perPage: FINAL_SIMULATIONS_PER_PAGE
  });
  const simulations = simulationsPage.rows;
  const totalPages = Math.max(1, Math.ceil(simulationsPage.total / FINAL_SIMULATIONS_PER_PAGE));
  const firstItem = simulationsPage.total === 0 ? 0 : (page - 1) * FINAL_SIMULATIONS_PER_PAGE + 1;
  const lastItem = Math.min(page * FINAL_SIMULATIONS_PER_PAGE, simulationsPage.total);

  const columns: DataTableColumn<FinalSimulationListRow>[] = [
    {
      key: "code",
      header: "Código",
      render: (row) => (
        <Link href={`/admin/simulacoes-finais/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
          {row.code || "-"}
        </Link>
      )
    },
    {
      key: "number",
      header: "Número",
      render: (row) => row.number ?? "-"
    },
    {
      key: "customer_name",
      header: "Cliente",
      render: (row) => row.customer_name || "-"
    },
    {
      key: "quote_date",
      header: "Data da cotação",
      render: (row) => formatDate(row.quote_date)
    },
    {
      key: "origin",
      header: "Origem",
      render: (row) => row.origin || "-"
    },
    {
      key: "destination",
      header: "Destino",
      render: (row) => row.destination || "-"
    },
    {
      key: "import_modality",
      header: "Modalidade",
      render: (row) => row.import_modality || "-"
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge variant={mapStatusVariant(row.status)}>{statusLabels[row.status] ?? row.status}</StatusBadge>
    },
    {
      key: "updated_at",
      header: "Atualizado em",
      render: (row) => formatDateTime(row.updated_at)
    },
    {
      key: "actions",
      header: "Ações",
      render: (row) => (
        <div className="flex flex-wrap gap-3 whitespace-nowrap">
          <Link href={`/admin/simulacoes-finais/${row.id}`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
            Abrir
          </Link>
          <Link href={`/admin/simulacoes-finais/${row.id}/editar`} className="font-semibold text-rpx-blue transition hover:text-rpx-navy">
            Editar
          </Link>
        </div>
      )
    }
  ];

  return (
    <>
      <CrudHeaderWithFilters
        title="Simulações finais"
        description="Listagem inicial do novo módulo de simulações finais. Produtos, despesas e documentos entram nas próximas etapas."
        newHref="/admin/simulacoes-finais/nova"
        newLabel="Nova simulação final"
        filtersInitiallyOpen={hasActiveFilters(filters)}
      >
        <Card title="Filtros">
          <form action="/admin/simulacoes-finais" className="mt-4 grid gap-4 lg:grid-cols-4">
            <FormField label="Código">
              <TextInput name="code" defaultValue={filters.code ?? ""} />
            </FormField>
            <FormField label="Número">
              <TextInput name="number" defaultValue={filters.number ?? ""} />
            </FormField>
            <FormField label="Cliente">
              <TextInput name="customer" defaultValue={filters.customer ?? ""} />
            </FormField>
            <FormField label="Status">
              <SelectInput name="status" defaultValue={filters.status ?? ""}>
                <option value="">Todos</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <div className="flex flex-col-reverse gap-3 lg:col-span-4 lg:flex-row lg:justify-end">
              <ButtonLink href="/admin/simulacoes-finais" variant="secondary" className="w-full lg:w-auto">
                Limpar
              </ButtonLink>
              <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-rpx-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-rpx-navy">
                Filtrar
              </button>
            </div>
          </form>
        </Card>
      </CrudHeaderWithFilters>

      <div className="mb-4 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Mostrando {firstItem}-{lastItem} de {simulationsPage.total} simulações finais.
        </p>
        <p>
          Página {page} de {totalPages}
        </p>
      </div>

      <DataTable columns={columns} rows={simulations} emptyLabel="Nenhuma simulação final encontrada." />

      <div className="mt-4 flex justify-end gap-3">
        {page > 1 ? (
          <ButtonLink href={buildHref(filters, page - 1)} variant="secondary">
            Anterior
          </ButtonLink>
        ) : null}
        {page < totalPages ? (
          <ButtonLink href={buildHref(filters, page + 1)} variant="secondary">
            Próxima
          </ButtonLink>
        ) : null}
      </div>
    </>
  );
}
