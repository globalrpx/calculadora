"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/get-session-profile";
import {
  importFactorConfigKey,
  parsePositiveConfigNumber
} from "@/lib/config/app-config";
import { createAdminClient } from "@/lib/supabase/admin";

const keyPattern = /^[a-z0-9_]+$/;

function isMissingConfigTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message?.includes("Could not find the table 'public.config'")
  );
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildConfigRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `/admin/configuracoes?${searchParams.toString()}`;
}

function validateConfigFields(key: string, value: string) {
  if (!key) {
    return "Informe a chave da configuração.";
  }

  if (!keyPattern.test(key)) {
    return "Use apenas letras minúsculas, números e underline na chave.";
  }

  if (!value) {
    return "Informe o valor da configuração.";
  }

  if (key === importFactorConfigKey && parsePositiveConfigNumber(value) === null) {
    return "O fator de importação deve ser um número decimal positivo.";
  }

  return "";
}

export async function createConfigAction(formData: FormData) {
  await requireRole("admin");

  const key = getFormValue(formData, "key");
  const value = getFormValue(formData, "value");
  const description = getFormValue(formData, "description");
  const validationMessage = validateConfigFields(key, value);

  if (validationMessage) {
    redirect(buildConfigRedirect({ error: validationMessage }));
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("config").insert({
    key,
    value,
    description: description || null
  });

  if (error) {
    const message = isMissingConfigTableError(error)
      ? "A tabela public.config ainda não existe no banco conectado. Aplique a migration de configurações."
      : error.code === "23505"
        ? "Já existe uma configuração com essa chave."
        : error.message;
    redirect(buildConfigRedirect({ error: message }));
  }

  redirect(buildConfigRedirect({ created: "1" }));
}

export async function updateConfigAction(formData: FormData) {
  await requireRole("admin");

  const id = getFormValue(formData, "id");
  const key = getFormValue(formData, "key");
  const value = getFormValue(formData, "value");
  const description = getFormValue(formData, "description");
  const validationMessage = validateConfigFields(key, value);

  if (!id) {
    redirect(buildConfigRedirect({ error: "Configuração não encontrada." }));
  }

  if (validationMessage) {
    redirect(buildConfigRedirect({ error: validationMessage }));
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("config")
    .update({
      value,
      description: description || null
    })
    .eq("id", id)
    .eq("key", key);

  if (error) {
    const message = isMissingConfigTableError(error)
      ? "A tabela public.config ainda não existe no banco conectado. Aplique a migration de configurações."
      : error.message;
    redirect(buildConfigRedirect({ error: message }));
  }

  redirect(buildConfigRedirect({ updated: "1" }));
}
