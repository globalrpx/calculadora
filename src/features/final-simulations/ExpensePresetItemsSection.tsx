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
  addExpensePresetItemAction,
  deleteExpensePresetItemAction,
  updateExpensePresetItemAction
} from "./actions";
import {
  expenseAllocationTypeLabels,
  expenseBehaviorLabels,
  expenseCalculationTypeLabels
} from "./expense-labels";
import {
  expenseAllocationTypeValues,
  expenseBehaviorValues,
  expenseCalculationTypeValues,
  type ExpensePresetItem,
  type ExpensePresetItemValues,
  type ExpenseType,
  type FinalSimulationActionState
} from "./types";

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

function itemToValues(item: ExpensePresetItem): ExpensePresetItemValues {
  return {
    expensePresetItemId: item.id,
    presetId: item.preset_id,
    expenseTypeId: item.expense_type_id,
    defaultAmountBrl: item.default_amount_brl,
    defaultAmountUsd: item.default_amount_usd,
    defaultCurrency: item.default_currency ?? "BRL",
    overrideCalculationType: item.override_calculation_type ?? undefined,
    overrideAllocationType: item.override_allocation_type ?? undefined,
    overrideBehavior: item.override_behavior ?? undefined,
    isEditable: item.is_editable,
    sortOrder: item.sort_order,
    notes: item.notes ?? undefined
  };
}

function ExpensePresetItemForm({
  action,
  initialValues,
  expenseTypes,
  submitLabel,
  onSaved,
  onCancel
}: {
  action: (
    previousState: FinalSimulationActionState<ExpensePresetItemValues>,
    formData: FormData
  ) => Promise<FinalSimulationActionState<ExpensePresetItemValues>>;
  initialValues: ExpensePresetItemValues;
  expenseTypes: ExpenseType[];
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
  const errors = state.fieldErrors ?? {};
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (state.success) {
      onSaved?.();
      router.refresh();
    }
  }, [onSaved, router, state.success]);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="presetId" value={initialValues.presetId} />
      {initialValues.expensePresetItemId ? (
        <input type="hidden" name="expensePresetItemId" value={initialValues.expensePresetItemId} />
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
        <FormField label="Tipo de despesa" error={errors.expenseTypeId} errorId="expenseTypeId-error">
          <SelectInput name="expenseTypeId" defaultValue={values.expenseTypeId ?? ""}>
            <option value="">Selecione</option>
            {expenseTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.code ? `${type.code} - ${type.description}` : type.description}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Valor padrão BRL" error={errors.defaultAmountBrl} errorId="defaultAmountBrl-error">
          <NumberInput name="defaultAmountBrl" defaultValue={values.defaultAmountBrl ?? 0} step="0.000001" />
        </FormField>
        <FormField label="Valor padrão USD" error={errors.defaultAmountUsd} errorId="defaultAmountUsd-error">
          <NumberInput name="defaultAmountUsd" defaultValue={values.defaultAmountUsd ?? 0} step="0.000001" />
        </FormField>
        <FormField label="Moeda" error={errors.defaultCurrency} errorId="defaultCurrency-error">
          <TextInput name="defaultCurrency" defaultValue={values.defaultCurrency ?? "BRL"} maxLength={3} />
        </FormField>
        <FormField label="Override cálculo" error={errors.overrideCalculationType} errorId="overrideCalculationType-error">
          <SelectInput name="overrideCalculationType" defaultValue={values.overrideCalculationType ?? ""}>
            <option value="">Sem override</option>
            {expenseCalculationTypeValues.map((value) => (
              <option key={value} value={value}>
                {expenseCalculationTypeLabels[value]}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Override rateio" error={errors.overrideAllocationType} errorId="overrideAllocationType-error">
          <SelectInput name="overrideAllocationType" defaultValue={values.overrideAllocationType ?? ""}>
            <option value="">Sem override</option>
            {expenseAllocationTypeValues.map((value) => (
              <option key={value} value={value}>
                {expenseAllocationTypeLabels[value]}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Override comportamento" error={errors.overrideBehavior} errorId="overrideBehavior-error">
          <SelectInput name="overrideBehavior" defaultValue={values.overrideBehavior ?? ""}>
            <option value="">Sem override</option>
            {expenseBehaviorValues.map((value) => (
              <option key={value} value={value}>
                {expenseBehaviorLabels[value]}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Ordem" error={errors.sortOrder} errorId="sortOrder-error">
          <NumberInput name="sortOrder" defaultValue={values.sortOrder ?? 0} step="1" />
        </FormField>
      </div>

      <FormField label="Observações" error={errors.notes} errorId="notes-error">
        <TextInput name="notes" defaultValue={values.notes ?? ""} />
      </FormField>

      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
        <input type="hidden" name="isEditable" value="false" />
        <input
          type="checkbox"
          name="isEditable"
          value="true"
          defaultChecked={values.isEditable ?? true}
          className="h-4 w-4 rounded border-slate-300 text-rpx-blue focus:ring-rpx-blue"
        />
        Editável
      </label>

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

export function ExpensePresetItemsSection({
  presetId,
  items,
  expenseTypes
}: {
  presetId: string;
  items: ExpensePresetItem[];
  expenseTypes: ExpenseType[];
}) {
  const router = useRouter();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = useMemo(
    () => items.find((item) => item.id === editingItemId) ?? null,
    [editingItemId, items]
  );
  const expenseTypeById = useMemo(
    () => new Map(expenseTypes.map((type) => [type.id, type])),
    [expenseTypes]
  );
  const handleDeleteItem = async (formData: FormData) => {
    await deleteExpensePresetItemAction(formData);
    router.refresh();
  };

  const columns: DataTableColumn<ExpensePresetItem>[] = [
    {
      key: "expense_type_id",
      header: "Tipo de despesa",
      render: (item) => {
        const type = expenseTypeById.get(item.expense_type_id);
        return item.expense_description_snapshot || type?.description || "-";
      }
    },
    {
      key: "default_amount_brl",
      header: "BRL",
      render: (item) => formatMoney(item.default_amount_brl, "BRL")
    },
    {
      key: "default_amount_usd",
      header: "USD",
      render: (item) => formatMoney(item.default_amount_usd, "USD")
    },
    { key: "default_currency", header: "Moeda", render: (item) => item.default_currency || "-" },
    {
      key: "override_calculation_type",
      header: "Cálculo",
      render: (item) =>
        item.override_calculation_type ? expenseCalculationTypeLabels[item.override_calculation_type] : "-"
    },
    {
      key: "override_allocation_type",
      header: "Rateio",
      render: (item) => (item.override_allocation_type ? expenseAllocationTypeLabels[item.override_allocation_type] : "-")
    },
    {
      key: "override_behavior",
      header: "Comportamento",
      render: (item) => (item.override_behavior ? expenseBehaviorLabels[item.override_behavior] : "-")
    },
    { key: "sort_order", header: "Ordem" },
    { key: "is_editable", header: "Editável", render: (item) => (item.is_editable ? "Sim" : "Não") },
    {
      key: "actions",
      header: "Ações",
      render: (item) => (
        <div className="flex flex-wrap gap-3 whitespace-nowrap">
          <button
            type="button"
            onClick={() => setEditingItemId(item.id)}
            className="font-semibold text-rpx-blue transition hover:text-rpx-navy"
          >
            Editar
          </button>
          <ConfirmDialog
            triggerLabel="Remover"
            title="Remover item do pré-cálculo"
            description="Este item será removido do cadastro mestre do pré-cálculo."
          >
            <form action={handleDeleteItem}>
              <input type="hidden" name="presetId" value={presetId} />
              <input type="hidden" name="expensePresetItemId" value={item.id} />
              <ConfirmSubmitButton label="Remover item" />
            </form>
          </ConfirmDialog>
        </div>
      )
    }
  ];

  return (
    <section className="grid gap-5">
      <Card title="Itens do pré-cálculo">
        <div className="mt-4">
          <DataTable columns={columns} rows={items} emptyLabel="Nenhum item cadastrado neste pré-cálculo." />
        </div>
      </Card>

      <Card title={editingItem ? "Editar item" : "Adicionar item"}>
        <ExpensePresetItemForm
          key={editingItem?.id ?? "new-preset-item"}
          action={editingItem ? updateExpensePresetItemAction : addExpensePresetItemAction}
          initialValues={
            editingItem
              ? itemToValues(editingItem)
              : {
                  presetId,
                  expenseTypeId: "",
                  defaultAmountBrl: 0,
                  defaultAmountUsd: 0,
                  defaultCurrency: "BRL",
                  isEditable: true,
                  sortOrder: 0
                }
          }
          expenseTypes={expenseTypes}
          submitLabel={editingItem ? "Salvar item" : "Adicionar item"}
          onSaved={() => setEditingItemId(null)}
          onCancel={editingItem ? () => setEditingItemId(null) : undefined}
        />
      </Card>
    </section>
  );
}
