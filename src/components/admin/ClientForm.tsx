"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { FormField, TextInput } from "@/components/ui/FormField";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { initialClientFormState, type ClientFormState, type ClientFormValues } from "@/lib/admin/client-form-state";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Salvando..." : children}
    </Button>
  );
}

export function ClientFormCard({
  action,
  title,
  description,
  submitLabel,
  values,
  cancelHref,
  showPasswordFields = false,
  passwordFieldsRequired = false
}: {
  action: (previousState: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  title: string;
  description: string;
  submitLabel: string;
  values?: ClientFormValues;
  cancelHref: string;
  showPasswordFields?: boolean;
  passwordFieldsRequired?: boolean;
}) {
  const [state, formAction] = useActionState(action, {
    ...initialClientFormState,
    values
  });
  const currentValues = state.values ?? values;
  const errors = state.fieldErrors ?? {};
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card title={title} description={description}>
      <form action={formAction} className="mt-4 grid gap-4" noValidate>
        {currentValues?.id ? <input type="hidden" name="clientId" value={currentValues.id} /> : null}
        {state.message ? (
          <DismissibleAlert
            key={`${state.message}-${JSON.stringify(errors)}`}
            variant={hasErrors ? "warning" : "error"}
            className="mb-0"
          >
            {state.message}
          </DismissibleAlert>
        ) : null}
        <FormField label="Nome" error={errors.contactName} errorId="contactName-error">
          <TextInput
            name="contactName"
            defaultValue={currentValues?.contactName ?? ""}
            placeholder="Nome do contato"
            aria-invalid={Boolean(errors.contactName)}
            aria-describedby={errors.contactName ? "contactName-error" : undefined}
          />
        </FormField>
        <FormField label="Empresa" help="Opcional. Use quando o cadastro estiver vinculado a uma empresa.">
          <TextInput name="companyName" defaultValue={currentValues?.companyName ?? ""} placeholder="Ex: Alpha Importadora" />
        </FormField>
        <FormField label="E-mail" error={errors.contactEmail} errorId="contactEmail-error">
          <TextInput
            name="contactEmail"
            type="text"
            inputMode="email"
            autoComplete="email"
            defaultValue={currentValues?.contactEmail ?? ""}
            placeholder="contato@empresa.com"
            aria-invalid={Boolean(errors.contactEmail)}
            aria-describedby={errors.contactEmail ? "contactEmail-error" : undefined}
          />
        </FormField>
        <FormField label="Telefone" error={errors.contactPhone} errorId="contactPhone-error">
          <TextInput
            name="contactPhone"
            type="tel"
            defaultValue={currentValues?.contactPhone ?? ""}
            placeholder="(11) 99999-9999"
            aria-invalid={Boolean(errors.contactPhone)}
            aria-describedby={errors.contactPhone ? "contactPhone-error" : undefined}
          />
        </FormField>
        {showPasswordFields ? (
          <>
            <div className="mt-2 border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-rpx-ink">
                {passwordFieldsRequired ? "Senha de acesso" : "Redefinir senha do usuário"}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {passwordFieldsRequired
                  ? "Defina a senha inicial que o cliente usará para acessar a plataforma."
                  : "Preencha apenas se quiser definir uma nova senha para o usuário vinculado a este cliente."}
              </p>
            </div>
            <FormField
              label={passwordFieldsRequired ? "Senha" : "Nova senha"}
              help={`${passwordFieldsRequired ? "Obrigatória" : "Opcional"}. Use pelo menos 6 caracteres.`}
              error={errors.password}
              errorId="password-error"
            >
              <TextInput
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
            </FormField>
            <FormField
              label={passwordFieldsRequired ? "Confirmar senha" : "Confirmar nova senha"}
              error={errors.confirmPassword}
              errorId="confirmPassword-error"
            >
              <TextInput
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
            </FormField>
          </>
        ) : null}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <ButtonLink href={cancelHref} variant="secondary" className="w-full sm:w-auto">
            Cancelar
          </ButtonLink>
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
