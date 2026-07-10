"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { generateAndStoreFinalSimulationClientPdfAction } from "./actions";

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

function PdfPreviewModal({
  state,
  onClose
}: {
  state: ClientPdfActionState;
  onClose: () => void;
}) {
  if (!state.success || !state.viewUrl || !state.downloadUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-rpx-ink">PDF cliente gerado</h2>
            <p className="mt-1 text-sm text-slate-600">{state.fileName ?? "simulacao-cliente.pdf"}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={state.downloadUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-rpx-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-rpx-navy"
            >
              Baixar PDF
            </a>
            <a
              href={state.viewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-rpx-blue/20 bg-white px-4 py-2 text-sm font-semibold text-rpx-blue transition hover:bg-rpx-sky"
            >
              Abrir em nova aba
            </a>
            <Button type="button" variant="ghost" aria-label="Fechar modal" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-slate-100 p-3">
          <object data={state.viewUrl} type="application/pdf" className="h-[70vh] w-full rounded-md bg-white">
            <iframe title="Pré-visualização do PDF cliente" src={state.viewUrl} className="h-[70vh] w-full rounded-md bg-white" />
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Não foi possível pré-visualizar o PDF. Use Baixar PDF ou Abrir em nova aba.
            </div>
          </object>
        </div>
      </div>
    </div>
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

      {isModalOpen ? <PdfPreviewModal state={state} onClose={() => setIsModalOpen(false)} /> : null}
    </section>
  );
}
