"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import { updateFinalSimulationFiscalSettingsAction } from "./actions";
import { invoiceParametrizationTaxRegimeLabels, tradeCommissionModeLabels } from "./fiscal-labels";
import {
  tradeCommissionModeValues,
  type FinalSimulationActionState,
  type FinalSimulationFiscalSettingsInput,
  type InvoiceParametrizationOption,
  type InvoiceParametrizationTaxRegime
} from "./types";

type FiscalSnapshot = {
  code?: string;
  description?: string;
  cfop?: string | null;
  tax_regime?: InvoiceParametrizationTaxRegime | null;
  icms_rate?: number | null;
};

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

function formatPercent(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value ?? 0);
}

function isFiscalSnapshot(value: Record<string, unknown> | null | undefined): value is FiscalSnapshot {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

function SnapshotSummary({
  title,
  snapshot
}: {
  title: string;
  snapshot: Record<string, unknown> | null | undefined;
}) {
  if (!isFiscalSnapshot(snapshot)) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        Nenhum snapshot salvo para {title}.
      </div>
    );
  }

  const regime =
    snapshot.tax_regime && snapshot.tax_regime in invoiceParametrizationTaxRegimeLabels
      ? invoiceParametrizationTaxRegimeLabels[snapshot.tax_regime]
      : "-";

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Snapshot atual de {title}</p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-600">Código</dt>
          <dd className="mt-1 text-rpx-ink">{snapshot.code || "-"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600">CFOP</dt>
          <dd className="mt-1 text-rpx-ink">{snapshot.cfop || "-"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-slate-600">Descrição</dt>
          <dd className="mt-1 text-rpx-ink">{snapshot.description || "-"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600">Regime</dt>
          <dd className="mt-1 text-rpx-ink">{regime}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600">ICMS</dt>
          <dd className="mt-1 text-rpx-ink">{formatPercent(snapshot.icms_rate)}%</dd>
        </div>
      </dl>
    </div>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked
}: {
  name: keyof FinalSimulationFiscalSettingsInput;
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

function optionLabel(option: InvoiceParametrizationOption) {
  const suffix = option.customer_name ? ` - ${option.customer_name}` : "";
  return `${option.code} - ${option.description}${suffix}`;
}

export function FinalSimulationFiscalSection({
  simulationId,
  values,
  entryOptions,
  exitOptions,
  entrySnapshot,
  exitSnapshot,
  canEdit
}: {
  simulationId: string;
  values: FinalSimulationFiscalSettingsInput;
  entryOptions: InvoiceParametrizationOption[];
  exitOptions: InvoiceParametrizationOption[];
  entrySnapshot: Record<string, unknown>;
  exitSnapshot: Record<string, unknown>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const initialMode = values.tradeCommissionMode || "none";
  const [entryInvoiceParametrizationId, setEntryInvoiceParametrizationId] = useState(
    values.entryInvoiceParametrizationId ?? ""
  );
  const [exitInvoiceParametrizationId, setExitInvoiceParametrizationId] = useState(
    values.exitInvoiceParametrizationId ?? ""
  );
  const [commissionMode, setCommissionMode] = useState<string>(initialMode);
  const [state, formAction] = useActionState(updateFinalSimulationFiscalSettingsAction, {
    success: false,
    values
  });
  const currentValues = state.values ?? values;
  const hasErrors = Boolean(state.fieldErrors && Object.keys(state.fieldErrors).length > 0);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    router.refresh();
  }, [router, state.success]);

  useEffect(() => {
    setEntryInvoiceParametrizationId(currentValues.entryInvoiceParametrizationId ?? "");
    setExitInvoiceParametrizationId(currentValues.exitInvoiceParametrizationId ?? "");
    setCommissionMode(currentValues.tradeCommissionMode || "none");
  }, [
    currentValues.entryInvoiceParametrizationId,
    currentValues.exitInvoiceParametrizationId,
    currentValues.tradeCommissionMode
  ]);

  return (
    <Card
      title="Parametrização Fiscal"
      description="Selecione NF entrada/saída, créditos tributários e comissão da trade. O snapshot é salvo no servidor."
      className="mt-6"
    >
      <form action={formAction} className="mt-4 grid gap-5" noValidate>
        <input type="hidden" name="simulationId" value={simulationId} />

        {state.message ? (
          <DismissibleAlert
            key={`${state.message}-${JSON.stringify(state.fieldErrors)}`}
            variant={hasErrors ? "warning" : state.success ? "success" : "error"}
            className="mb-0"
          >
            {state.message}
          </DismissibleAlert>
        ) : null}

        {!canEdit ? (
          <DismissibleAlert variant="warning" className="mb-0">
            Simulações aprovadas, enviadas ao cliente ou arquivadas não permitem alteração comum de parametrização fiscal.
          </DismissibleAlert>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-4">
            <div>
              <h2 className="text-sm font-bold uppercase text-rpx-ink">NF Entrada</h2>
              <p className="mt-1 text-sm text-slate-600">A opção ativa selecionada será salva em snapshot pela action server-side.</p>
            </div>
            <FormField
              label="Parametrização de entrada"
              error={fieldError(state, "entryInvoiceParametrizationId")}
              errorId="entryInvoiceParametrizationId-error"
            >
              <SelectInput
                name="entryInvoiceParametrizationId"
                value={entryInvoiceParametrizationId}
                onChange={(event) => setEntryInvoiceParametrizationId(event.target.value)}
                disabled={!canEdit}
                aria-invalid={Boolean(fieldError(state, "entryInvoiceParametrizationId"))}
                aria-describedby={fieldError(state, "entryInvoiceParametrizationId") ? "entryInvoiceParametrizationId-error" : undefined}
              >
                <option value="">Nenhuma</option>
                {entryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {optionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <SnapshotSummary title="NF Entrada" snapshot={entrySnapshot} />
          </section>

          <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-4">
            <div>
              <h2 className="text-sm font-bold uppercase text-rpx-ink">NF Saída</h2>
              <p className="mt-1 text-sm text-slate-600">A opção ativa selecionada será salva em snapshot pela action server-side.</p>
            </div>
            <FormField
              label="Parametrização de saída"
              error={fieldError(state, "exitInvoiceParametrizationId")}
              errorId="exitInvoiceParametrizationId-error"
            >
              <SelectInput
                name="exitInvoiceParametrizationId"
                value={exitInvoiceParametrizationId}
                onChange={(event) => setExitInvoiceParametrizationId(event.target.value)}
                disabled={!canEdit}
                aria-invalid={Boolean(fieldError(state, "exitInvoiceParametrizationId"))}
                aria-describedby={fieldError(state, "exitInvoiceParametrizationId") ? "exitInvoiceParametrizationId-error" : undefined}
              >
                <option value="">Nenhuma</option>
                {exitOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {optionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <SnapshotSummary title="NF Saída" snapshot={exitSnapshot} />
          </section>
        </div>

        <section className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div>
            <h2 className="text-sm font-bold uppercase text-rpx-ink">Créditos tributários</h2>
            <p className="mt-1 text-sm text-slate-600">Registre a configuração para validação fiscal posterior.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CheckboxField name="creditsIpi" label="Crédito IPI" defaultChecked={currentValues.creditsIpi} />
            <CheckboxField name="creditsPis" label="Crédito PIS" defaultChecked={currentValues.creditsPis} />
            <CheckboxField name="creditsCofins" label="Crédito COFINS" defaultChecked={currentValues.creditsCofins} />
            <CheckboxField name="creditsIcms" label="Crédito ICMS" defaultChecked={currentValues.creditsIcms} />
          </div>
          <FormField label="Notas fiscais internas" error={fieldError(state, "taxCreditNotes")} errorId="taxCreditNotes-error">
            <textarea
              name="taxCreditNotes"
              defaultValue={currentValues.taxCreditNotes ?? ""}
              disabled={!canEdit}
              rows={3}
              className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </FormField>
        </section>

        <section className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div>
            <h2 className="text-sm font-bold uppercase text-rpx-ink">Comissão Trade</h2>
            <p className="mt-1 text-sm text-slate-600">A comissão é apenas registrada; ainda não altera totais financeiros finais.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <FormField
              label="Modo de comissão"
              error={fieldError(state, "tradeCommissionMode")}
              errorId="tradeCommissionMode-error"
            >
              <SelectInput
                name="tradeCommissionMode"
                value={commissionMode}
                onChange={(event) => setCommissionMode(event.target.value)}
                disabled={!canEdit}
                aria-invalid={Boolean(fieldError(state, "tradeCommissionMode"))}
                aria-describedby={fieldError(state, "tradeCommissionMode") ? "tradeCommissionMode-error" : undefined}
              >
                {tradeCommissionModeValues.map((value) => (
                  <option key={value} value={value}>
                    {tradeCommissionModeLabels[value]}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            {commissionMode === "percent" ? (
              <FormField
                label="Percentual (%)"
                error={fieldError(state, "tradeCommissionPercent")}
                errorId="tradeCommissionPercent-error"
              >
                <TextInput
                  name="tradeCommissionPercent"
                  inputMode="decimal"
                  defaultValue={currentValues.tradeCommissionPercent ?? 0}
                  disabled={!canEdit}
                  aria-invalid={Boolean(fieldError(state, "tradeCommissionPercent"))}
                  aria-describedby={fieldError(state, "tradeCommissionPercent") ? "tradeCommissionPercent-error" : undefined}
                />
              </FormField>
            ) : (
              <input type="hidden" name="tradeCommissionPercent" value="0" />
            )}

            {commissionMode === "fixed_expense" ? (
              <FormField
                label="Valor fixo BRL"
                error={fieldError(state, "tradeCommissionAmountBrl")}
                errorId="tradeCommissionAmountBrl-error"
              >
                <TextInput
                  name="tradeCommissionAmountBrl"
                  inputMode="decimal"
                  defaultValue={currentValues.tradeCommissionAmountBrl ?? 0}
                  disabled={!canEdit}
                  aria-invalid={Boolean(fieldError(state, "tradeCommissionAmountBrl"))}
                  aria-describedby={fieldError(state, "tradeCommissionAmountBrl") ? "tradeCommissionAmountBrl-error" : undefined}
                />
              </FormField>
            ) : (
              <input type="hidden" name="tradeCommissionAmountBrl" value="0" />
            )}
          </div>

          <CheckboxField
            name="ignoreTradeCommissionContract"
            label="Ignorar comissão prevista em contrato"
            defaultChecked={currentValues.ignoreTradeCommissionContract}
          />
        </section>

        {canEdit ? (
          <div className="flex justify-end">
            <SubmitButton>Salvar parametrização fiscal</SubmitButton>
          </div>
        ) : null}
      </form>
    </Card>
  );
}
