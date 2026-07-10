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

type TaxCalculationState = {
  success: boolean;
  message?: string;
  preview?: FinalSimulationTaxPreview;
};

function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(value ?? 0);
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
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-rpx-ink">{formatMoney(value)}</dd>
    </div>
  );
}

export function FinalSimulationTaxPreviewSection({
  simulationId,
  preview,
  persistedTaxLinesCount,
  canEdit
}: {
  simulationId: string;
  preview: FinalSimulationTaxPreview | null;
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

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <Card
      title="Cálculo Fiscal V1"
      description="Preview simplificado em memória e persistência das linhas fiscais brutas. Ainda não é o cálculo fiscal final."
    >
      <div className="mt-4 grid gap-4">
        {state.message ? (
          <DismissibleAlert variant={state.success ? "success" : "error"} className="mb-0">
            {state.message}
          </DismissibleAlert>
        ) : null}

        {currentPreview ? (
          <>
            <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryItem label="FOB BRL" value={currentPreview.totals.total_fob_brl} />
              <SummaryItem label="Despesas BRL" value={currentPreview.totals.total_expenses_brl} />
              <SummaryItem label="Base aduaneira" value={currentPreview.totals.total_customs_base_brl} />
              <SummaryItem label="Impostos brutos" value={currentPreview.totals.gross_taxes_brl} />
              <SummaryItem label="Créditos" value={currentPreview.totals.tax_credits_brl} />
              <SummaryItem label="Impostos líquidos" value={currentPreview.totals.net_taxes_brl} />
              <SummaryItem label="Comissão trade" value={currentPreview.totals.trade_commission_brl} />
              <SummaryItem label="Custo total estimado" value={currentPreview.totals.estimated_total_cost_brl} />
            </dl>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-semibold text-rpx-ink">{persistedTaxLinesCount}</span> linhas fiscais persistidas
              para esta simulação.
            </div>

            {currentPreview.warnings.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-900">Avisos do cálculo V1</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                  {currentPreview.warnings.map((warning, index) => (
                    <li key={`${warning.code}-${warning.itemId ?? "simulation"}-${index}`}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Preview fiscal indisponível para esta simulação.
          </div>
        )}

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
