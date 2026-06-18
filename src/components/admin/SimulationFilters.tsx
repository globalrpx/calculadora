import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import type { AdminSimulationFilters, AdminSimulationSort } from "@/lib/admin/queries";
import { simulationStatusOptions } from "@/lib/admin/simulation-form-state";

export function SimulationFilters({
  filters,
  sort,
  clearHref
}: {
  filters: AdminSimulationFilters;
  sort: AdminSimulationSort;
  clearHref: string;
}) {
  return (
    <Card title="Filtros" description="Refine a lista por cliente, produto, fornecedor, status e período.">
      <form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <input type="hidden" name="sort" value={sort.sort} />
        <input type="hidden" name="direction" value={sort.direction} />
        <FormField label="Cliente">
          <TextInput name="client" defaultValue={filters.client ?? ""} placeholder="Empresa, nome ou e-mail" />
        </FormField>
        <FormField label="Produto">
          <TextInput name="product" defaultValue={filters.product ?? ""} placeholder="Produto da cotação" />
        </FormField>
        <FormField label="HS/NCM">
          <TextInput name="hsCode" defaultValue={filters.hsCode ?? ""} placeholder="Código" />
        </FormField>
        <FormField label="Fornecedor">
          <TextInput name="supplier" defaultValue={filters.supplier ?? ""} placeholder="Fornecedor" />
        </FormField>
        <FormField label="Status">
          <SelectInput name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos</option>
            {simulationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Data inicial">
          <TextInput name="dateFrom" type="date" defaultValue={filters.dateFrom ?? ""} />
        </FormField>
        <FormField label="Data final">
          <TextInput name="dateTo" type="date" defaultValue={filters.dateTo ?? ""} />
        </FormField>
        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-7 xl:justify-end">
          <Link
            href={clearHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-rpx-blue/20 bg-white px-4 py-2 text-sm font-semibold text-rpx-blue transition hover:bg-rpx-sky"
          >
            Limpar
          </Link>
          <Button type="submit" className="w-full md:w-auto">
            Filtrar
          </Button>
        </div>
      </form>
    </Card>
  );
}
