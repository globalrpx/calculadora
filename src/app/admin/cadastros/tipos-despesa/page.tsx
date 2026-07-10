import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CrudHeaderWithFilters } from "@/components/admin/CrudHeaderWithFilters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  expenseAllocationTypeLabels,
  expenseBehaviorLabels,
  expenseCalculationTypeLabels,
  expenseModalityLabels
} from "@/features/final-simulations/expense-labels";
import { ExpenseTypeRowActions } from "@/features/final-simulations/ExpenseMasterRowActions";
import { listExpenseTypes } from "@/features/final-simulations/queries";
import { expenseModalityValues, type ExpenseType } from "@/features/final-simulations/types";

type ExpenseTypeFilters = {
  code?: string;
  description?: string;
  isActive?: string;
  modality?: string;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseFilters(params: Record<string, string | string[] | undefined>): ExpenseTypeFilters {
  return {
    code: readParam(params, "code"),
    description: readParam(params, "description"),
    isActive: readParam(params, "isActive"),
    modality: readParam(params, "modality")
  };
}

function hasActiveFilters(filters: ExpenseTypeFilters) {
  return Boolean(filters.code || filters.description || filters.isActive || filters.modality);
}

function filterExpenseTypes(rows: ExpenseType[], filters: ExpenseTypeFilters) {
  return rows.filter((row) => {
    if (filters.code && !row.code?.toLowerCase().includes(filters.code.toLowerCase())) {
      return false;
    }

    if (filters.description && !row.description.toLowerCase().includes(filters.description.toLowerCase())) {
      return false;
    }

    if (filters.isActive === "active" && !row.is_active) {
      return false;
    }

    if (filters.isActive === "inactive" && row.is_active) {
      return false;
    }

    if (filters.modality && row.expense_modality !== filters.modality) {
      return false;
    }

    return true;
  });
}

export default async function ExpenseTypesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const rows = filterExpenseTypes(await listExpenseTypes(), filters);

  const columns: DataTableColumn<ExpenseType>[] = [
    { key: "code", header: "Código", render: (row) => row.code || "-" },
    { key: "description", header: "Descrição", render: (row) => <span className="font-semibold text-rpx-ink">{row.description}</span> },
    { key: "expense_modality", header: "Modalidade", render: (row) => expenseModalityLabels[row.expense_modality] },
    { key: "allocation_type", header: "Tipo rateio", render: (row) => expenseAllocationTypeLabels[row.allocation_type] },
    { key: "expense_calculation_type", header: "Cálculo", render: (row) => expenseCalculationTypeLabels[row.expense_calculation_type] },
    { key: "own_import_behavior", header: "Importação própria", render: (row) => expenseBehaviorLabels[row.own_import_behavior] },
    { key: "order_account_behavior", header: "Conta e ordem", render: (row) => expenseBehaviorLabels[row.order_account_behavior] },
    { key: "encomenda_behavior", header: "Encomenda", render: (row) => expenseBehaviorLabels[row.encomenda_behavior] },
    {
      key: "is_active",
      header: "Ativo",
      render: (row) => <StatusBadge variant={row.is_active ? "success" : "neutral"}>{row.is_active ? "Ativo" : "Inativo"}</StatusBadge>
    },
    {
      key: "actions",
      header: "Ações",
      render: (row) => <ExpenseTypeRowActions expenseTypeId={row.id} label={row.description} isActive={row.is_active} />
    }
  ];

  return (
    <>
      <CrudHeaderWithFilters
        title="Tipos de despesa"
        description="Cadastros mestres de despesas e bases usados pelos pré-cálculos das Simulações Finais."
        newHref="/admin/cadastros/tipos-despesa/novo"
        newLabel="Novo tipo"
        filtersInitiallyOpen={hasActiveFilters(filters)}
      >
        <Card title="Filtros">
          <form action="/admin/cadastros/tipos-despesa" className="mt-4 grid gap-4 lg:grid-cols-4">
            <FormField label="Código">
              <TextInput name="code" defaultValue={filters.code ?? ""} />
            </FormField>
            <FormField label="Descrição">
              <TextInput name="description" defaultValue={filters.description ?? ""} />
            </FormField>
            <FormField label="Ativo">
              <SelectInput name="isActive" defaultValue={filters.isActive ?? ""}>
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </SelectInput>
            </FormField>
            <FormField label="Modalidade">
              <SelectInput name="modality" defaultValue={filters.modality ?? ""}>
                <option value="">Todas</option>
                {expenseModalityValues.map((value) => (
                  <option key={value} value={value}>
                    {expenseModalityLabels[value]}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <div className="flex flex-col-reverse gap-3 lg:col-span-4 lg:flex-row lg:justify-end">
              <ButtonLink href="/admin/cadastros/tipos-despesa" variant="secondary" className="w-full lg:w-auto">
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
        <span className="font-bold text-rpx-ink">{rows.length}</span> tipos encontrados.
      </div>

      <DataTable columns={columns} rows={rows} emptyLabel="Nenhum tipo de despesa encontrado." />
    </>
  );
}
