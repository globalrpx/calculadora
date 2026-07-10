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
  expenseAllocationTypeLabels,
  expenseBehaviorLabels,
  expenseCalculationTypeLabels,
  expenseModalityLabels
} from "./expense-labels";
import {
  expenseAllocationTypeValues,
  expenseBehaviorValues,
  expenseCalculationTypeValues,
  expenseModalityValues,
  type ExpenseTypeValues,
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

function CheckboxField({
  name,
  label,
  defaultChecked
}: {
  name: keyof ExpenseTypeValues;
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

export function ExpenseTypeForm({
  action,
  title,
  description,
  submitLabel,
  cancelHref,
  successRedirectHref,
  values
}: {
  action: (
    previousState: FinalSimulationActionState<ExpenseTypeValues>,
    formData: FormData
  ) => Promise<FinalSimulationActionState<ExpenseTypeValues>>;
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  successRedirectHref: string;
  values?: Partial<ExpenseTypeValues>;
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
        {currentValues.expenseTypeId ? (
          <input type="hidden" name="expenseTypeId" value={currentValues.expenseTypeId} />
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
            <TextInput name="code" defaultValue={currentValues.code ?? ""} />
          </FormField>
          <FormField label="Descrição" error={errors.description} errorId="description-error">
            <TextInput
              name="description"
              defaultValue={currentValues.description ?? ""}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
          </FormField>
          <FormField label="Chave" error={errors.key} errorId="key-error">
            <TextInput name="key" defaultValue={currentValues.key ?? ""} />
          </FormField>
          <FormField label="Ordem de impressão" error={errors.printOrder} errorId="printOrder-error">
            <NumberInput name="printOrder" defaultValue={currentValues.printOrder ?? 0} step="1" />
          </FormField>
          <FormField label="Modalidade despesa" error={errors.expenseModality} errorId="expenseModality-error">
            <SelectInput name="expenseModality" defaultValue={currentValues.expenseModality ?? "expense"}>
              {expenseModalityValues.map((value) => (
                <option key={value} value={value}>
                  {expenseModalityLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Tipo rateio" error={errors.allocationType} errorId="allocationType-error">
            <SelectInput name="allocationType" defaultValue={currentValues.allocationType ?? "value"}>
              {expenseAllocationTypeValues.map((value) => (
                <option key={value} value={value}>
                  {expenseAllocationTypeLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Cálculo despesa" error={errors.expenseCalculationType} errorId="expenseCalculationType-error">
            <SelectInput name="expenseCalculationType" defaultValue={currentValues.expenseCalculationType ?? "parameters"}>
              {expenseCalculationTypeValues.map((value) => (
                <option key={value} value={value}>
                  {expenseCalculationTypeLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Importação própria" error={errors.ownImportBehavior} errorId="ownImportBehavior-error">
            <SelectInput name="ownImportBehavior" defaultValue={currentValues.ownImportBehavior ?? "not_applicable"}>
              {expenseBehaviorValues.map((value) => (
                <option key={value} value={value}>
                  {expenseBehaviorLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Conta e ordem" error={errors.orderAccountBehavior} errorId="orderAccountBehavior-error">
            <SelectInput name="orderAccountBehavior" defaultValue={currentValues.orderAccountBehavior ?? "not_applicable"}>
              {expenseBehaviorValues.map((value) => (
                <option key={value} value={value}>
                  {expenseBehaviorLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Encomenda" error={errors.encomendaBehavior} errorId="encomendaBehavior-error">
            <SelectInput name="encomendaBehavior" defaultValue={currentValues.encomendaBehavior ?? "not_applicable"}>
              {expenseBehaviorValues.map((value) => (
                <option key={value} value={value}>
                  {expenseBehaviorLabels[value]}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Grupo despesa" error={errors.expenseGroupName} errorId="expenseGroupName-error">
            <TextInput name="expenseGroupName" defaultValue={currentValues.expenseGroupName ?? ""} />
          </FormField>
          <FormField label="Chave ERP" error={errors.erpKey} errorId="erpKey-error">
            <TextInput name="erpKey" defaultValue={currentValues.erpKey ?? ""} />
          </FormField>
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <CheckboxField name="considersContainer" label="Considera container" defaultChecked={currentValues.considersContainer} />
          <CheckboxField
            name="considersIcmsEntryInvoice"
            label="Considera ICMS NF Entrada"
            defaultChecked={currentValues.considersIcmsEntryInvoice}
          />
          <CheckboxField
            name="composesServiceInvoice"
            label="Compõe nota fiscal de serviço"
            defaultChecked={currentValues.composesServiceInvoice}
          />
          <CheckboxField name="isActive" label="Ativo" defaultChecked={currentValues.isActive ?? true} />
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <CheckboxField
            name="paidByCashOwnImport"
            label="Numerário: importação própria"
            defaultChecked={currentValues.paidByCashOwnImport}
          />
          <CheckboxField
            name="paidByCashEncomenda"
            label="Numerário: encomenda"
            defaultChecked={currentValues.paidByCashEncomenda}
          />
          <CheckboxField
            name="paidByCashOrderAccount"
            label="Numerário: conta e ordem"
            defaultChecked={currentValues.paidByCashOrderAccount}
          />
          <CheckboxField
            name="paidByCashDirectExport"
            label="Numerário: exportação direta"
            defaultChecked={currentValues.paidByCashDirectExport}
          />
          <CheckboxField
            name="paidByCashIndirectExport"
            label="Numerário: exportação indireta"
            defaultChecked={currentValues.paidByCashIndirectExport}
          />
        </div>

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
