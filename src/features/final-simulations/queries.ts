import { requireRole } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";
import type {
  FinalSimulationItemRow,
  FinalSimulationListFilters,
  FinalSimulationListRow,
  FinalSimulationPagination,
  FinalSimulationRow,
  FinalSimulationClientOption,
  NcmCodeRow
} from "./types";

const finalSimulationListSelect = [
  "id",
  "code",
  "number",
  "status",
  "customer_id",
  "customer_name",
  "supplier_name",
  "quote_date",
  "origin",
  "destination",
  "import_modality",
  "valid_until",
  "total_products_usd",
  "total_cost_brl",
  "created_at",
  "updated_at"
].join(", ");

const finalSimulationDetailSelect = "*";

function safeSearchTerm(value: string) {
  return value.replace(/[%_]/g, "\\$&").trim();
}

export async function listFinalSimulations(
  filters: FinalSimulationListFilters = {},
  pagination: FinalSimulationPagination = {}
) {
  await requireRole("admin");

  const supabase = await createClient();
  const page = Math.max(1, pagination.page ?? 1);
  const perPage = Math.max(1, pagination.perPage ?? 20);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("final_simulations")
    .select(finalSimulationListSelect, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.customer) {
    query = query.ilike("customer_name", `%${safeSearchTerm(filters.customer)}%`);
  }

  if (filters.code) {
    query = query.ilike("code", `%${safeSearchTerm(filters.code)}%`);
  }

  if (filters.number) {
    const parsedNumber = Number(filters.number);

    if (Number.isInteger(parsedNumber) && parsedNumber > 0) {
      query = query.eq("number", parsedNumber);
    }
  }

  if (filters.dateFrom) {
    query = query.gte("quote_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("quote_date", filters.dateTo);
  }

  const { data, count } = await query;

  return {
    rows: (data ?? []) as unknown as FinalSimulationListRow[],
    total: count ?? 0,
    page,
    perPage
  };
}

export async function getFinalSimulationById(id: string): Promise<FinalSimulationRow | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase.from("final_simulations").select(finalSimulationDetailSelect).eq("id", id).maybeSingle();

  return (data ?? null) as FinalSimulationRow | null;
}

export async function getFinalSimulationItems(simulationId: string): Promise<FinalSimulationItemRow[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("final_simulation_items")
    .select("*")
    .eq("simulation_id", simulationId)
    .order("created_at", { ascending: true });

  return (data ?? []) as FinalSimulationItemRow[];
}

export async function getNcmCodeByCode(code: string): Promise<NcmCodeRow | null> {
  await requireRole("admin");

  const normalizedCode = code.trim();

  if (!normalizedCode) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("ncm_codes")
    .select("*")
    .eq("code", normalizedCode)
    .eq("is_active", true)
    .maybeSingle();

  return (data ?? null) as NcmCodeRow | null;
}

export async function getFinalSimulationFormOptions() {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, company_name, trade_name, contact_name, contact_email")
    .is("deleted_at", null)
    .order("company_name", { ascending: true, nullsFirst: false })
    .limit(500);

  return {
    clients: (data ?? []).map<FinalSimulationClientOption>((client) => ({
      id: client.id,
      label: client.trade_name || client.company_name || client.contact_name || client.contact_email || "Cliente sem nome"
    }))
  };
}

export async function searchNcmCodes(term: string, limit = 20): Promise<NcmCodeRow[]> {
  await requireRole("admin");

  const normalizedTerm = safeSearchTerm(term);

  if (normalizedTerm.length < 2) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("ncm_codes")
    .select("*")
    .eq("is_active", true)
    .or(`code.ilike.%${normalizedTerm}%,description.ilike.%${normalizedTerm}%`)
    .order("code", { ascending: true })
    .limit(Math.max(1, Math.min(limit, 50)));

  return (data ?? []) as NcmCodeRow[];
}
