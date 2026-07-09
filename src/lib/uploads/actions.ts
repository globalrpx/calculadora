"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createAdminClient } from "@/lib/supabase/admin";

const uploadsBucket = "app-uploads";
const maxFileSizeBytes = 10 * 1024 * 1024;
const maxClientQuoteFileSizeBytes = 6 * 1024 * 1024;
const signedUrlExpiresInSeconds = 300;

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/plain",
  "application/zip"
]);

const allowedExtensions = new Set(["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "webp", "gif", "txt", "zip"]);
const dangerousExtensions = new Set(["exe", "bat", "cmd", "sh", "js", "php", "html", "htm", "svg", "msi", "scr"]);

const extensionMimeTypes: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  txt: ["text/plain"],
  zip: ["application/zip", "application/x-zip-compressed"]
};

const contextValues = new Set([
  "simulation_result",
  "quotation_attachment",
  "supplier_invoice",
  "product_photo",
  "packing_list",
  "invoice",
  "technical_sheet",
  "quote_product_images",
  "quote_supplier_contact"
]);

const clientQuoteContextValues = new Set(["quote_product_images", "quote_supplier_contact"]);
const clientQuoteAllowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"]);
const clientQuoteAllowedExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp", "gif"]);
const clientQuoteImageExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export type UploadRecord = {
  id: string;
  bucket: string;
  path: string;
  original_name: string;
  stored_name: string;
  mime_type: string | null;
  size_bytes: number;
  extension: string | null;
  context: string;
  simulation_id: string | null;
  quote_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type UploadActionResult = {
  success: boolean;
  message: string;
  upload?: UploadRecord;
  url?: string;
};

async function requireAdminActionAccess() {
  const session = await getSessionProfile();

  if (session.appUser.role !== "admin") {
    redirect("/app");
  }

  return session;
}

async function requireClientActionAccess() {
  const session = await getSessionProfile();

  if (session.appUser.role !== "client") {
    redirect("/admin/dashboard");
  }

  return session.appUser;
}

function normalizeContext(context: string) {
  const normalized = context.trim();
  return contextValues.has(normalized) ? normalized : "";
}

function getExtension(fileName: string) {
  const cleanName = fileName.trim();
  const lastDot = cleanName.lastIndexOf(".");

  if (lastDot < 0 || lastDot === cleanName.length - 1) {
    return "";
  }

  return cleanName.slice(lastDot + 1).toLowerCase();
}

function sanitizeBaseName(fileName: string) {
  const extension = getExtension(fileName);
  const withoutExtension = extension ? fileName.slice(0, -(extension.length + 1)) : fileName;
  const normalized = withoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return normalized || "arquivo";
}

function buildStoredName(fileName: string) {
  const extension = getExtension(fileName);
  const baseName = sanitizeBaseName(fileName);

  return extension ? `${baseName}.${extension}` : baseName;
}

function buildReplacementStoredName(fileName: string) {
  const extension = getExtension(fileName);
  const baseName = sanitizeBaseName(fileName);
  const uniqueSuffix = Date.now().toString(36);

  return extension ? `${baseName}-${uniqueSuffix}.${extension}` : `${baseName}-${uniqueSuffix}`;
}

function validateFile(file: File) {
  const extension = getExtension(file.name);
  const mimeType = file.type.trim().toLowerCase();

  if (!file.name.trim()) {
    return { error: "Não foi possível identificar o nome do arquivo." };
  }

  if (file.size <= 0) {
    return { error: "Arquivo vazio não permitido." };
  }

  if (file.size > maxFileSizeBytes) {
    return { error: "Arquivo maior que 10MB." };
  }

  if (!extension || !allowedExtensions.has(extension) || dangerousExtensions.has(extension)) {
    return { error: "Tipo de arquivo não permitido." };
  }

  if (mimeType) {
    const expectedMimeTypes = extensionMimeTypes[extension] ?? [];
    const mimeAllowed = allowedMimeTypes.has(mimeType) || expectedMimeTypes.includes(mimeType);

    if (!mimeAllowed || (expectedMimeTypes.length > 0 && !expectedMimeTypes.includes(mimeType))) {
      return { error: "Tipo de arquivo não permitido." };
    }
  }

  return {
    extension,
    mimeType: mimeType || null,
    storedName: buildStoredName(file.name)
  };
}

function validateClientQuoteFile(file: File, context: string) {
  const extension = getExtension(file.name);
  const mimeType = file.type.trim().toLowerCase();

  if (!clientQuoteContextValues.has(context)) {
    return { error: "Contexto de arquivo inválido." };
  }

  if (!file.name.trim()) {
    return { error: "Não foi possível identificar o nome do arquivo." };
  }

  if (file.size <= 0) {
    return { error: "Arquivo vazio não permitido." };
  }

  if (file.size > maxClientQuoteFileSizeBytes) {
    return { error: "Cada arquivo deve ter no máximo 6MB." };
  }

  if (!extension || !clientQuoteAllowedExtensions.has(extension) || dangerousExtensions.has(extension)) {
    return { error: "Tipo de arquivo não permitido. Envie imagem ou PDF." };
  }

  if (mimeType) {
    const expectedMimeTypes = extensionMimeTypes[extension] ?? [];
    const isAllowedImage = clientQuoteImageExtensions.has(extension) && mimeType.startsWith("image/");
    const mimeAllowed = clientQuoteAllowedMimeTypes.has(mimeType) && (expectedMimeTypes.includes(mimeType) || isAllowedImage);

    if (!mimeAllowed) {
      return { error: "Tipo de arquivo não permitido. Envie imagem ou PDF." };
    }
  }

  return {
    extension,
    mimeType: mimeType || null,
    storedName: buildStoredName(file.name)
  };
}

function mapUploadRecord(row: Record<string, unknown>): UploadRecord {
  return {
    id: String(row.id),
    bucket: String(row.bucket ?? uploadsBucket),
    path: String(row.path ?? ""),
    original_name: String(row.original_name ?? ""),
    stored_name: String(row.stored_name ?? ""),
    mime_type: row.mime_type ? String(row.mime_type) : null,
    size_bytes: Number(row.size_bytes ?? 0),
    extension: row.extension ? String(row.extension) : null,
    context: String(row.context ?? ""),
    simulation_id: row.simulation_id ? String(row.simulation_id) : null,
    quote_id: row.quote_id ? String(row.quote_id) : null,
    uploaded_by: row.uploaded_by ? String(row.uploaded_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    deleted_at: row.deleted_at ? String(row.deleted_at) : null
  };
}

async function getCurrentAuthUserId() {
  const adminSupabase = createAdminClient();
  const session = await requireAdminActionAccess();

  return {
    adminSupabase,
    authUserId: session.appUser.auth_provider_user_id || null
  };
}

export async function listSimulationUploads(simulationId: string, context?: string): Promise<UploadRecord[]> {
  await requireAdminActionAccess();
  const adminSupabase = createAdminClient();
  const normalizedContext = context ? normalizeContext(context) : "";

  let query = adminSupabase
    .from("uploads")
    .select("*")
    .eq("simulation_id", simulationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (normalizedContext) {
    query = query.eq("context", normalizedContext);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapUploadRecord(row as Record<string, unknown>));
}

export async function listQuoteUploads(quoteId: string, context?: string): Promise<UploadRecord[]> {
  await requireAdminActionAccess();
  const adminSupabase = createAdminClient();
  const normalizedContext = context ? normalizeContext(context) : "";

  let query = adminSupabase
    .from("uploads")
    .select("*")
    .eq("quote_id", quoteId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (normalizedContext) {
    query = query.eq("context", normalizedContext);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapUploadRecord(row as Record<string, unknown>));
}

async function uploadFile({
  file,
  context,
  simulationId,
  quoteId
}: {
  file: File;
  context: string;
  simulationId?: string;
  quoteId?: string;
}): Promise<UploadActionResult> {
  const { adminSupabase, authUserId } = await getCurrentAuthUserId();
  const normalizedContext = normalizeContext(context);

  if (!normalizedContext) {
    return { success: false, message: "Contexto de arquivo inválido." };
  }

  if (Boolean(simulationId) === Boolean(quoteId)) {
    return { success: false, message: "Informe exatamente um vínculo para o arquivo." };
  }

  const validation = validateFile(file);

  if ("error" in validation) {
    return { success: false, message: validation.error ?? "Tipo de arquivo não permitido." };
  }

  if (simulationId) {
    const { data: simulation, error } = await adminSupabase
      .from("simulations")
      .select("id")
      .eq("id", simulationId)
      .maybeSingle();

    if (error || !simulation) {
      return { success: false, message: "Simulação não encontrada." };
    }
  }

  if (quoteId) {
    const { data: quote, error } = await adminSupabase.from("quotes").select("id").eq("id", quoteId).maybeSingle();

    if (error || !quote) {
      return { success: false, message: "Cotação não encontrada." };
    }
  }

  const uploadId = crypto.randomUUID();
  const ownerFolder = simulationId ? `simulations/${simulationId}` : `quotes/${quoteId}`;
  const path = `${ownerFolder}/${uploadId}/${validation.storedName}`;

  const { error: storageError } = await adminSupabase.storage.from(uploadsBucket).upload(path, file, {
    contentType: validation.mimeType || undefined,
    upsert: false
  });

  if (storageError) {
    return { success: false, message: "Não foi possível enviar o arquivo para o Storage." };
  }

  const { data, error: insertError } = await adminSupabase
    .from("uploads")
    .insert({
      id: uploadId,
      bucket: uploadsBucket,
      path,
      original_name: file.name,
      stored_name: validation.storedName,
      mime_type: validation.mimeType,
      size_bytes: file.size,
      extension: validation.extension,
      context: normalizedContext,
      simulation_id: simulationId ?? null,
      quote_id: quoteId ?? null,
      uploaded_by: authUserId
    })
    .select("*")
    .single();

  if (insertError || !data) {
    await adminSupabase.storage.from(uploadsBucket).remove([path]);
    return { success: false, message: "Não foi possível registrar o arquivo enviado." };
  }

  if (simulationId) {
    revalidatePath(`/admin/simulacoes/${simulationId}`);
  }

  return {
    success: true,
    message: "Arquivo enviado com sucesso.",
    upload: mapUploadRecord(data as Record<string, unknown>)
  };
}

export async function uploadSimulationFile(
  simulationId: string,
  file: File,
  context = "simulation_result"
): Promise<UploadActionResult> {
  return uploadFile({ file, context, simulationId });
}

export async function uploadQuoteFile(
  quoteId: string,
  file: File,
  context = "quotation_attachment"
): Promise<UploadActionResult> {
  return uploadFile({ file, context, quoteId });
}

export async function uploadClientQuoteFile(
  quoteId: string,
  file: File,
  context: "quote_product_images" | "quote_supplier_contact"
): Promise<UploadActionResult> {
  const appUser = await requireClientActionAccess();

  if (!appUser.client_id) {
    return { success: false, message: "Cliente não vinculado ao usuário." };
  }

  const normalizedContext = normalizeContext(context);
  const validation = validateClientQuoteFile(file, normalizedContext);

  if ("error" in validation) {
    return { success: false, message: validation.error ?? "Tipo de arquivo não permitido. Envie imagem ou PDF." };
  }

  const adminSupabase = createAdminClient();
  const { data: quote, error: quoteError } = await adminSupabase
    .from("quotes")
    .select("id, client_id")
    .eq("id", quoteId)
    .maybeSingle();

  if (quoteError || !quote || quote.client_id !== appUser.client_id) {
    return { success: false, message: "Cotação não encontrada." };
  }

  const uploadId = crypto.randomUUID();
  const contextFolder = normalizedContext === "quote_product_images" ? "product-images" : "supplier-contact";
  const path = `quotes/${quoteId}/${contextFolder}/${uploadId}/${validation.storedName}`;

  const { error: storageError } = await adminSupabase.storage.from(uploadsBucket).upload(path, file, {
    contentType: validation.mimeType || undefined,
    upsert: false
  });

  if (storageError) {
    return { success: false, message: "Não foi possível enviar o arquivo." };
  }

  const { data, error: insertError } = await adminSupabase
    .from("uploads")
    .insert({
      id: uploadId,
      bucket: uploadsBucket,
      path,
      original_name: file.name,
      stored_name: validation.storedName,
      mime_type: validation.mimeType,
      size_bytes: file.size,
      extension: validation.extension,
      context: normalizedContext,
      simulation_id: null,
      quote_id: quoteId,
      uploaded_by: appUser.auth_provider_user_id || null
    })
    .select("*")
    .single();

  if (insertError || !data) {
    await adminSupabase.storage.from(uploadsBucket).remove([path]);
    return { success: false, message: "Não foi possível enviar o arquivo." };
  }

  revalidatePath("/app/calculadora");
  revalidatePath(`/admin/cotacoes/${quoteId}`);
  revalidatePath("/admin/cotacoes");

  return {
    success: true,
    message: "Arquivo enviado com sucesso.",
    upload: mapUploadRecord(data as Record<string, unknown>)
  };
}

export async function getUploadSignedUrl(uploadId: string): Promise<UploadActionResult> {
  await requireAdminActionAccess();
  const adminSupabase = createAdminClient();
  const { data: upload, error } = await adminSupabase
    .from("uploads")
    .select("*")
    .eq("id", uploadId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !upload) {
    return { success: false, message: "Não foi possível gerar o link de download." };
  }

  const record = mapUploadRecord(upload as Record<string, unknown>);
  const { data, error: signedUrlError } = await adminSupabase.storage
    .from(record.bucket)
    .createSignedUrl(record.path, signedUrlExpiresInSeconds);

  if (signedUrlError || !data?.signedUrl) {
    return { success: false, message: "Não foi possível gerar o link de download." };
  }

  return {
    success: true,
    message: "Link gerado com sucesso.",
    url: data.signedUrl
  };
}

export async function getClientUploadSignedUrl(uploadId: string): Promise<UploadActionResult> {
  const appUser = await requireClientActionAccess();

  if (!appUser.client_id) {
    return { success: false, message: "Não foi possível gerar o link de download." };
  }

  const adminSupabase = createAdminClient();
  const { data: upload, error } = await adminSupabase
    .from("uploads")
    .select("*, simulation:simulations(id, client_id)")
    .eq("id", uploadId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !upload) {
    return { success: false, message: "Não foi possível gerar o link de download." };
  }

  const record = mapUploadRecord(upload as Record<string, unknown>);

  if (!record.simulation_id) {
    return { success: false, message: "Não foi possível gerar o link de download." };
  }

  const simulation = Array.isArray(upload.simulation) ? upload.simulation[0] : upload.simulation;

  if (!simulation || simulation.client_id !== appUser.client_id) {
    return { success: false, message: "Não foi possível gerar o link de download." };
  }

  const { data, error: signedUrlError } = await adminSupabase.storage
    .from(record.bucket)
    .createSignedUrl(record.path, signedUrlExpiresInSeconds);

  if (signedUrlError || !data?.signedUrl) {
    return { success: false, message: "Não foi possível gerar o link de download." };
  }

  return {
    success: true,
    message: "Link gerado com sucesso.",
    url: data.signedUrl
  };
}

export async function deleteUpload(uploadId: string): Promise<UploadActionResult> {
  await requireAdminActionAccess();
  const adminSupabase = createAdminClient();
  const { data: upload, error } = await adminSupabase
    .from("uploads")
    .select("*")
    .eq("id", uploadId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !upload) {
    return { success: false, message: "Não foi possível excluir o arquivo." };
  }

  const record = mapUploadRecord(upload as Record<string, unknown>);
  const { error: removeError } = await adminSupabase.storage.from(record.bucket).remove([record.path]);

  if (removeError && removeError.message.toLowerCase().includes("not found") === false) {
    return { success: false, message: "Não foi possível excluir o arquivo." };
  }

  const { error: updateError } = await adminSupabase
    .from("uploads")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", uploadId);

  if (updateError) {
    return { success: false, message: "Não foi possível excluir o arquivo." };
  }

  if (record.simulation_id) {
    revalidatePath(`/admin/simulacoes/${record.simulation_id}`);
  }

  return { success: true, message: "Arquivo excluído com sucesso." };
}

export async function replaceUpload(uploadId: string, file: File): Promise<UploadActionResult> {
  await requireAdminActionAccess();
  const adminSupabase = createAdminClient();
  const { data: upload, error } = await adminSupabase
    .from("uploads")
    .select("*")
    .eq("id", uploadId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !upload) {
    return { success: false, message: "Não foi possível substituir o arquivo." };
  }

  const oldRecord = mapUploadRecord(upload as Record<string, unknown>);
  const validation = validateFile(file);

  if ("error" in validation) {
    return { success: false, message: validation.error ?? "Tipo de arquivo não permitido." };
  }

  if (!oldRecord.simulation_id && !oldRecord.quote_id) {
    return { success: false, message: "Não foi possível substituir o arquivo." };
  }

  const ownerFolder = oldRecord.simulation_id ? `simulations/${oldRecord.simulation_id}` : `quotes/${oldRecord.quote_id}`;
  const replacementStoredName = oldRecord.stored_name === validation.storedName
    ? buildReplacementStoredName(file.name)
    : validation.storedName;
  const newPath = `${ownerFolder}/${oldRecord.id}/${replacementStoredName}`;

  const { error: uploadError } = await adminSupabase.storage.from(oldRecord.bucket).upload(newPath, file, {
    contentType: validation.mimeType || undefined,
    upsert: false
  });

  if (uploadError) {
    return { success: false, message: "Não foi possível substituir o arquivo." };
  }

  const { data: updatedUpload, error: updateError } = await adminSupabase
    .from("uploads")
    .update({
      path: newPath,
      original_name: file.name,
      stored_name: replacementStoredName,
      mime_type: validation.mimeType,
      size_bytes: file.size,
      extension: validation.extension
    })
    .eq("id", uploadId)
    .select("*")
    .single();

  if (updateError || !updatedUpload) {
    await adminSupabase.storage.from(oldRecord.bucket).remove([newPath]);
    return { success: false, message: "Não foi possível substituir o arquivo." };
  }

  if (oldRecord.path !== newPath) {
    await adminSupabase.storage.from(oldRecord.bucket).remove([oldRecord.path]);
  }

  if (oldRecord.simulation_id) {
    revalidatePath(`/admin/simulacoes/${oldRecord.simulation_id}`);
  }

  return {
    success: true,
    message: "Arquivo substituído com sucesso.",
    upload: mapUploadRecord(updatedUpload as Record<string, unknown>)
  };
}
