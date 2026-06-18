"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import {
  adminUserStatusOptions,
  initialAdminUserFormState,
  type AdminUserFormState,
  type AdminUserFormValues
} from "@/lib/admin/admin-user-form-state";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Salvando..." : children}
    </Button>
  );
}

export function AdminUserFormCard({
  action,
  title,
  description,
  submitLabel,
  values,
  cancelHref,
  passwordRequired = false
}: {
  action: (previousState: AdminUserFormState, formData: FormData) => Promise<AdminUserFormState>;
  title: string;
  description: string;
  submitLabel: string;
  values?: AdminUserFormValues;
  cancelHref: string;
  passwordRequired?: boolean;
}) {
  const [state, formAction] = useActionState(action, {
    ...initialAdminUserFormState,
    values
  });
  const currentValues = state.values ?? values;
  const errors = state.fieldErrors ?? {};
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card title={title} description={description}>
      <form action={formAction} className="mt-4 grid gap-4" noValidate>
        {currentValues?.id ? <input type="hidden" name="userId" value={currentValues.id} /> : null}
        {state.message ? (
          <DismissibleAlert
            key={`${state.message}-${JSON.stringify(errors)}`}
            variant={hasErrors ? "warning" : "error"}
            className="mb-0"
          >
            {state.message}
          </DismissibleAlert>
        ) : null}
        <FormField label="Nome" error={errors.name} errorId="name-error">
          <TextInput
            name="name"
            defaultValue={currentValues?.name ?? ""}
            placeholder="Nome do administrador"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </FormField>
        <FormField label="E-mail" error={errors.email} errorId="email-error">
          <TextInput
            name="email"
            type="text"
            inputMode="email"
            autoComplete="email"
            defaultValue={currentValues?.email ?? ""}
            placeholder="admin@globalrpx.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </FormField>
        <FormField label="Status" error={errors.status} errorId="status-error">
          <SelectInput
            name="status"
            defaultValue={currentValues?.status ?? "active"}
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? "status-error" : undefined}
          >
            {adminUserStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <div className="mt-2 border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-rpx-ink">
            {passwordRequired ? "Senha de acesso" : "Redefinir senha do usuário"}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {passwordRequired
              ? "Defina a senha inicial que o admin usará para acessar o painel."
              : "Preencha apenas se quiser definir uma nova senha para este admin."}
          </p>
        </div>
        <FormField
          label={passwordRequired ? "Senha" : "Nova senha"}
          help={`${passwordRequired ? "Obrigatória" : "Opcional"}. Use pelo menos 6 caracteres.`}
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
          label={passwordRequired ? "Confirmar senha" : "Confirmar nova senha"}
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
