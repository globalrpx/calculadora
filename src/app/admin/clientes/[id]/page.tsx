import { notFound } from "next/navigation";
import { updateClientAction } from "@/lib/actions/admin";
import { getAdminClientById } from "@/lib/admin/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientFormCard } from "@/components/admin/ClientForm";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";

export default async function EditClientPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const client = await getAdminClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Editar cliente"
        description="Atualize os dados do cliente e mantenha a base administrativa organizada."
      />
      {query.error ? (
        <DismissibleAlert variant="error">
          {query.error === "password-invalid"
            ? "A senha precisa ter pelo menos 6 caracteres e coincidir com a confirmação."
            : query.error === "linked-user-not-found"
              ? "Não existe usuário vinculado a este cliente para redefinir a senha."
              : "Não foi possível salvar as alterações. Revise os dados e tente novamente."}
        </DismissibleAlert>
      ) : null}
      <div className="max-w-2xl">
        <ClientFormCard
          action={updateClientAction}
          title="Dados do cliente"
          description="Edite as informações principais do cadastro."
          submitLabel="Salvar alterações"
          cancelHref="/admin/clientes"
          values={{
            id: client.id,
            companyName: client.company_name,
            contactName: client.contact_name,
            contactEmail: client.contact_email,
            contactPhone: client.contact_phone,
            clientType: client.client_type
          }}
          showPasswordFields
        />
      </div>
    </>
  );
}
