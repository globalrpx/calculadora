"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { recalculateFinalSimulationTaxesAction } from "./actions";
import type { FinalSimulationTaxPreview } from "./calculation-engine";
import type { SimulationTaxLineWithProduct } from "./types";

type TaxCalculationState = {
  success: boolean;
  message?: string;
  preview?: FinalSimulationTaxPreview;
};

type SavedTaxCalculationSnapshot = {
  formula_version?: string;
  scope?: string;
  totals?: FinalSimulationTaxPreview["totals"];
  warnings?: FinalSimulationTaxPreview["warnings"];
  meta?: FinalSimulationTaxPreview["meta"];
  persisted_tax_lines_count?: number;
  calculated_at?: string;
};

function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(value ?? 0);
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value ?? 0);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Recalculando..." : "Recalcular impostos"}
    </Button>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-base font-bold text-rpx-ink">{formatMoney(value)}</dd>
    </div>
  );
}

function isSavedTaxCalculationSnapshot(value: Record<string, unknown> | null | undefined): value is SavedTaxCalculationSnapshot {
  return Boolean(value && value.scope === "tax_recalculation" && typeof value.totals === "object" && value.totals);
}

function taxTypeLabel(value: string) {
  const labels: Record<string, string> = {
    II: "II",
    IPI: "IPI",
    PIS_IMPORTACAO: "PIS Importação",
    COFINS_IMPORTACAO: "COFINS Importação",
    ICMS: "ICMS",
    AFRMM: "AFRMM",
    ANTIDUMPING: "Antidumping",
    OUTROS: "Outros"
  };

  return labels[value] ?? value;
}

export function FinalSimulationTaxPreviewSection({
  simulationId,
  preview,
  savedSnapshot,
  taxLines,
  persistedTaxLinesCount,
  canEdit
}: {
  simulationId: string;
  preview: FinalSimulationTaxPreview | null;
  savedSnapshot: Record<string, unknown>;
  taxLines: SimulationTaxLineWithProduct[];
  persistedTaxLinesCount: number;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<TaxCalculationState, FormData>(
    async (_previousState, formData) => recalculateFinalSimulationTaxesAction(formData),
    {
      success: false,
      preview: preview ?? undefined
    }
  );
  const currentPreview = state.preview ?? preview;
  const savedCalculation = isSavedTaxCalculationSnapshot(savedSnapshot) ? savedSnapshot : null;
  const savedTotals = savedCalculation?.totals ?? null;
  const savedWarnings = savedCalculation?.warnings ?? [];
  const isCalculated = Boolean(savedCalculation && taxLines.length > 0);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <Card
      title="Cálculo Fiscal V1"
      description="Preview simplificado em memória e persistência das linhas fiscais brutas. Ainda não é o cálculo fiscal final."
      className="mt-6"
    >
      <div className="mt-4 grid gap-4">
        {state.message ? (
          <DismissibleAlert variant={state.success ? "success" : "error"} className="mb-0">
            {state.message}
          </DismissibleAlert>
        ) : null}

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status do cálculo</p>
            <p className="mt-1 text-base font-bold text-rpx-ink">{isCalculated ? "Calculado" : "Não calculado"}</p>
          </div>
          {savedCalculation ? (
            <dl className="grid gap-3 sm:grid-cols-2 lg:text-right">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fórmula</dt>
                <dd className="mt-1 font-semibold text-rpx-ink">{savedCalculation.formula_version ?? "tax-preview-v1"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calculado em</dt>
                <dd className="mt-1 font-semibold text-rpx-ink">{formatDateTime(savedCalculation.calculated_at)}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        {savedTotals ? (
          <>
            <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryItem label="FOB BRL" value={savedTotals.total_fob_brl} />
              <SummaryItem label="Despesas BRL" value={savedTotals.total_expenses_brl} />
              <SummaryItem label="Base aduaneira" value={savedTotals.total_customs_base_brl} />
              <SummaryItem label="Impostos brutos" value={savedTotals.gross_taxes_brl} />
              <SummaryItem label="Créditos" value={savedTotals.tax_credits_brl} />
              <SummaryItem label="Impostos líquidos" value={savedTotals.net_taxes_brl} />
              <SummaryItem label="Comissão trade" value={savedTotals.trade_commission_brl} />
              <SummaryItem label="Custo total estimado" value={savedTotals.estimated_total_cost_brl} />
            </dl>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-semibold text-rpx-ink">{persistedTaxLinesCount}</span> linhas fiscais persistidas
              para esta simulação.
            </div>

            {savedWarnings.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-900">Avisos do cálculo V1</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                  {savedWarnings.map((warning, index) => (
                    <li key={`${warning.code}-${warning.itemId ?? "simulation"}-${index}`}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Nenhum cálculo fiscal salvo ainda. Use Recalcular impostos para gerar as linhas.
          </div>
        )}

        {taxLines.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Produto</th>
                  <th className="px-3 py-2">NCM</th>
                  <th className="px-3 py-2">Imposto</th>
                  <th className="px-3 py-2 text-right">Base BRL</th>
                  <th className="px-3 py-2 text-right">Alíquota %</th>
                  <th className="px-3 py-2 text-right">Valor BRL</th>
                  <th className="px-3 py-2">Manual?</th>
                  <th className="px-3 py-2">Observação/ajuste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {taxLines.map((line) => (
                  <tr key={line.id}>
                    <td className="min-w-48 px-3 py-2 text-rpx-ink">{line.product_description || "-"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{line.ncm || "-"}</td>
                    <td className="px-3 py-2 font-semibold text-rpx-ink">{taxTypeLabel(line.tax_type)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-700">{formatMoney(line.base_amount_brl)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-700">{formatNumber(line.rate_percent)}%</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums text-rpx-ink">{formatMoney(line.amount_brl)}</td>
                    <td className="px-3 py-2 text-slate-600">{line.is_manual_adjustment ? "Sim" : "Não"}</td>
                    <td className="px-3 py-2 text-slate-600">{line.manual_adjustment_reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {currentPreview && !savedTotals ? (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-500">
            Preview atual disponível em memória. O resumo e as linhas serão exibidos após o recálculo manual.
          </div>
        ) : null}

        {canEdit ? (
          <form action={formAction} className="flex justify-end">
            <input type="hidden" name="simulationId" value={simulationId} />
            <SubmitButton />
          </form>
        ) : (
          <DismissibleAlert variant="warning" className="mb-0">
            Simulações aprovadas, enviadas ao cliente ou arquivadas não permitem recálculo comum.
          </DismissibleAlert>
        )}
      </div>
    </Card>
  );
}
