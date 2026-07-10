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
import { FormField, NumberInput, TextInput } from "@/components/ui/FormField";
import {
  addFinalSimulationItemAction,
  deleteFinalSimulationItemAction,
  updateFinalSimulationItemAction
} from "./actions";
import type {
  FinalSimulationActionState,
  FinalSimulationItemRow,
  FinalSimulationItemValues,
  NcmCodeRow
} from "./types";

const ncmValidationMessage = "NCM e alíquotas sujeitos à validação final pela equipe RPX.";

function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(value ?? 0);
}

function formatMoney(value: number | null | undefined, currency = "USD") {
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

function itemToValues(item: FinalSimulationItemRow): FinalSimulationItemValues {
  return {
    itemId: item.id,
    simulationId: item.simulation_id,
    productName: item.product_name ?? undefined,
    productDescription: item.product_description,
    hsCode: item.hs_code ?? undefined,
    ncm: item.ncm,
    unit: item.unit ?? undefined,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    currency: item.currency ?? "USD",
    unitNetWeight: item.unit_net_weight,
    unitGrossWeight: item.unit_gross_weight,
    iiRate: item.ii_rate,
    ipiRate: item.ipi_rate,
    pisRate: item.pis_rate,
    cofinsRate: item.cofins_rate,
    internalConsumption: item.internal_consumption,
    fiscalException: item.fiscal_exception ?? undefined,
    reducedBaseRate: item.reduced_base_rate
  };
}

function ItemForm({
  action,
  initialValues,
  ncmOptions,
  submitLabel,
  onSaved,
  onCancel
}: {
  action: (
    previousState: FinalSimulationActionState<FinalSimulationItemValues>,
    formData: FormData
  ) => Promise<FinalSimulationActionState<FinalSimulationItemValues>>;
  initialValues: FinalSimulationItemValues;
  ncmOptions: NcmCodeRow[];
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
      {initialValues.itemId ? <input type="hidden" name="itemId" value={initialValues.itemId} /> : null}

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
        <FormField
          label="Descrição do produto"
          error={fieldError(state, "productDescription")}
          errorId="productDescription-error"
        >
          <TextInput
            name="productDescription"
            defaultValue={values.productDescription ?? ""}
            aria-invalid={Boolean(fieldError(state, "productDescription"))}
            aria-describedby={fieldError(state, "productDescription") ? "productDescription-error" : undefined}
          />
        </FormField>

        <FormField label="Nome curto" error={fieldError(state, "productName")} errorId="productName-error">
          <TextInput name="productName" defaultValue={values.productName ?? ""} />
        </FormField>

        <FormField label="NCM" error={fieldError(state, "ncm")} errorId="ncm-error" help={ncmValidationMessage}>
          <TextInput
            name="ncm"
            list="final-simulation-ncm-options"
            defaultValue={values.ncm ?? ""}
            aria-invalid={Boolean(fieldError(state, "ncm"))}
            aria-describedby={fieldError(state, "ncm") ? "ncm-error" : undefined}
          />
        </FormField>

        <FormField label="HS Code" error={fieldError(state, "hsCode")} errorId="hsCode-error">
          <TextInput name="hsCode" defaultValue={values.hsCode ?? ""} />
        </FormField>

        <FormField label="Quantidade" error={fieldError(state, "quantity")} errorId="quantity-error">
          <NumberInput name="quantity" defaultValue={values.quantity ?? 0} step="0.000001" />
        </FormField>

        <FormField label="Preço unitário" error={fieldError(state, "unitPrice")} errorId="unitPrice-error">
          <NumberInput name="unitPrice" defaultValue={values.unitPrice ?? 0} step="0.000001" />
        </FormField>

        <FormField label="Peso líquido unitário" error={fieldError(state, "unitNetWeight")} errorId="unitNetWeight-error">
          <NumberInput name="unitNetWeight" defaultValue={values.unitNetWeight ?? 0} step="0.000001" />
        </FormField>

        <FormField label="Peso bruto unitário" error={fieldError(state, "unitGrossWeight")} errorId="unitGrossWeight-error">
          <NumberInput name="unitGrossWeight" defaultValue={values.unitGrossWeight ?? 0} step="0.000001" />
        </FormField>

        <FormField label="Alíquota II (%)" error={fieldError(state, "iiRate")} errorId="iiRate-error">
          <NumberInput name="iiRate" defaultValue={values.iiRate ?? 0} step="0.0001" />
        </FormField>

        <FormField label="Alíquota IPI (%)" error={fieldError(state, "ipiRate")} errorId="ipiRate-error">
          <NumberInput name="ipiRate" defaultValue={values.ipiRate ?? 0} step="0.0001" />
        </FormField>

        <FormField label="Alíquota PIS (%)" error={fieldError(state, "pisRate")} errorId="pisRate-error">
          <NumberInput name="pisRate" defaultValue={values.pisRate ?? 0} step="0.0001" />
        </FormField>

        <FormField label="Alíquota COFINS (%)" error={fieldError(state, "cofinsRate")} errorId="cofinsRate-error">
          <NumberInput name="cofinsRate" defaultValue={values.cofinsRate ?? 0} step="0.0001" />
        </FormField>

        <FormField label="Taxa base reduzida" error={fieldError(state, "reducedBaseRate")} errorId="reducedBaseRate-error">
          <NumberInput name="reducedBaseRate" defaultValue={values.reducedBaseRate ?? 0} step="0.0001" />
        </FormField>

        <FormField label="Unidade" error={fieldError(state, "unit")} errorId="unit-error">
          <TextInput name="unit" defaultValue={values.unit ?? ""} placeholder="un, kg, caixa..." />
        </FormField>
      </div>

      <FormField label="Exceção fiscal" error={fieldError(state, "fiscalException")} errorId="fiscalException-error">
        <TextInput name="fiscalException" defaultValue={values.fiscalException ?? ""} />
      </FormField>

      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          name="internalConsumption"
          defaultChecked={Boolean(values.internalConsumption)}
          className="h-4 w-4 rounded border-slate-300 text-rpx-blue focus:ring-rpx-blue"
        />
        Consumo interno
      </label>

      <datalist id="final-simulation-ncm-options">
        {ncmOptions.map((ncm) => (
          <option key={ncm.id} value={ncm.code}>
            {ncm.description}
          </option>
        ))}
      </datalist>

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

export function FinalSimulationItemsSection({
  simulationId,
  items,
  ncmOptions,
  ncmSearch,
  canEdit
}: {
  simulationId: string;
  items: FinalSimulationItemRow[];
  ncmOptions: NcmCodeRow[];
  ncmSearch?: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = useMemo(
    () => items.find((item) => item.id === editingItemId) ?? null,
    [editingItemId, items]
  );
  const handleDeleteItem = async (formData: FormData) => {
    await deleteFinalSimulationItemAction(formData);
    router.refresh();
  };

  const columns: DataTableColumn<FinalSimulationItemRow>[] = [
    {
      key: "product_description",
      header: "Descrição",
      render: (item) => (
        <div className="min-w-56">
          <p className="font-semibold text-rpx-ink">{item.product_description}</p>
          {item.ncm_official_description ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.ncm_official_description}</p>
          ) : (
            <p className="mt-1 text-xs font-semibold text-amber-700">NCM não encontrado na base local.</p>
          )}
        </div>
      )
    },
    { key: "ncm", header: "NCM", className: "whitespace-nowrap font-mono text-xs" },
    {
      key: "ii_rate",
      header: "II",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => `${formatNumber(item.ii_rate, { maximumFractionDigits: 4 })}%`
    },
    {
      key: "ipi_rate",
      header: "IPI",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => `${formatNumber(item.ipi_rate, { maximumFractionDigits: 4 })}%`
    },
    {
      key: "pis_rate",
      header: "PIS",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => `${formatNumber(item.pis_rate, { maximumFractionDigits: 4 })}%`
    },
    {
      key: "cofins_rate",
      header: "COFINS",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => `${formatNumber(item.cofins_rate, { maximumFractionDigits: 4 })}%`
    },
    {
      key: "unit_net_weight",
      header: "PL unit.",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => `${formatNumber(item.unit_net_weight)} kg`
    },
    {
      key: "unit_gross_weight",
      header: "PB unit.",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => `${formatNumber(item.unit_gross_weight)} kg`
    },
    {
      key: "quantity",
      header: "Qtd.",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => formatNumber(item.quantity, { maximumFractionDigits: 6 })
    },
    {
      key: "unit_price",
      header: "Unitário",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => formatMoney(item.unit_price, item.currency ?? "USD")
    },
    {
      key: "total_net_weight",
      header: "PL total",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => `${formatNumber(item.total_net_weight)} kg`
    },
    {
      key: "total_gross_weight",
      header: "PB total",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      render: (item) => `${formatNumber(item.total_gross_weight)} kg`
    },
    {
      key: "total_price",
      header: "Total",
      headerClassName: "text-right",
      className: "text-right font-semibold tabular-nums text-rpx-ink",
      render: (item) => formatMoney(item.total_price, item.currency ?? "USD")
    },
    {
      key: "actions",
      header: "Ações",
      render: (item) =>
        canEdit ? (
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
              title="Remover produto"
              description="Tem certeza que deseja remover este produto da simulação final?"
            >
              <form action={handleDeleteItem}>
                <input type="hidden" name="simulationId" value={simulationId} />
                <input type="hidden" name="itemId" value={item.id} />
                <ConfirmSubmitButton label="Remover produto" />
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
      <Card title="Produtos" description="Itens importados, NCM local, alíquotas e totais básicos por produto.">
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {ncmValidationMessage}
        </div>

        <form action={`/admin/simulacoes-finais/${simulationId}`} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextInput
            name="ncmSearch"
            defaultValue={ncmSearch ?? ""}
            placeholder="Buscar NCM por código ou descrição"
            className="sm:max-w-md"
          />
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            Buscar NCM
          </Button>
        </form>

        {ncmSearch && ncmSearch.length >= 2 && ncmOptions.length === 0 ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            NCM não encontrado na base local. A inclusão continua permitida nesta versão.
          </div>
        ) : null}

        <div className="mt-5">
          <DataTable columns={columns} rows={items} emptyLabel="Nenhum produto adicionado." />
        </div>
      </Card>

      {canEdit ? (
        <Card title={editingItem ? "Editar produto" : "Adicionar produto"}>
          <ItemForm
            key={editingItem?.id ?? "new-item"}
            action={editingItem ? updateFinalSimulationItemAction : addFinalSimulationItemAction}
            initialValues={
              editingItem
                ? itemToValues(editingItem)
                : {
                    simulationId,
                    productDescription: "",
                    ncm: "",
                    quantity: 0,
                    unitPrice: 0,
                    currency: "USD",
                    unitNetWeight: 0,
                    unitGrossWeight: 0,
                    iiRate: 0,
                    ipiRate: 0,
                    pisRate: 0,
                    cofinsRate: 0,
                    reducedBaseRate: 0
                  }
            }
            ncmOptions={ncmOptions}
            submitLabel={editingItem ? "Salvar produto" : "Adicionar produto"}
            onSaved={() => setEditingItemId(null)}
            onCancel={editingItem ? () => setEditingItemId(null) : undefined}
          />
        </Card>
      ) : (
        <Card title="Produtos bloqueados" description="Esta simulação final não pode receber alterações neste status." />
      )}
    </section>
  );
}
