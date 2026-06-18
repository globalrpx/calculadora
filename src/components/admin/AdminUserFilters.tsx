import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import type { AdminUserFilters, AdminUserSort } from "@/lib/admin/queries";

export function AdminUserFilters({
  filters,
  sort,
  clearHref
}: {
  filters: AdminUserFilters;
  sort: AdminUserSort;
  clearHref: string;
}) {
  return (
    <Card title="Filtros" description="Refine a lista por nome, e-mail, status e período de cadastro.">
      <form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <input type="hidden" name="sort" value={sort.sort} />
        <input type="hidden" name="direction" value={sort.direction} />
        <FormField label="Nome">
          <TextInput name="name" defaultValue={filters.name ?? ""} placeholder="Nome do admin" />
        </FormField>
        <FormField label="E-mail">
          <TextInput name="email" defaultValue={filters.email ?? ""} placeholder="admin@globalrpx.com" />
        </FormField>
        <FormField label="Status">
          <SelectInput name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </SelectInput>
        </FormField>
        <FormField label="Cadastro inicial">
          <TextInput name="dateFrom" type="date" defaultValue={filters.dateFrom ?? ""} />
        </FormField>
        <FormField label="Cadastro final">
          <TextInput name="dateTo" type="date" defaultValue={filters.dateTo ?? ""} />
        </FormField>
        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-5 xl:justify-end">
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
