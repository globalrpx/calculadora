import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { FormField, TextInput } from "@/components/ui/FormField";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { updateMyAccountAction, updateMyPasswordAction } from "@/lib/actions/account";
import { adminNavItems, clientNavItems } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

function getErrorMessage(error?: string) {
  switch (error) {
    case "email-exists":
      return "Este e-mail já está em uso por outro usuário.";
    case "password-invalid":
      return "A nova senha precisa ter pelo menos 6 caracteres e coincidir com a confirmação.";
    case "invalid-fields":
      return "Preencha os campos obrigatórios antes de salvar.";
    default:
      return error ? "Não foi possível salvar os dados da conta. Tente novamente." : null;
  }
}

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ updated?: string; passwordUpdated?: string; error?: string }>;
}) {
  const [params, session] = await Promise.all([searchParams, getSessionProfile()]);
  const supabase = await createClient();

  let companyName = "";

  if (session.appUser.client_id) {
    const { data: clientData } = await supabase
      .from("clients")
      .select("company_name")
      .eq("id", session.appUser.client_id)
      .single();

    companyName = clientData?.company_name ?? "";
  } else {
    companyName = String((session.user as { user_metadata?: { company?: string | null } }).user_metadata?.company ?? "");
  }

  const errorMessage = getErrorMessage(params.error);

  return (
    <AppShell
      appUser={session.appUser}
      navItems={session.appUser.role === "admin" ? adminNavItems : clientNavItems}
    >
      <PageHeader
        title="Minha conta"
        description="Atualize seus dados de acesso e informações principais do seu perfil na plataforma."
      />
      {params.updated ? (
        <DismissibleAlert variant="success">
          Dados da conta atualizados com sucesso.
        </DismissibleAlert>
      ) : null}
      {params.passwordUpdated ? (
        <DismissibleAlert variant="success">
          Senha atualizada com sucesso.
        </DismissibleAlert>
      ) : null}
      {errorMessage ? (
        <DismissibleAlert variant="error">
          {errorMessage}
        </DismissibleAlert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Dados da conta" description="Edite seu nome, empresa, e-mail e telefone de contato.">
          <form action={updateMyAccountAction} className="mt-4 grid gap-4">
            <FormField label="Nome">
              <TextInput name="name" required defaultValue={session.appUser.name ?? ""} />
            </FormField>
            <FormField label="Empresa" help="Opcional. Use quando sua conta estiver vinculada a uma empresa.">
              <TextInput name="company" defaultValue={companyName} />
            </FormField>
            <FormField label="E-mail">
              <TextInput name="email" type="email" required defaultValue={session.appUser.email} />
            </FormField>
            <FormField label="Telefone">
              <TextInput name="phone" type="tel" defaultValue={session.appUser.phone ?? ""} />
            </FormField>
            <div className="flex justify-end pt-2">
              <Button type="submit">Salvar dados</Button>
            </div>
          </form>
        </Card>

        <Card title="Alterar senha" description="Defina uma nova senha de acesso para a sua conta.">
          <form action={updateMyPasswordAction} className="mt-4 grid gap-4">
            <FormField label="Nova senha" help="Use pelo menos 6 caracteres.">
              <TextInput name="password" type="password" required minLength={6} />
            </FormField>
            <FormField label="Confirmar nova senha">
              <TextInput name="confirmPassword" type="password" required minLength={6} />
            </FormField>
            <div className="flex justify-end pt-2">
              <Button type="submit">Atualizar senha</Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
