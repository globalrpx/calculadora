import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  invoiceParametrizationOperationTypeLabels,
  invoiceParametrizationTaxRegimeLabels
} from "@/features/final-simulations/fiscal-labels";
import { InvoiceParametrizationRowActions } from "@/features/final-simulations/InvoiceParametrizationRowActions";
import { listInvoiceParametrizations } from "@/features/final-simulations/queries";
import {
  invoiceParametrizationOperationTypeValues,
  type InvoiceParametrization,
  type InvoiceParametrizationListFilters
} from "@/features/final-simulations/types";

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseFilters(params: Record<string, string | string[] | undefined>): InvoiceParametrizationListFilters {
  const status = readParam(params, "isActive");

  return {
    search: readParam(params, "search"),
    operationType: readParam(params, "operationType"),
    isActive: status === "active" ? true : status === "inactive" ? false : undefined
  };
}

function statusValue(filters: InvoiceParametrizationListFilters) {
  if (filters.isActive === true) {
    return "active";
  }

  if (filters.isActive === false) {
    return "inactive";
  }

  return "";
}

function hasActiveFilters(filters: InvoiceParametrizationListFilters) {
  return Boolean(filters.search || filters.operationType || typeof filters.isActive === "boolean");
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value);
}

function scopeLabel(row: InvoiceParametrization) {
  const values = [row.customer_name, row.branch_name].filter(Boolean);
  return values.length > 0 ? values.join(" / ") : "-";
}

export default async function InvoiceParametrizationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const rows = await listInvoiceParametrizations(filters);

  const columns: DataTableColumn<InvoiceParametrization>[] = [
    { key: "code", header: "Código", render: (row) => <span className="font-semibold text-rpx-ink">{row.code}</span> },
    { key: "operation_type", header: "Tipo", render: (row) => invoiceParametrizationOperationTypeLabels[row.operation_type] },
    { key: "description", header: "Descrição", render: (row) => row.description },
    { key: "cfop", header: "CFOP", render: (row) => row.cfop || "-" },
    {
      key: "tax_regime",
      header: "Regime",
      render: (row) => (row.tax_regime ? invoiceParametrizationTaxRegimeLabels[row.tax_regime] : "-")
    },
    { key: "icms_rate", header: "ICMS", render: (row) => `${formatPercent(row.icms_rate)}%` },
    { key: "scope", header: "Cliente/filial", render: scopeLabel },
    {
      key: "is_active",
      header: "Status",
      render: (row) => <StatusBadge variant={row.is_active ? "success" : "neutral"}>{row.is_active ? "Ativo" : "Inativo"}</StatusBadge>
    },
    {
      key: "actions",
      header: "Ações",
      render: (row) => (
        <InvoiceParametrizationRowActions
          invoiceParametrizationId={row.id}
          label={`${row.code} - ${row.description}`}
          isActive={row.is_active}
        />
      )
    }
  ];

  return (
    <>
      <CrudHeaderWithFilters
        title="Parametrizações Fiscais"
        description="Cadastros fiscais para NF entrada e saída usados nas Simulações Finais."
        newHref="/admin/cadastros/parametrizacoes-fiscais/nova"
        newLabel="Nova parametrização"
        filtersInitiallyOpen={hasActiveFilters(filters)}
      >
        <Card title="Filtros">
          <form action="/admin/cadastros/parametrizacoes-fiscais" className="mt-4 grid gap-4 lg:grid-cols-3">
            <FormField label="Busca">
              <TextInput name="search" defaultValue={filters.search ?? ""} />
            </FormField>
            <FormField label="Tipo">
              <SelectInput name="operationType" defaultValue={filters.operationType ?? ""}>
                <option value="">Todos</option>
                {invoiceParametrizationOperationTypeValues.map((value) => (
                  <option key={value} value={value}>
                    {invoiceParametrizationOperationTypeLabels[value]}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Status">
              <SelectInput name="isActive" defaultValue={statusValue(filters)}>
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </SelectInput>
            </FormField>
            <div className="flex flex-col-reverse gap-3 lg:col-span-3 lg:flex-row lg:justify-end">
              <ButtonLink href="/admin/cadastros/parametrizacoes-fiscais" variant="secondary" className="w-full lg:w-auto">
                Limpar
              </ButtonLink>
              <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-rpx-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-rpx-navy">
                Filtrar
              </button>
            </div>
          </form>
        </Card>
      </CrudHeaderWithFilters>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <span className="font-bold text-rpx-ink">{rows.length}</span> parametrizações encontradas.
      </div>

      <DataTable columns={columns} rows={rows} emptyLabel="Nenhuma parametrização fiscal encontrada." />
    </>
  );
}
