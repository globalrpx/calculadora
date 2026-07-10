"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { generateAndStoreFinalSimulationClientPdfAction } from "./actions";
import { FinalSimulationDocumentModal } from "./FinalSimulationDocumentModal";

type ClientPdfActionState = {
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
      {pending ? "Gerando PDF..." : "Gerar PDF cliente"}
    </Button>
  );
}

export function FinalSimulationClientPdfPanel({ simulationId }: { simulationId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction] = useActionState<ClientPdfActionState, FormData>(
    generateAndStoreFinalSimulationClientPdfAction,
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">PDF cliente</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gera o PDF a partir do snapshot público, salva no bucket privado e abre a pré-visualização sem sair da tela.
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
            fileName: state.fileName ?? "simulacao-cliente.pdf",
            title: "PDF cliente gerado"
          }}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </section>
  );
}
