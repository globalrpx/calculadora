import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import type { AdminClientFilters } from "@/lib/admin/queries";

export function ClientFilters({ filters }: { filters: AdminClientFilters }) {
  return (
    <Card title="Filtros" description="Refine a lista por contato, empresa, origem, status e período de cadastro.">
      <form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <FormField label="Nome">
          <TextInput name="name" defaultValue={filters.name ?? ""} placeholder="Responsável" />
        </FormField>
        <FormField label="Empresa">
          <TextInput name="company" defaultValue={filters.company ?? ""} placeholder="Empresa" />
        </FormField>
        <FormField label="Origem">
          <SelectInput name="source" defaultValue={filters.source ?? ""}>
            <option value="">Todas</option>
            <option value="site">Site</option>
            <option value="admin">Painel admin</option>
          </SelectInput>
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
        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-6 xl:justify-end">
          <Link
            href="/admin/clientes"
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
