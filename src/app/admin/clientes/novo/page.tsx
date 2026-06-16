import { createClientAction } from "@/lib/actions/admin";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientFormCard } from "@/components/admin/ClientForm";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";

export default async function NewClientPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <PageHeader
        title="Novo cliente"
        description="Cadastre um novo cliente manualmente para acompanhamento pela equipe da Global RPX."
      />
      {params.error ? (
        <DismissibleAlert variant="error">
          Não foi possível salvar o cliente. Revise os dados e tente novamente.
        </DismissibleAlert>
      ) : null}
      <div className="max-w-2xl">
        <ClientFormCard
          action={createClientAction}
          title="Novo cliente"
          description="Cadastre clientes diretamente pelo painel administrativo."
          submitLabel="Salvar cliente"
          cancelHref="/admin/clientes"
        />
      </div>
    </>
  );
}
