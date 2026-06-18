import { notFound } from "next/navigation";
import { updateAdminUserAction } from "@/lib/actions/admin";
import { getAdminUserById } from "@/lib/admin/queries";
import { AdminUserFormCard } from "@/components/admin/AdminUserForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function EditAdminUserPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Editar usuário admin"
        description="Atualize os dados principais, status e senha opcional do usuário administrativo."
      />
      <div className="max-w-2xl">
        <AdminUserFormCard
          action={updateAdminUserAction}
          title="Dados do usuário"
          description="A role permanece fixa como admin nesta fase."
          submitLabel="Salvar alterações"
          cancelHref="/admin/usuarios"
          values={{
            id: user.id,
            name: user.name ?? "",
            email: user.email,
            status: user.status
          }}
        />
      </div>
    </>
  );
}
