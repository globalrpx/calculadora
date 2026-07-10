"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog, ConfirmSubmitButton } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { FormField, NumberInput, SelectInput, TextInput } from "@/components/ui/FormField";
import {
  addManualSimulationExpenseAction,
  deleteSimulationExpenseLineAction,
  processExpensePresetForSimulationAction,
  updateSimulationExpenseLineAction
} from "./actions";
import {
  expenseAllocationTypeLabels,
  expenseBehaviorLabels,
  expenseCalculationTypeLabels,
  expenseModalityLabels,
  expensePresetTransportModeLabels
} from "./expense-labels";
import {
  expenseAllocationTypeValues,
  expenseBehaviorValues,
  expenseCalculationTypeValues,
  expenseModalityValues,
  type ExpensePreset,
  type FinalSimulationActionState,
  type ProcessExpensePresetValues,
  type SimulationExpenseLine,
  type SimulationExpenseLineValues
} from "./types";

const presetProcessingHelp =
  "Processar novamente este pré-cálculo substitui despesas geradas anteriormente por ele e mantém despesas manuais.";

function formatMoney(value: number | null | undefined, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(value ?? 0);
}

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Salvando..." : children}
    </Button>
  );
}

function fieldError<TValues>(state: FinalSimulationActionState<TValues>, field: keyof TValues) {
  return state.fieldErrors?.[field];
}

function expenseLineToValues(expense: SimulationExpenseLine): SimulationExpenseLineValues {
  return {
    expenseLineId: expense.id,
    simulationId: expense.simulation_id,
    expenseName: expense.expense_name,
    expenseCode: expense.expense_code ?? undefined,
    expenseCategory: expense.expense_category ?? undefined,
    description: expense.description ?? undefined,
    amountBrl: expense.amount_brl,
    amountUsd: expense.amount_usd,
    currency: expense.currency ?? "BRL",
    calculationType: expense.calculation_type ?? undefined,
    allocationType: expense.allocation_type ?? undefined,
    appliedBehavior: expense.applied_behavior ?? undefined,
    notes: expense.notes ?? undefined
  };
}

function ExpenseLineForm({
  action,
  initialValues,
  submitLabel,
  onSaved,
  onCancel
}: {
  action: (
    previousState: FinalSimulationActionState<SimulationExpenseLineValues>,
    formData: FormData
  ) => Promise<FinalSimulationActionState<SimulationExpenseLineValues>>;
  initialValues: SimulationExpenseLineValues;
  submitLabel: string;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {
    success: false,
    values: initialValues
  });
  const values = state.values ?? initialValues;
  const hasErrors = Boolean(state.fieldErrors && Object.keys(state.fieldErrors).length > 0);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    onSaved?.();
    router.refresh();
  }, [onSaved, router, state.success]);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="simulationId" value={initialValues.simulationId} />
      {initialValues.expenseLineId ? (
        <input type="hidden" name="expenseLineId" value={initialValues.expenseLineId} />
      ) : null}

      {state.message ? (
        <DismissibleAlert
          key={`${state.message}-${JSON.stringify(state.fieldErrors)}`}
          variant={hasErrors ? "warning" : state.success ? "success" : "error"}
          className="mb-0"
        >
          {state.message}
        </DismissibleAlert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField label="Despesa" error={fieldError(state, "expenseName")} errorId="expenseName-error">
          <TextInput
            name="expenseName"
            defaultValue={values.expenseName ?? ""}
            aria-invalid={Boolean(fieldError(state, "expenseName"))}
            aria-describedby={fieldError(state, "expenseName") ? "expenseName-error" : undefined}
          />
        </FormField>

        <FormField label="Código" error={fieldError(state, "expenseCode")} errorId="expenseCode-error">
          <TextInput name="expenseCode" defaultValue={values.expenseCode ?? ""} />
        </FormField>

        <FormField label="Categoria" error={fieldError(state, "expenseCategory")} errorId="expenseCategory-error">
          <SelectInput name="expenseCategory" defaultValue={values.expenseCategory ?? ""}>
            <option value="">Sem categoria</option>
            {expenseModalityValues.map((value) => (
              <option key={value} value={value}>
                {expenseModalityLabels[value]}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Moeda" error={fieldError(state, "currency")} errorId="currency-error">
          <TextInput name="currency" defaultValue={values.currency ?? "BRL"} maxLength={3} />
        </FormField>

        <FormField label="Valor BRL" error={fieldError(state, "amountBrl")} errorId="amountBrl-error">
          <NumberInput name="amountBrl" defaultValue={values.amountBrl ?? 0} step="0.000001" />
        </FormField>

        <FormField label="Valor USD" error={fieldError(state, "amountUsd")} errorId="amountUsd-error">
          <NumberInput name="amountUsd" defaultValue={values.amountUsd ?? 0} step="0.000001" />
        </FormField>

        <FormField label="Tipo de cálculo" error={fieldError(state, "calculationType")} errorId="calculationType-error">
          <SelectInput name="calculationType" defaultValue={values.calculationType ?? ""}>
            <option value="">Não definido</option>
            {expenseCalculationTypeValues.map((value) => (
              <option key={value} value={value}>
                {expenseCalculationTypeLabels[value]}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Rateio" error={fieldError(state, "allocationType")} errorId="allocationType-error">
          <SelectInput name="allocationType" defaultValue={values.allocationType ?? ""}>
            <option value="">Não definido</option>
            {expenseAllocationTypeValues.map((value) => (
              <option key={value} value={value}>
                {expenseAllocationTypeLabels[value]}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Comportamento" error={fieldError(state, "appliedBehavior")} errorId="appliedBehavior-error">
          <SelectInput name="appliedBehavior" defaultValue={values.appliedBehavior ?? ""}>
            <option value="">Não definido</option>
            {expenseBehaviorValues.map((value) => (
              <option key={value} value={value}>
                {expenseBehaviorLabels[value]}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <FormField label="Descrição" error={fieldError(state, "description")} errorId="description-error">
        <TextInput name="description" defaultValue={values.description ?? ""} />
      </FormField>

      <FormField label="Observações" error={fieldError(state, "notes")} errorId="notes-error">
        <textarea
          name="notes"
          defaultValue={values.notes ?? ""}
          rows={3}
          className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
        />
      </FormField>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar edição
          </Button>
        ) : null}
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

function ProcessPresetForm({ simulationId, presets }: { simulationId: string; presets: ExpensePreset[] }) {
  const router = useRouter();
  const [state, formAction] = useActionState(processExpensePresetForSimulationAction, {
    success: false,
    values: {
      simulationId,
      presetId: presets[0]?.id ?? ""
    }
  } satisfies FinalSimulationActionState<ProcessExpensePresetValues>);
  const hasErrors = Boolean(state.fieldErrors && Object.keys(state.fieldErrors).length > 0);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]" noValidate>
      <input type="hidden" name="simulationId" value={simulationId} />
      <FormField label="Pré-cálculo" error={fieldError(state, "presetId")} errorId="presetId-error" help={presetProcessingHelp}>
        <SelectInput name="presetId" defaultValue={state.values?.presetId ?? presets[0]?.id ?? ""}>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name} - {expensePresetTransportModeLabels[preset.transport_mode]}
            </option>
          ))}
        </SelectInput>
      </FormField>
      <div className="self-start pt-7">
        <SubmitButton>Processar pré-cálculo</SubmitButton>
      </div>
      {state.message ? (
        <div className="lg:col-span-2">
          <DismissibleAlert
            key={`${state.message}-${JSON.stringify(state.fieldErrors)}`}
            variant={hasErrors ? "warning" : state.success ? "success" : "error"}
            className="mb-0"
          >
            {state.message}
          </DismissibleAlert>
        </div>
      ) : null}
    </form>
  );
}

export function SimulationExpensesSection({
  simulationId,
  expenses,
  presets,
  totalExpensesBrl,
  canEdit
}: {
  simulationId: string;
  expenses: SimulationExpenseLine[];
  presets: ExpensePreset[];
  totalExpensesBrl: number;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const editingExpense = useMemo(
    () => expenses.find((expense) => expense.id === editingExpenseId) ?? null,
    [editingExpenseId, expenses]
  );
  const handleDeleteExpense = async (formData: FormData) => {
    await deleteSimulationExpenseLineAction(formData);
    router.refresh();
  };

  const columns: DataTableColumn<SimulationExpenseLine>[] = [
    {
      key: "expense_name",
      header: "Despesa",
      render: (expense) => (
        <div className="min-w-56">
          <p className="font-semibold text-rpx-ink">{expense.expense_name}</p>
          {expense.description ? <p className="mt-1 text-xs leading-5 text-slate-500">{expense.description}</p> : null}
        </div>
      )
    },
    { key: "expense_code", header: "Código", render: (expense) => expense.expense_code || "-" },
    {
      key: "expense_category",
      header: "Categoria",
      render: (expense) =>
        expense.expense_category && expense.expense_category in expenseModalityLabels
          ? expenseModalityLabels[expense.expense_category as keyof typeof expenseModalityLabels]
          : "-"
    },
    {
      key: "amount_brl",
      header: "Valor BRL",
      headerClassName: "text-right",
      className: "text-right font-semibold tabular-nums text-rpx-ink",
      render: (expense) => formatMoney(expense.amount_brl, "BRL")
    },
    {
      key: "amount_usd",
      header: "Valor USD",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (expense) => formatMoney(expense.amount_usd, "USD")
    },
    { key: "currency", header: "Moeda", render: (expense) => expense.currency || "-" },
    { key: "is_from_preset", header: "Origem", render: (expense) => (expense.is_from_preset ? "Pré-cálculo" : "Manual") },
    { key: "applied_behavior", header: "Comportamento", render: (expense) => expense.applied_behavior_label || "-" },
    { key: "is_editable", header: "Editável", render: (expense) => (expense.is_manual || expense.is_editable ? "Sim" : "Não") },
    {
      key: "actions",
      header: "Ações",
      render: (expense) =>
        canEdit && (expense.is_manual || expense.is_editable) ? (
          <div className="flex flex-wrap gap-3 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setEditingExpenseId(expense.id)}
              className="font-semibold text-rpx-blue transition hover:text-rpx-navy"
            >
              Editar
            </button>
            <ConfirmDialog
              triggerLabel="Remover"
              title="Remover despesa"
              description="Tem certeza que deseja remover esta despesa da simulação final?"
            >
              <form action={handleDeleteExpense}>
                <input type="hidden" name="simulationId" value={simulationId} />
                <input type="hidden" name="expenseLineId" value={expense.id} />
                <ConfirmSubmitButton label="Remover despesa" />
              </form>
            </ConfirmDialog>
          </div>
        ) : (
          <span className="text-slate-400">Bloqueado</span>
        )
    }
  ];

  return (
    <section className="mt-6 grid gap-5 scroll-mt-24">
      <Card title="Despesas" description="Pré-cálculos e despesas manuais da simulação final.">
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total de despesas BRL</p>
            <p className="mt-1 text-2xl font-bold text-rpx-ink">{formatMoney(totalExpensesBrl, "BRL")}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            {expenses.length} {expenses.length === 1 ? "linha cadastrada" : "linhas cadastradas"}
          </div>
        </div>

        {canEdit && presets.length > 0 ? <ProcessPresetForm simulationId={simulationId} presets={presets} /> : null}

        {canEdit && presets.length === 0 ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Nenhum pré-cálculo ativo disponível para processar.
          </div>
        ) : null}

        <div className="mt-5">
          <DataTable columns={columns} rows={expenses} emptyLabel="Nenhuma despesa adicionada." />
        </div>
      </Card>

      {canEdit ? (
        <Card title={editingExpense ? "Editar despesa" : "Adicionar despesa manual"}>
          <ExpenseLineForm
            key={editingExpense?.id ?? "new-expense"}
            action={editingExpense ? updateSimulationExpenseLineAction : addManualSimulationExpenseAction}
            initialValues={
              editingExpense
                ? expenseLineToValues(editingExpense)
                : {
                    simulationId,
                    expenseName: "",
                    amountBrl: 0,
                    amountUsd: 0,
                    currency: "BRL"
                  }
            }
            submitLabel={editingExpense ? "Salvar despesa" : "Adicionar despesa"}
            onSaved={() => setEditingExpenseId(null)}
            onCancel={editingExpense ? () => setEditingExpenseId(null) : undefined}
          />
        </Card>
      ) : (
        <Card title="Despesas bloqueadas" description="Esta simulação final não pode receber alterações neste status." />
      )}
    </section>
  );
}
