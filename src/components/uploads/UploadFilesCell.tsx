"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

export type UploadFileCellItem = {
  id: string;
  original_name: string;
  size_bytes: number;
  extension: string | null;
  mime_type: string | null;
  created_at: string;
};

export type UploadSignedUrlResult = {
  success: boolean;
  message: string;
  url?: string;
};

function formatFileLabel(upload: UploadFileCellItem) {
  return upload.original_name || "Arquivo";
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getPreviewType(upload: UploadFileCellItem) {
  const extension = upload.extension?.toLowerCase();
  const mimeType = upload.mime_type?.toLowerCase() ?? "";

  if (mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(extension ?? "")) {
    return "image";
  }

  if (mimeType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  if (mimeType === "text/plain" || extension === "txt") {
    return "text";
  }

  return "unsupported";
}

function FileLink({
  upload,
  pendingUploadId,
  onOpen
}: {
  upload: UploadFileCellItem;
  pendingUploadId: string | null;
  onOpen: (upload: UploadFileCellItem) => void;
}) {
  const isPending = pendingUploadId === upload.id;

  return (
    <button
      type="button"
      title={formatFileLabel(upload)}
      disabled={Boolean(pendingUploadId)}
      onClick={() => onOpen(upload)}
      className="max-w-[180px] truncate text-left text-sm font-semibold text-rpx-blue transition hover:text-rpx-navy disabled:cursor-not-allowed disabled:text-slate-400"
    >
      {isPending ? "Abrindo..." : formatFileLabel(upload)}
    </button>
  );
}

export function UploadFilesCell({
  uploads,
  emptyLabel,
  getSignedUrl
}: {
  uploads: UploadFileCellItem[];
  emptyLabel: string;
  getSignedUrl: (uploadId: string) => Promise<UploadSignedUrlResult>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingUploadId, setPendingUploadId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ upload: UploadFileCellItem; url: string } | null>(null);
  const [, startTransition] = useTransition();

  if (uploads.length === 0) {
    return <span className="text-slate-500">{emptyLabel}</span>;
  }

  const [firstUpload, ...remainingUploads] = uploads;

  const openUpload = (upload: UploadFileCellItem) => {
    if (pendingUploadId) {
      return;
    }

    setMessage(null);
    setPendingUploadId(upload.id);

    startTransition(async () => {
      const result = await getSignedUrl(upload.id);
      setPendingUploadId(null);

      if (!result.success || !result.url) {
        setMessage("Não foi possível abrir o arquivo.");
        return;
      }

      setPreview({ upload, url: result.url });
    });
  };

  return (
    <>
      <div className="grid max-w-[220px] gap-1.5">
        <FileLink upload={firstUpload} pendingUploadId={pendingUploadId} onOpen={openUpload} />
        {remainingUploads.length > 0 ? (
          <>
            <button
              type="button"
              className="w-fit text-xs font-semibold text-slate-500 transition hover:text-rpx-blue disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={Boolean(pendingUploadId)}
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
            >
              {expanded ? "Ocultar arquivos" : `+${remainingUploads.length} arquivo${remainingUploads.length === 1 ? "" : "s"}`}
            </button>
            {expanded ? (
              <div className="grid gap-1">
                {remainingUploads.map((upload) => (
                  <FileLink key={upload.id} upload={upload} pendingUploadId={pendingUploadId} onOpen={openUpload} />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
        {message ? <p className="text-xs font-medium text-red-600">{message}</p> : null}
      </div>

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <h3 className="break-words text-sm font-semibold text-rpx-ink">{preview.upload.original_name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatBytes(preview.upload.size_bytes)}
                  {preview.upload.extension ? ` · ${preview.upload.extension.toUpperCase()}` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar visualização"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xl text-slate-500 transition hover:bg-slate-100 hover:text-rpx-ink"
                onClick={() => setPreview(null)}
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 bg-slate-100 p-3">
              {getPreviewType(preview.upload) === "image" ? (
                <div className="flex h-full items-center justify-center">
                  <object
                    data={preview.url}
                    type={preview.upload.mime_type ?? undefined}
                    aria-label={`Visualização de ${preview.upload.original_name}`}
                    className="max-h-full max-w-full rounded-md bg-white object-contain"
                  />
                </div>
              ) : getPreviewType(preview.upload) === "pdf" || getPreviewType(preview.upload) === "text" ? (
                <iframe
                  title={`Visualização de ${preview.upload.original_name}`}
                  src={preview.url}
                  className="h-full min-h-[60vh] w-full rounded-md border border-slate-200 bg-white"
                />
              ) : (
                <div className="flex h-full min-h-[50vh] flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
                  <p className="text-sm font-semibold text-rpx-ink">Visualização indisponível para este tipo de arquivo.</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Baixe o anexo para abrir no aplicativo adequado.
                  </p>
                  <Button type="button" className="mt-4" onClick={() => window.open(preview.url, "_blank", "noopener,noreferrer")}>
                    Baixar arquivo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
