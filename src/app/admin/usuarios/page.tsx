import { createAdminUserAction } from "@/lib/actions/admin";
import { getAdminUsers } from "@/lib/admin/queries";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormField, TextInput } from "@/components/ui/FormField";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const params = await searchParams;
  const users = await getAdminUsers();

  const columns: DataTableColumn<(typeof users)[number]>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "E-mail" },
    {
      key: "status",
      header: "Status",
      render: (row) => (row.status === "active" ? "Ativo" : "Inativo")
    },
    {
      key: "created_at",
      header: "Criado em",
      render: (row) => formatDate(row.created_at)
    }
  ];

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Gerencie as contas administrativas que operam o painel da Global RPX."
      />
      {params.created ? (
        <DismissibleAlert variant="success">
          Usuário administrativo criado com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.error ? (
        <DismissibleAlert variant="error">
          Não foi possível criar o usuário. Revise os dados e tente novamente.
        </DismissibleAlert>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card title="Novo admin" description="Crie contas administrativas para a equipe interna.">
          <form action={createAdminUserAction} className="mt-4 grid gap-4">
            <FormField label="Nome">
              <TextInput name="name" required placeholder="Nome do administrador" />
            </FormField>
            <FormField label="E-mail">
              <TextInput name="email" type="email" required placeholder="admin@globalrpx.com" />
            </FormField>
            <FormField label="Senha" help="Use pelo menos 6 caracteres.">
              <TextInput name="password" type="password" required minLength={6} />
            </FormField>
            <Button type="submit" className="w-full">
              Criar usuário admin
            </Button>
          </form>
        </Card>
        <DataTable columns={columns} rows={users} emptyLabel="Nenhum usuário administrativo cadastrado." />
      </div>
    </>
  );
}
