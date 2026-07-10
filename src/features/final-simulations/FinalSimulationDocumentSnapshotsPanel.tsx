"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { generateFinalSimulationDocumentSnapshotsAction } from "./actions";

type SnapshotActionState = {
  success: boolean;
  message?: string;
  generatedAt?: string;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Não gerado";
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
      {pending ? "Gerando..." : "Gerar snapshots dos documentos"}
    </Button>
  );
}

export function FinalSimulationDocumentSnapshotsPanel({
  simulationId,
  hasSavedCalculation,
  publicSnapshotGeneratedAt,
  internalSnapshotGeneratedAt
}: {
  simulationId: string;
  hasSavedCalculation: boolean;
  publicSnapshotGeneratedAt: string | null;
  internalSnapshotGeneratedAt: string | null;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<SnapshotActionState, FormData>(
    generateFinalSimulationDocumentSnapshotsAction,
    { success: false }
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  const currentGeneratedAt = state.generatedAt ?? null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Snapshots dos documentos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gera e salva a base congelada do PDF cliente e do relatório interno. Esta ação não gera PDF nem grava arquivo
            em Storage.
          </p>
        </div>
        <form action={formAction} className="flex justify-end">
          <input type="hidden" name="simulationId" value={simulationId} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <SubmitButton />
            <ButtonLink href={`/admin/simulacoes-finais/${simulationId}/pdf-cliente`} variant="secondary">
              Abrir PDF cliente
            </ButtonLink>
          </div>
        </form>
      </div>

      {state.message ? (
        <DismissibleAlert variant={state.success ? "success" : "error"} className="mb-0 mt-4">
          {state.message}
        </DismissibleAlert>
      ) : null}

      {!hasSavedCalculation ? (
        <DismissibleAlert variant="warning" className="mb-0 mt-4">
          Recalcule os impostos antes de gerar os snapshots dos documentos.
        </DismissibleAlert>
      ) : null}

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Snapshot público</dt>
          <dd className="mt-1 font-semibold text-rpx-ink">
            {formatDateTime(currentGeneratedAt ?? publicSnapshotGeneratedAt)}
          </dd>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Snapshot interno</dt>
          <dd className="mt-1 font-semibold text-rpx-ink">
            {formatDateTime(currentGeneratedAt ?? internalSnapshotGeneratedAt)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
