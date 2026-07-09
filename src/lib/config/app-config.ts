import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export const importFactorConfigKey = "import_factor";
export const defaultImportFactor = 1.8;

export type AppConfigRow = {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export class ConfigTableUnavailableError extends Error {
  constructor(message = "Tabela de configurações indisponível.") {
    super(message);
    this.name = "ConfigTableUnavailableError";
  }
}

function isMissingConfigTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message?.includes("Could not find the table 'public.config'")
  );
}

export function parsePositiveConfigNumber(value: string) {
  const normalizedValue = value.trim().replace(",", ".");
  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

export async function getConfigByKey(key: string): Promise<AppConfigRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("config")
    .select("id, key, value, description, created_at, updated_at")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    if (isMissingConfigTableError(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  return (data ?? null) as AppConfigRow | null;
}

export async function getAllConfigs(): Promise<AppConfigRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("config")
    .select("id, key, value, description, created_at, updated_at")
    .order("key", { ascending: true });

  if (error) {
    if (isMissingConfigTableError(error)) {
      throw new ConfigTableUnavailableError(
        "A tabela public.config ainda não existe no banco conectado. Aplique a migration de configurações para habilitar esta tela."
      );
    }

    throw new Error(error.message);
  }

  return (data ?? []) as AppConfigRow[];
}

export async function getImportFactor() {
  const config = await getConfigByKey(importFactorConfigKey);

  if (!config) {
    return defaultImportFactor;
  }

  return parsePositiveConfigNumber(config.value) ?? defaultImportFactor;
}
