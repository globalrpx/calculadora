"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  deleteUpload,
  getUploadSignedUrl,
  replaceUpload,
  uploadQuoteFile,
  uploadSimulationFile,
  type UploadRecord
} from "@/lib/uploads/actions";

type UploadOwnerProps =
  | {
      simulationId: string;
      quoteId?: never;
    }
  | {
      simulationId?: never;
      quoteId: string;
    };

type UploadsCardProps = UploadOwnerProps & {
  context: string;
  title: string;
  description?: string;
  allowMultiple?: boolean;
  initialUploads: UploadRecord[];
};

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return `${formattedDate} - ${formattedTime}`;
}

function sortUploads(uploads: UploadRecord[]) {
  return [...uploads].sort((first, second) => {
    return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
  });
}

function getPreviewType(upload: UploadRecord) {
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

export function UploadsCard({
  simulationId,
  quoteId,
  context,
  title,
  description,
  allowMultiple = true,
  initialUploads
}: UploadsCardProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState(() => sortUploads(initialUploads));
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [replaceUploadId, setReplaceUploadId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ upload: UploadRecord; url: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const uploadFiles = (files: FileList | null) => {
    if (!files?.length || isPending) {
      return;
    }

    const selectedFiles = allowMultiple ? Array.from(files) : [files[0]];

    startTransition(async () => {
      setMessage({ type: "success", text: "Enviando arquivo..." });

      for (const file of selectedFiles) {
        const result = simulationId
          ? await uploadSimulationFile(simulationId, file, context)
          : await uploadQuoteFile(quoteId as string, file, context);

        if (!result.success || !result.upload) {
          setMessage({ type: "error", text: result.message || "Não foi possível enviar o arquivo." });
          return;
        }

        setUploads((currentUploads) => sortUploads([result.upload as UploadRecord, ...currentUploads]));
      }

      setMessage({ type: "success", text: "Arquivo enviado com sucesso." });
    });
  };

  const downloadUpload = (uploadId: string) => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      const result = await getUploadSignedUrl(uploadId);

      if (!result.success || !result.url) {
        setMessage({ type: "error", text: result.message || "Não foi possível gerar o link de download." });
        return;
      }

      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  };

  const previewUpload = (upload: UploadRecord) => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      const result = await getUploadSignedUrl(upload.id);

      if (!result.success || !result.url) {
        setMessage({ type: "error", text: result.message || "Não foi possível gerar o link de visualização." });
        return;
      }

      setPreview({ upload, url: result.url });
    });
  };

  const confirmDeleteUpload = (uploadId: string) => {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm("Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteUpload(uploadId);

      if (!result.success) {
        setMessage({ type: "error", text: result.message || "Não foi possível excluir o arquivo." });
        return;
      }

      setUploads((currentUploads) => currentUploads.filter((upload) => upload.id !== uploadId));
      setMessage({ type: "success", text: "Arquivo excluído com sucesso." });
    });
  };

  const openReplacePicker = (uploadId: string) => {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm("Deseja substituir este arquivo?");

    if (!confirmed) {
      return;
    }

    setReplaceUploadId(uploadId);
    replaceInputRef.current?.click();
  };

  const replaceSelectedUpload = (files: FileList | null) => {
    const file = files?.[0];

    if (!file || !replaceUploadId || isPending) {
      return;
    }

    startTransition(async () => {
      setMessage({ type: "success", text: "Enviando arquivo..." });

      const result = await replaceUpload(replaceUploadId, file);

      if (!result.success || !result.upload) {
        setMessage({ type: "error", text: result.message || "Não foi possível substituir o arquivo." });
        return;
      }

      setUploads((currentUploads) =>
        sortUploads(currentUploads.map((upload) => (upload.id === result.upload?.id ? result.upload : upload)))
      );
      setReplaceUploadId(null);
      setMessage({ type: "success", text: "Arquivo substituído com sucesso." });
    });
  };

  return (
    <Card title={title} description={description}>
      <div className="mt-4 grid gap-4">
        {message ? (
          <div
            className={
              message.type === "success"
                ? "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            }
          >
            {message.text}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {uploads.length > 0 ? `${uploads.length} arquivo${uploads.length === 1 ? "" : "s"} enviado${uploads.length === 1 ? "" : "s"}.` : "Nenhum arquivo enviado."}
          </p>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={isPending}
            onClick={() => uploadInputRef.current?.click()}
          >
            {isPending ? "Enviando arquivo..." : "Selecionar arquivo"}
          </Button>
        </div>

        <input
          ref={uploadInputRef}
          type="file"
          className="hidden"
          multiple={allowMultiple}
          onChange={(event) => {
            uploadFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
        <input
          ref={replaceInputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            replaceSelectedUpload(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />

        {uploads.length > 0 ? (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {uploads.map((upload) => (
              <li key={upload.id} className="grid gap-3 p-4">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-rpx-ink">{upload.original_name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(upload.size_bytes)}
                    {upload.extension ? ` · ${upload.extension.toUpperCase()}` : ""}
                    {" · "}
                    {formatDateTime(upload.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-rpx-blue transition hover:text-rpx-navy disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isPending}
                    onClick={() => previewUpload(upload)}
                  >
                    Visualizar
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-rpx-blue transition hover:text-rpx-navy disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isPending}
                    onClick={() => downloadUpload(upload.id)}
                  >
                    Baixar
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-rpx-blue transition hover:text-rpx-navy disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isPending}
                    onClick={() => openReplacePicker(upload.id)}
                  >
                    Substituir
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isPending}
                    onClick={() => confirmDeleteUpload(upload.id)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
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
    </Card>
  );
}
