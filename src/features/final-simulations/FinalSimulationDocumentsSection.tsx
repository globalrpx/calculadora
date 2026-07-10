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
    <div className="grid w-full grid-cols-1 gap-2 2xl:w-auto 2xl:flex 2xl:flex-shrink-0 2xl:items-center 2xl:justify-end">
      <Button type="button" variant="secondary" className="w-full whitespace-nowrap 2xl:w-auto" onClick={() => onPreview(document)}>
        Visualizar
      </Button>
      <a
        href={`${viewUrl}?download=1`}
        className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-md border border-rpx-blue/20 bg-white px-4 py-2 text-sm font-semibold text-rpx-blue transition hover:bg-rpx-sky 2xl:w-auto"
      >
        Baixar PDF
      </a>
      <a
        href={viewUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold text-rpx-blue transition hover:bg-rpx-sky 2xl:w-auto"
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
          <div className="mt-4 space-y-3">
            {clientPdfDocuments.map((document, index) => (
              <article
                key={document.id}
                className={
                  index === 0
                    ? "rounded-md border border-rpx-blue/20 bg-rpx-sky p-4"
                    : "rounded-md border border-slate-200 bg-white p-4"
                }
              >
                <div className="flex min-w-0 flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
                  <div className="w-full min-w-0 flex-1">
                    <div className="w-full min-w-0">
                      <h3 className="block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-5 text-rpx-ink">
                        {document.file_name}
                      </h3>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {index === 0 ? <StatusBadge variant="info">Mais recente</StatusBadge> : null}
                      <StatusBadge variant="neutral">{documentTypeLabel(document.document_type)}</StatusBadge>
                    </div>
                  </div>
                  <DocumentActions document={document} onPreview={setPreviewDocument} />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-600">
                  Gerado em {formatDateTime(document.generated_at)}
                  {document.generated_by_name || document.generated_by_email
                    ? ` por ${document.generated_by_name ?? document.generated_by_email}`
                    : ""}
                  {document.size_bytes ? ` • ${formatFileSize(document.size_bytes)}` : ""}
                </p>
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
