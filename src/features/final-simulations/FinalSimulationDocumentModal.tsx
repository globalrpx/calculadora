"use client";

import { Button } from "@/components/ui/Button";

export type FinalSimulationDocumentModalData = {
  viewUrl: string;
  downloadUrl: string;
  fileName: string;
  title?: string;
};

export function FinalSimulationDocumentModal({
  document,
  onClose
}: {
  document: FinalSimulationDocumentModalData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-rpx-ink">{document.title ?? "PDF cliente"}</h2>
            <p className="mt-1 text-sm text-slate-600">{document.fileName}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={document.downloadUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-rpx-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-rpx-navy"
            >
              Baixar PDF
            </a>
            <a
              href={document.viewUrl}
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
          <object data={document.viewUrl} type="application/pdf" className="h-[70vh] w-full rounded-md bg-white">
            <iframe
              title="Pré-visualização do documento"
              src={document.viewUrl}
              className="h-[70vh] w-full rounded-md bg-white"
            />
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Não foi possível pré-visualizar o PDF. Use Baixar PDF ou Abrir em nova aba.
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
