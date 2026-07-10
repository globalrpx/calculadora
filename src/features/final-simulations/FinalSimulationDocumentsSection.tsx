"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  FinalSimulationDocumentModal,
  type FinalSimulationDocumentModalData
} from "./FinalSimulationDocumentModal";
import type { FinalSimulationDocumentRow } from "./types";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatFileSize(value: number | null | undefined) {
  if (!value || value <= 0) return "-";

  if (value < 1024 * 1024) {
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value / 1024)} KB`;
  }

  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value / (1024 * 1024))} MB`;
}

function documentTypeLabel(type: string) {
  if (type === "client_pdf") return "PDF cliente";
  if (type === "internal_detailed_report") return "Relatório interno";
  if (type === "pricing_excel") return "Pricing Excel";
  return type;
}

function buildDocumentModalData(document: FinalSimulationDocumentRow): FinalSimulationDocumentModalData {
  const viewUrl = `/admin/simulacoes-finais/${document.simulation_id}/documentos/${document.id}/pdf`;

  return {
    viewUrl,
    downloadUrl: `${viewUrl}?download=1`,
    fileName: document.file_name,
    title: documentTypeLabel(document.document_type)
  };
}

function DocumentActions({
  document,
  onPreview
}: {
  document: FinalSimulationDocumentRow;
  onPreview: (document: FinalSimulationDocumentRow) => void;
}) {
  const viewUrl = `/admin/simulacoes-finais/${document.simulation_id}/documentos/${document.id}/pdf`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      <Button type="button" variant="secondary" onClick={() => onPreview(document)}>
        Visualizar
      </Button>
      <a
        href={`${viewUrl}?download=1`}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-rpx-blue/20 bg-white px-4 py-2 text-sm font-semibold text-rpx-blue transition hover:bg-rpx-sky"
      >
        Baixar PDF
      </a>
      <a
        href={viewUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-rpx-blue transition hover:bg-rpx-sky"
      >
        Abrir em nova aba
      </a>
    </div>
  );
}

export function FinalSimulationDocumentsSection({
  documents
}: {
  documents: FinalSimulationDocumentRow[];
}) {
  const [previewDocument, setPreviewDocument] = useState<FinalSimulationDocumentRow | null>(null);
  const clientPdfDocuments = documents.filter((document) => document.document_type === "client_pdf");

  return (
    <>
      <Card title="Documentos gerados" description="Histórico de documentos salvos para esta simulação, do mais recente para o mais antigo.">
        {clientPdfDocuments.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {clientPdfDocuments.map((document, index) => (
              <article
                key={document.id}
                className={
                  index === 0
                    ? "rounded-md border border-rpx-blue/20 bg-rpx-sky p-4"
                    : "rounded-md border border-slate-200 bg-white p-4"
                }
              >
                <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h3 className="min-w-0 max-w-full break-words text-sm font-semibold text-rpx-ink">
                        {document.file_name}
                      </h3>
                      {index === 0 ? <StatusBadge variant="info">Mais recente</StatusBadge> : null}
                      <StatusBadge variant="neutral">{documentTypeLabel(document.document_type)}</StatusBadge>
                    </div>
                    <dl className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                      <div className="min-w-0">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gerado em</dt>
                        <dd className="mt-1 break-words">{formatDateTime(document.generated_at)}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gerado por</dt>
                        <dd className="mt-1 break-words">{document.generated_by_name ?? document.generated_by_email ?? "-"}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tamanho</dt>
                        <dd className="mt-1">{formatFileSize(document.size_bytes)}</dd>
                      </div>
                    </dl>
                  </div>
                  <DocumentActions document={document} onPreview={setPreviewDocument} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Nenhum PDF cliente gerado ainda.
          </div>
        )}
      </Card>

      {previewDocument ? (
        <FinalSimulationDocumentModal document={buildDocumentModalData(previewDocument)} onClose={() => setPreviewDocument(null)} />
      ) : null}
    </>
  );
}
