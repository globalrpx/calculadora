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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
  const latestClientPdf = clientPdfDocuments[0] ?? null;

  return (
    <>
      <Card title="Último PDF cliente" description="Acesso rápido ao documento cliente mais recente salvo no Storage.">
        {latestClientPdf ? (
          <div className="mt-4 rounded-md border border-rpx-blue/20 bg-rpx-sky p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-rpx-ink">{latestClientPdf.file_name}</h3>
                  <StatusBadge variant="info">Mais recente</StatusBadge>
                  <StatusBadge variant="neutral">PDF cliente</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Gerado em {formatDateTime(latestClientPdf.generated_at)}
                  {latestClientPdf.generated_by_name || latestClientPdf.generated_by_email
                    ? ` por ${latestClientPdf.generated_by_name ?? latestClientPdf.generated_by_email}`
                    : ""}
                  {latestClientPdf.size_bytes ? ` • ${formatFileSize(latestClientPdf.size_bytes)}` : ""}
                </p>
              </div>
              <DocumentActions document={latestClientPdf} onPreview={setPreviewDocument} />
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Nenhum PDF cliente gerado ainda.
          </div>
        )}
      </Card>

      <Card title="Documentos gerados" description="Histórico de documentos salvos para esta simulação, do mais recente para o mais antigo.">
        {clientPdfDocuments.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Documento</th>
                  <th className="px-3 py-3">Tipo</th>
                  <th className="px-3 py-3">Gerado em</th>
                  <th className="px-3 py-3">Gerado por</th>
                  <th className="px-3 py-3 text-right">Tamanho</th>
                  <th className="px-3 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientPdfDocuments.map((document, index) => (
                  <tr key={document.id}>
                    <td className="px-3 py-3 font-medium text-rpx-ink">
                      <div className="flex flex-wrap items-center gap-2">
                        {document.file_name}
                        {index === 0 ? <StatusBadge variant="info">Mais recente</StatusBadge> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{documentTypeLabel(document.document_type)}</td>
                    <td className="px-3 py-3 text-slate-700">{formatDateTime(document.generated_at)}</td>
                    <td className="px-3 py-3 text-slate-700">
                      {document.generated_by_name ?? document.generated_by_email ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-700">{formatFileSize(document.size_bytes)}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end">
                        <DocumentActions document={document} onPreview={setPreviewDocument} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
