"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import { expensePresetTransportModeLabels } from "./expense-labels";
import {
  expensePresetTransportModeValues,
  type ExpensePresetValues,
  type FinalSimulationActionState
} from "./types";

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Salvando..." : children}
    </Button>
  );
}

export function ExpensePresetForm({
  action,
  title,
  description,
  submitLabel,
  cancelHref,
  successRedirectHref,
  values
}: {
  action: (
    previousState: FinalSimulationActionState<ExpensePresetValues>,
    formData: FormData
  ) => Promise<FinalSimulationActionState<ExpensePresetValues>>;
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  successRedirectHref: string;
  values?: Partial<ExpensePresetValues>;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {
    success: false,
    values
  });
  const currentValues = state.values ?? values ?? {};
  const errors = state.fieldErrors ?? {};
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (state.success) {
      router.push(successRedirectHref);
    }
  }, [router, state.success, successRedirectHref]);

  return (
    <Card title={title} description={description}>
      <form action={formAction} className="mt-4 grid gap-4" noValidate>
        {currentValues.expensePresetId ? (
          <input type="hidden" name="expensePresetId" value={currentValues.expensePresetId} />
        ) : null}
        {state.message ? (
          <DismissibleAlert
            key={`${state.message}-${JSON.stringify(errors)}`}
            variant={hasErrors ? "warning" : state.success ? "success" : "error"}
            className="mb-0"
          >
            {state.message}
          </DismissibleAlert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label="Nome" error={errors.name} errorId="name-error">
            <TextInput
              name="name"
              defaultValue={currentValues.name ?? ""}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </FormField>
          <FormField label="Via transporte" error={errors.transportMode} errorId="transportMode-error">
            <SelectInput name="transportMode" defaultValue={currentValues.transportMode ?? "maritimo"}>
              {expensePresetTransportModeValues.map((value) => (
                <option key={value} value={value}>
                  {expensePresetTransportModeLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Descrição" error={errors.description} errorId="description-error">
          <TextInput name="description" defaultValue={currentValues.description ?? ""} />
        </FormField>

        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <input type="hidden" name="isActive" value="false" />
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={currentValues.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 text-rpx-blue focus:ring-rpx-blue"
          />
          Ativo
        </label>

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
