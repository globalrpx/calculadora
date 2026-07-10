"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { generateAndStoreFinalSimulationInternalReportAction } from "./actions";
import { FinalSimulationDocumentModal } from "./FinalSimulationDocumentModal";

type InternalReportActionState = {
  success: boolean;
  message?: string;
  documentId?: string;
  viewUrl?: string;
  downloadUrl?: string;
  fileName?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Gerando relatório..." : "Gerar relatório interno"}
    </Button>
  );
}

export function FinalSimulationInternalReportPanel({ simulationId }: { simulationId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction] = useActionState<InternalReportActionState, FormData>(
    generateAndStoreFinalSimulationInternalReportAction,
    { success: false }
  );

  useEffect(() => {
    if (state.success) {
      setIsModalOpen(true);
    }
  }, [state.success, state.documentId]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Relatório interno</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gera um PDF interno a partir do snapshot interno salvo, com despesas, linhas fiscais, parametrizações e
            limitações do cálculo V1.
          </p>
        </div>
        <form action={formAction} className="flex justify-end">
          <input type="hidden" name="simulationId" value={simulationId} />
          <SubmitButton />
        </form>
      </div>

      {state.message ? (
        <DismissibleAlert variant={state.success ? "success" : "error"} className="mb-0 mt-4">
          {state.message}
        </DismissibleAlert>
      ) : null}

      {isModalOpen && state.success && state.viewUrl && state.downloadUrl ? (
        <FinalSimulationDocumentModal
          document={{
            viewUrl: state.viewUrl,
            downloadUrl: state.downloadUrl,
            fileName: state.fileName ?? "relatorio-interno.pdf",
            title: "Relatório interno gerado"
          }}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </section>
  );
}
