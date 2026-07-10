"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { FormField, NumberInput, SelectInput, TextInput } from "@/components/ui/FormField";
import {
  invoiceParametrizationCustomerProfileLabels,
  invoiceParametrizationDestinationScopeLabels,
  invoiceParametrizationOperationGroupLabels,
  invoiceParametrizationOperationTypeLabels,
  invoiceParametrizationTaxRegimeLabels
} from "./fiscal-labels";
import {
  invoiceParametrizationCustomerProfileValues,
  invoiceParametrizationDestinationScopeValues,
  invoiceParametrizationOperationGroupValues,
  invoiceParametrizationOperationTypeValues,
  invoiceParametrizationTaxRegimeValues,
  type FinalSimulationActionState,
  type InvoiceParametrizationFormInput
} from "./types";

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Salvando..." : children}
    </Button>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked
}: {
  name: keyof InvoiceParametrizationFormInput;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
      <input type="hidden" name={name} value="false" />
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-slate-300 text-rpx-blue focus:ring-rpx-blue"
      />
      {label}
    </label>
  );
}

export function InvoiceParametrizationForm({
  action,
  title,
  description,
  submitLabel,
  cancelHref,
  successRedirectHref,
  values
}: {
  action: (
    previousState: FinalSimulationActionState<InvoiceParametrizationFormInput>,
    formData: FormData
  ) => Promise<FinalSimulationActionState<InvoiceParametrizationFormInput>>;
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  successRedirectHref: string;
  values?: Partial<InvoiceParametrizationFormInput>;
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
      <form action={formAction} className="mt-4 grid gap-5" noValidate>
        {currentValues.invoiceParametrizationId ? (
          <input type="hidden" name="invoiceParametrizationId" value={currentValues.invoiceParametrizationId} />
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

        <div className="grid gap-4 lg:grid-cols-3">
          <FormField label="Código" error={errors.code} errorId="code-error">
            <TextInput
              name="code"
              defaultValue={currentValues.code ?? ""}
              aria-invalid={Boolean(errors.code)}
              aria-describedby={errors.code ? "code-error" : undefined}
            />
          </FormField>
          <FormField label="Chave" error={errors.key} errorId="key-error">
            <TextInput name="key" defaultValue={currentValues.key ?? ""} />
          </FormField>
          <FormField label="Tipo" error={errors.operationType} errorId="operationType-error">
            <SelectInput
              name="operationType"
              defaultValue={currentValues.operationType ?? "entrada"}
              aria-invalid={Boolean(errors.operationType)}
              aria-describedby={errors.operationType ? "operationType-error" : undefined}
            >
              {invoiceParametrizationOperationTypeValues.map((value) => (
                <option key={value} value={value}>
                  {invoiceParametrizationOperationTypeLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Descrição" error={errors.description} errorId="description-error">
            <TextInput
              name="description"
              defaultValue={currentValues.description ?? ""}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
          </FormField>
          <FormField label="Natureza da operação" error={errors.operationNature} errorId="operationNature-error">
            <TextInput name="operationNature" defaultValue={currentValues.operationNature ?? ""} />
          </FormField>
          <FormField label="CFOP" error={errors.cfop} errorId="cfop-error">
            <TextInput name="cfop" defaultValue={currentValues.cfop ?? ""} />
          </FormField>
          <FormField label="Grupo de operação" error={errors.operationGroup} errorId="operationGroup-error">
            <SelectInput name="operationGroup" defaultValue={currentValues.operationGroup ?? ""}>
              <option value="">Não definido</option>
              {invoiceParametrizationOperationGroupValues.map((value) => (
                <option key={value} value={value}>
                  {invoiceParametrizationOperationGroupLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Regime tributário" error={errors.taxRegime} errorId="taxRegime-error">
            <SelectInput name="taxRegime" defaultValue={currentValues.taxRegime ?? ""}>
              <option value="">Não definido</option>
              {invoiceParametrizationTaxRegimeValues.map((value) => (
                <option key={value} value={value}>
                  {invoiceParametrizationTaxRegimeLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="ICMS (%)" error={errors.icmsRate} errorId="icmsRate-error">
            <NumberInput name="icmsRate" defaultValue={currentValues.icmsRate ?? 0} step="0.0001" />
          </FormField>
          <FormField label="Escopo destino" error={errors.destinationScope} errorId="destinationScope-error">
            <SelectInput name="destinationScope" defaultValue={currentValues.destinationScope ?? ""}>
              <option value="">Não definido</option>
              {invoiceParametrizationDestinationScopeValues.map((value) => (
                <option key={value} value={value}>
                  {invoiceParametrizationDestinationScopeLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Perfil de cliente" error={errors.customerProfile} errorId="customerProfile-error">
            <SelectInput name="customerProfile" defaultValue={currentValues.customerProfile ?? ""}>
              <option value="">Não definido</option>
              {invoiceParametrizationCustomerProfileValues.map((value) => (
                <option key={value} value={value}>
                  {invoiceParametrizationCustomerProfileLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Filial" error={errors.branchName} errorId="branchName-error">
            <TextInput name="branchName" defaultValue={currentValues.branchName ?? ""} />
          </FormField>
          <FormField label="Cliente" error={errors.customerName} errorId="customerName-error">
            <TextInput name="customerName" defaultValue={currentValues.customerName ?? ""} />
          </FormField>
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <CheckboxField name="isUnified" label="Parametrização unificada" defaultChecked={currentValues.isUnified} />
          <CheckboxField name="isActive" label="Ativo" defaultChecked={currentValues.isActive ?? true} />
        </div>

        <FormField label="Observações internas" error={errors.internalNotes} errorId="internalNotes-error">
          <textarea
            name="internalNotes"
            defaultValue={currentValues.internalNotes ?? ""}
            rows={5}
            className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
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
