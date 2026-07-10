import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { expensePresetTransportModeLabels } from "@/features/final-simulations/expense-labels";
import { ExpensePresetRowActions } from "@/features/final-simulations/ExpenseMasterRowActions";
import { listExpensePresets } from "@/features/final-simulations/queries";
import { expensePresetTransportModeValues, type ExpensePreset } from "@/features/final-simulations/types";

type ExpensePresetFilters = {
  name?: string;
  transportMode?: string;
  isActive?: string;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseFilters(params: Record<string, string | string[] | undefined>): ExpensePresetFilters {
  return {
    name: readParam(params, "name"),
    transportMode: readParam(params, "transportMode"),
    isActive: readParam(params, "isActive")
  };
}

function hasActiveFilters(filters: ExpensePresetFilters) {
  return Boolean(filters.name || filters.transportMode || filters.isActive);
}

function filterExpensePresets(rows: ExpensePreset[], filters: ExpensePresetFilters) {
  return rows.filter((row) => {
    if (filters.name && !row.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    if (filters.transportMode && row.transport_mode !== filters.transportMode) {
      return false;
    }

    if (filters.isActive === "active" && !row.is_active) {
      return false;
    }

    if (filters.isActive === "inactive" && row.is_active) {
      return false;
    }

    return true;
  });
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function ExpensePresetsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const rows = filterExpensePresets(await listExpensePresets(), filters);

  const columns: DataTableColumn<ExpensePreset>[] = [
    { key: "name", header: "Nome", render: (row) => <span className="font-semibold text-rpx-ink">{row.name}</span> },
    { key: "transport_mode", header: "Via transporte", render: (row) => expensePresetTransportModeLabels[row.transport_mode] },
    {
      key: "is_active",
      header: "Ativo",
      render: (row) => <StatusBadge variant={row.is_active ? "success" : "neutral"}>{row.is_active ? "Ativo" : "Inativo"}</StatusBadge>
    },
    { key: "updated_at", header: "Atualizado em", render: (row) => formatDateTime(row.updated_at) },
    {
      key: "actions",
      header: "Ações",
      render: (row) => <ExpensePresetRowActions expensePresetId={row.id} label={row.name} isActive={row.is_active} />
    }
  ];

  return (
    <>
      <CrudHeaderWithFilters
        title="Pré-cálculos de despesas"
        description="Presets mestres de despesas por via de transporte para uso futuro nas Simulações Finais."
        newHref="/admin/cadastros/pre-calculos-despesas/novo"
        newLabel="Novo pré-cálculo"
        filtersInitiallyOpen={hasActiveFilters(filters)}
      >
        <Card title="Filtros">
          <form action="/admin/cadastros/pre-calculos-despesas" className="mt-4 grid gap-4 lg:grid-cols-3">
            <FormField label="Nome">
              <TextInput name="name" defaultValue={filters.name ?? ""} />
            </FormField>
            <FormField label="Via transporte">
              <SelectInput name="transportMode" defaultValue={filters.transportMode ?? ""}>
                <option value="">Todas</option>
                {expensePresetTransportModeValues.map((value) => (
                  <option key={value} value={value}>
                    {expensePresetTransportModeLabels[value]}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Ativo">
              <SelectInput name="isActive" defaultValue={filters.isActive ?? ""}>
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </SelectInput>
            </FormField>
            <div className="flex flex-col-reverse gap-3 lg:col-span-3 lg:flex-row lg:justify-end">
              <ButtonLink href="/admin/cadastros/pre-calculos-despesas" variant="secondary" className="w-full lg:w-auto">
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
        <span className="font-bold text-rpx-ink">{rows.length}</span> pré-cálculos encontrados.
      </div>

      <DataTable columns={columns} rows={rows} emptyLabel="Nenhum pré-cálculo encontrado." />
    </>
  );
}
