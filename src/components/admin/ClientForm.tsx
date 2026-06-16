import { Card } from "@/components/ui/Card";
import { FormField, TextInput } from "@/components/ui/FormField";
import { Button, ButtonLink } from "@/components/ui/Button";

type ClientFormValues = {
  id?: string;
  companyName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export function ClientFormCard({
  action,
  title,
  description,
  submitLabel,
  values,
  cancelHref,
  showPasswordFields = false
}: {
  action: (formData: FormData) => Promise<void>;
  title: string;
  description: string;
  submitLabel: string;
  values?: ClientFormValues;
  cancelHref: string;
  showPasswordFields?: boolean;
}) {
  return (
    <Card title={title} description={description}>
      <form action={action} className="mt-4 grid gap-4">
        {values?.id ? <input type="hidden" name="clientId" value={values.id} /> : null}
        <FormField label="Nome">
          <TextInput name="contactName" required defaultValue={values?.contactName ?? ""} placeholder="Nome do contato" />
        </FormField>
        <FormField label="Empresa" help="Opcional. Use quando o cadastro estiver vinculado a uma empresa.">
          <TextInput name="companyName" defaultValue={values?.companyName ?? ""} placeholder="Ex: Alpha Importadora" />
        </FormField>
        <FormField label="E-mail">
          <TextInput
            name="contactEmail"
            type="email"
            required
            defaultValue={values?.contactEmail ?? ""}
            placeholder="contato@empresa.com"
          />
        </FormField>
        <FormField label="Telefone">
          <TextInput name="contactPhone" type="tel" defaultValue={values?.contactPhone ?? ""} placeholder="(11) 99999-9999" />
        </FormField>
        {showPasswordFields ? (
          <>
            <div className="mt-2 border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-rpx-ink">Redefinir senha do usuário</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Preencha apenas se quiser definir uma nova senha para o usuário vinculado a este cliente.
              </p>
            </div>
            <FormField label="Nova senha" help="Opcional. Use pelo menos 6 caracteres.">
              <TextInput name="password" type="password" minLength={6} />
            </FormField>
            <FormField label="Confirmar nova senha">
              <TextInput name="confirmPassword" type="password" minLength={6} />
            </FormField>
          </>
        ) : null}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <ButtonLink href={cancelHref} variant="secondary" className="w-full sm:w-auto">
            Cancelar
          </ButtonLink>
          <Button type="submit" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
