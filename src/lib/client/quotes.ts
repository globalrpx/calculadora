import { requireRole } from "@/lib/auth/get-session-profile";
import { hasSupabaseConfig } from "@/lib/auth/mock-users";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ClientQuoteRecord, ClientSimulationRecord, ClientSimulationUpload } from "@/lib/client/types";

type QuoteRow = {
  id: string;
  product_name: string;
  hs_code: string | null;
  supplier_name: string | null;
  supplier_email: string | null;
  supplier_phone: string | null;
  fob_unit_usd: number;
  quantity: number;
  fob_total_usd: number;
  used_dollar: number;
  rpx_factor: number;
  direct_import_factor: number;
  unit_cost_rpx_brl: number;
  total_cost_rpx_brl: number;
  unit_cost_direct_brl: number;
  total_cost_direct_brl: number;
  savings_brl: number;
  savings_percent: number;
  status: string;
  product_image_urls: string[] | null;
  supplier_contact_image_urls: string[] | null;
  created_at: string;
  simulations?: Array<{ id: string; status: string }> | null;
};

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

export function mapQuoteRow(row: QuoteRow): ClientQuoteRecord {
  return {
    id: row.id,
    productName: row.product_name,
    hsCode: row.hs_code ?? "",
    fobUnitUsd: toNumber(row.fob_unit_usd),
    quantity: toNumber(row.quantity),
    usedDollar: toNumber(row.used_dollar),
    rpxFactor: toNumber(row.rpx_factor),
    directImportFactor: toNumber(row.direct_import_factor),
    fobTotalUsd: toNumber(row.fob_total_usd),
    unitCostRpxBrl: toNumber(row.unit_cost_rpx_brl),
    totalCostRpxBrl: toNumber(row.total_cost_rpx_brl),
    unitCostDirectBrl: toNumber(row.unit_cost_direct_brl),
    totalCostDirectBrl: toNumber(row.total_cost_direct_brl),
    savingsBrl: toNumber(row.savings_brl),
    savingsPercent: toNumber(row.savings_percent),
    createdAt: row.created_at,
    status: row.status,
    images: row.product_image_urls ?? [],
    supplierContactImages: row.supplier_contact_image_urls ?? [],
    supplierName: row.supplier_name ?? undefined,
    supplierEmail: row.supplier_email ?? undefined,
    supplierPhone: row.supplier_phone ?? undefined,
    hasSimulationRequest: (row.simulations ?? []).some((simulation) =>
      ["aguardando", "em_producao", "draft"].includes(simulation.status)
    )
  };
}

export async function getClientQuotes(): Promise<ClientQuoteRecord[]> {
  const { appUser } = await requireRole("client");

  if (!hasSupabaseConfig() || !appUser.client_id) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select(
      [
        "id",
        "product_name",
        "hs_code",
        "supplier_name",
        "supplier_email",
        "supplier_phone",
        "fob_unit_usd",
        "quantity",
        "fob_total_usd",
        "used_dollar",
        "rpx_factor",
        "direct_import_factor",
        "unit_cost_rpx_brl",
        "total_cost_rpx_brl",
        "unit_cost_direct_brl",
        "total_cost_direct_brl",
        "savings_brl",
        "savings_percent",
        "status",
        "product_image_urls",
        "supplier_contact_image_urls",
        "created_at",
        "simulations(id, status)"
      ].join(", ")
    )
    .eq("client_id", appUser.client_id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as QuoteRow[]).map(mapQuoteRow);
}

export async function getClientDashboardStats() {
  const { appUser } = await requireRole("client");

  if (!hasSupabaseConfig() || !appUser.client_id) {
    return {
      quotesCount: 0,
      simulationsCount: 0
    };
  }

  const supabase = await createClient();
  const [quotesResult, simulationsResult] = await Promise.all([
    supabase.from("quotes").select("*", { count: "exact", head: true }).eq("client_id", appUser.client_id),
    supabase.from("simulations").select("*", { count: "exact", head: true }).eq("client_id", appUser.client_id)
  ]);

  return {
    quotesCount: quotesResult.count ?? 0,
    simulationsCount: simulationsResult.count ?? 0
  };
}

export async function getClientSimulations(): Promise<ClientSimulationRecord[]> {
  const { appUser } = await requireRole("client");

  if (!hasSupabaseConfig() || !appUser.client_id) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("simulations")
    .select("id, title, status, created_at, quote:quotes(id, product_name, hs_code)")
    .eq("client_id", appUser.client_id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []).map((row) => {
    const quote = Array.isArray(row.quote) ? row.quote[0] : row.quote;

    return {
      id: row.id,
      title: row.title,
      status: row.status,
      createdAt: row.created_at,
      quote: quote
        ? {
            id: quote.id,
            productName: quote.product_name,
            hsCode: quote.hs_code
          }
        : null,
      uploads: []
    };
  });

  const simulationIds = rows.map((row) => row.id);

  if (simulationIds.length === 0) {
    return rows;
  }

  const adminSupabase = createAdminClient();
  const { data: uploadsData } = await adminSupabase
    .from("uploads")
    .select("id, simulation_id, original_name, size_bytes, extension, mime_type, created_at")
    .in("simulation_id", simulationIds)
    .eq("context", "simulation_result")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const uploadsBySimulationId = new Map<string, ClientSimulationUpload[]>();

  ((uploadsData ?? []) as Array<Record<string, unknown>>).forEach((upload) => {
    const simulationId = upload.simulation_id ? String(upload.simulation_id) : "";

    if (!simulationId) {
      return;
    }

    const currentUploads = uploadsBySimulationId.get(simulationId) ?? [];
    currentUploads.push({
      id: String(upload.id),
      original_name: String(upload.original_name ?? ""),
      size_bytes: toNumber(upload.size_bytes),
      extension: upload.extension ? String(upload.extension) : null,
      mime_type: upload.mime_type ? String(upload.mime_type) : null,
      created_at: String(upload.created_at)
    });
    uploadsBySimulationId.set(simulationId, currentUploads);
  });

  return rows.map((row) => ({
    ...row,
    uploads: uploadsBySimulationId.get(row.id) ?? []
  }));
}
