import { createAdminUserAction } from "@/lib/actions/admin";
import { AdminUserFormCard } from "@/components/admin/AdminUserForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function NewAdminUserPage() {
  return (
    <>
      <PageHeader
        title="Novo usuário admin"
        description="Crie uma conta administrativa para a equipe interna da Global RPX."
      />
      <div className="max-w-2xl">
        <AdminUserFormCard
          action={createAdminUserAction}
          title="Dados do usuário"
          description="Usuários criados aqui terão acesso administrativo ao painel."
          submitLabel="Salvar usuário"
          cancelHref="/admin/usuarios"
          passwordRequired
          values={{
            name: "",
            email: "",
            status: "active"
          }}
        />
      </div>
    </>
  );
}
