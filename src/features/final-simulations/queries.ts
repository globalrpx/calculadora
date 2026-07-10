import { requireRole } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";
import type { FinalSimulationTaxPreviewInput } from "./calculation-engine";
import type {
  ExpensePreset,
  ExpensePresetItem,
  ExpensePresetTransportMode,
  ExpensePresetWithItems,
  ExpenseType,
  FinalSimulationDocumentRow,
  FinalSimulationItemRow,
  FinalSimulationListFilters,
  FinalSimulationListRow,
  FinalSimulationPagination,
  FinalSimulationRow,
  FinalSimulationClientOption,
  FinalSimulationFiscalSettingsInput,
  NcmCodeRow,
  InvoiceParametrization,
  InvoiceParametrizationListFilters,
  InvoiceParametrizationOperationType,
  InvoiceParametrizationOption,
  SimulationExpenseLine,
  SimulationTaxLine,
  SimulationTaxLineWithProduct
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

function hasJsonSnapshot(value: unknown) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

function readStorageMetadata(snapshotJson: Record<string, unknown>) {
  const metadata = snapshotJson.metadata;
  const storage = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>).storage : null;

  if (!storage || typeof storage !== "object") {
    return {
      bucket: null,
      path: null,
      mimeType: null,
      sizeBytes: null
    };
  }

  const values = storage as Record<string, unknown>;
  const sizeBytes = values.size_bytes;

  return {
    bucket: typeof values.bucket === "string" ? values.bucket : null,
    path: typeof values.path === "string" ? values.path : null,
    mimeType: typeof values.mime_type === "string" ? values.mime_type : null,
    sizeBytes: typeof sizeBytes === "number" && Number.isFinite(sizeBytes) ? sizeBytes : null
  };
}

export async function listFinalSimulationDocuments(simulationId: string): Promise<FinalSimulationDocumentRow[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("simulation_documents")
    .select("*")
    .eq("simulation_id", simulationId)
    .order("generated_at", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Array<Omit<FinalSimulationDocumentRow, "generated_by_name" | "generated_by_email" | "storage_bucket" | "storage_path" | "mime_type" | "size_bytes">>;
  const generatedByIds = Array.from(new Set(rows.map((row) => row.generated_by).filter(Boolean))) as string[];
  const usersById = new Map<string, { name: string | null; email: string | null }>();

  if (generatedByIds.length > 0) {
    const { data: users } = await supabase.from("app_users").select("id, name, email").in("id", generatedByIds);

    for (const user of users ?? []) {
      usersById.set(String(user.id), {
        name: user.name ? String(user.name) : null,
        email: user.email ? String(user.email) : null
      });
    }
  }

  return rows.map((row) => {
    const snapshotJson = row.snapshot_json ?? {};
    const storage = readStorageMetadata(snapshotJson);
    const generatedBy = row.generated_by ? usersById.get(row.generated_by) : null;

    return {
      ...row,
      snapshot_json: snapshotJson,
      generated_by_name: generatedBy?.name ?? null,
      generated_by_email: generatedBy?.email ?? null,
      storage_bucket: storage.bucket,
      storage_path: storage.path ?? row.file_path,
      mime_type: storage.mimeType,
      size_bytes: storage.sizeBytes
    };
  });
}

export async function getFinalSimulationTaxPreviewInput(
  simulationId: string
): Promise<FinalSimulationTaxPreviewInput | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const [simulationResult, itemsResult, expensesResult] = await Promise.all([
    supabase
      .from("final_simulations")
      .select(
        [
          "id",
          "exchange_rate",
          "total_expenses_brl",
          "trade_commission_mode",
          "trade_commission_percent",
          "trade_commission_amount_brl",
          "ignore_trade_commission_contract",
          "credits_ipi",
          "credits_pis",
          "credits_cofins",
          "credits_icms",
          "entry_invoice_parametrization_snapshot",
          "exit_invoice_parametrization_snapshot"
        ].join(", ")
      )
      .eq("id", simulationId)
      .maybeSingle(),
    supabase
      .from("final_simulation_items")
      .select("id, product_description, ncm, total_price, ii_rate, ipi_rate, pis_rate, cofins_rate, icms_rate")
      .eq("simulation_id", simulationId)
      .order("created_at", { ascending: true }),
    supabase.from("simulation_expense_lines").select("amount_brl").eq("simulation_id", simulationId)
  ]);

  if (!simulationResult.data) {
    return null;
  }

  const simulation = simulationResult.data as unknown as Pick<
    FinalSimulationRow,
    | "id"
    | "exchange_rate"
    | "total_expenses_brl"
    | "trade_commission_mode"
    | "trade_commission_percent"
    | "trade_commission_amount_brl"
    | "ignore_trade_commission_contract"
    | "credits_ipi"
    | "credits_pis"
    | "credits_cofins"
    | "credits_icms"
    | "entry_invoice_parametrization_snapshot"
    | "exit_invoice_parametrization_snapshot"
  >;
  const expenses = (expensesResult.data ?? []) as Array<Pick<SimulationExpenseLine, "amount_brl">>;
  const totalExpensesBrl = expenses.length > 0
    ? expenses.reduce((total, expense) => total + Number(expense.amount_brl ?? 0), 0)
    : simulation.total_expenses_brl;

  return {
    simulationId: simulation.id,
    exchangeRate: simulation.exchange_rate,
    totalExpensesBrl,
    creditsIpi: simulation.credits_ipi,
    creditsPis: simulation.credits_pis,
    creditsCofins: simulation.credits_cofins,
    creditsIcms: simulation.credits_icms,
    tradeCommissionMode: simulation.trade_commission_mode,
    tradeCommissionPercent: simulation.trade_commission_percent,
    tradeCommissionAmountBrl: simulation.trade_commission_amount_brl,
    ignoreTradeCommissionContract: simulation.ignore_trade_commission_contract,
    hasEntryInvoiceSnapshot: hasJsonSnapshot(simulation.entry_invoice_parametrization_snapshot),
    hasExitInvoiceSnapshot: hasJsonSnapshot(simulation.exit_invoice_parametrization_snapshot),
    items: ((itemsResult.data ?? []) as FinalSimulationItemRow[]).map((item) => ({
      itemId: item.id,
      description: item.product_description,
      ncm: item.ncm,
      totalPriceUsd: item.total_price,
      iiRate: item.ii_rate,
      ipiRate: item.ipi_rate,
      pisRate: item.pis_rate,
      cofinsRate: item.cofins_rate,
      icmsRate: item.icms_rate
    }))
  };
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

export async function listExpenseTypes(): Promise<ExpenseType[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_types")
    .select("*")
    .order("print_order", { ascending: true })
    .order("description", { ascending: true });

  return (data ?? []) as ExpenseType[];
}

export async function getExpenseTypeById(id: string): Promise<ExpenseType | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase.from("expense_types").select("*").eq("id", id).maybeSingle();

  return (data ?? null) as ExpenseType | null;
}

export async function listActiveExpenseTypes(): Promise<ExpenseType[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_types")
    .select("*")
    .eq("is_active", true)
    .order("print_order", { ascending: true })
    .order("description", { ascending: true });

  return (data ?? []) as ExpenseType[];
}

export async function listExpensePresets(): Promise<ExpensePreset[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_presets")
    .select("*")
    .order("transport_mode", { ascending: true })
    .order("name", { ascending: true });

  return (data ?? []) as ExpensePreset[];
}

export async function getExpensePresetById(id: string): Promise<ExpensePreset | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase.from("expense_presets").select("*").eq("id", id).maybeSingle();

  return (data ?? null) as ExpensePreset | null;
}

export async function getExpensePresetItems(presetId: string): Promise<ExpensePresetItem[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_preset_items")
    .select("*")
    .eq("preset_id", presetId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as ExpensePresetItem[];
}

export async function listExpensePresetsByTransportMode(
  transportMode: ExpensePresetTransportMode
): Promise<ExpensePreset[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_presets")
    .select("*")
    .eq("transport_mode", transportMode)
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (data ?? []) as ExpensePreset[];
}

export async function getSimulationExpenseLines(simulationId: string): Promise<SimulationExpenseLine[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("simulation_expense_lines")
    .select("*")
    .eq("simulation_id", simulationId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as SimulationExpenseLine[];
}

export async function getSimulationTaxLines(simulationId: string): Promise<SimulationTaxLineWithProduct[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("simulation_tax_lines")
    .select("*")
    .eq("simulation_id", simulationId)
    .order("tax_type", { ascending: true })
    .order("created_at", { ascending: true });

  const taxLines = (data ?? []) as SimulationTaxLine[];
  const itemIds = Array.from(new Set(taxLines.map((line) => line.item_id).filter(Boolean))) as string[];

  if (itemIds.length === 0) {
    return taxLines.map((line) => ({
      ...line,
      product_description: null,
      ncm: null
    }));
  }

  const { data: items } = await supabase
    .from("final_simulation_items")
    .select("id, product_description, ncm")
    .in("id", itemIds);
  const itemsById = new Map(
    ((items ?? []) as Pick<FinalSimulationItemRow, "id" | "product_description" | "ncm">[]).map((item) => [item.id, item])
  );

  return taxLines
    .map((line) => {
      const item = line.item_id ? itemsById.get(line.item_id) : null;

      return {
        ...line,
        product_description: item?.product_description ?? null,
        ncm: item?.ncm ?? null
      };
    })
    .sort((left, right) => {
      const productComparison = (left.product_description ?? "").localeCompare(right.product_description ?? "", "pt-BR");

      if (productComparison !== 0) {
        return productComparison;
      }

      return left.tax_type.localeCompare(right.tax_type, "pt-BR");
    });
}

export async function listActiveExpensePresetsForSimulation(simulationId: string): Promise<ExpensePreset[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const [{ data: simulation }, { data: presets }] = await Promise.all([
    supabase.from("final_simulations").select("id, transport_mode").eq("id", simulationId).maybeSingle(),
    supabase
      .from("expense_presets")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true })
  ]);

  const transportMode = (simulation as Pick<FinalSimulationRow, "transport_mode"> | null)?.transport_mode ?? null;
  const rows = (presets ?? []) as ExpensePreset[];

  if (!transportMode) {
    return rows;
  }

  return [...rows].sort((left, right) => {
    const leftCompatible = left.transport_mode === transportMode ? 0 : 1;
    const rightCompatible = right.transport_mode === transportMode ? 0 : 1;

    if (leftCompatible !== rightCompatible) {
      return leftCompatible - rightCompatible;
    }

    return left.name.localeCompare(right.name, "pt-BR");
  });
}

export async function getExpensePresetWithItems(presetId: string): Promise<ExpensePresetWithItems | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const [{ data: preset }, { data: items }] = await Promise.all([
    supabase.from("expense_presets").select("*").eq("id", presetId).maybeSingle(),
    supabase
      .from("expense_preset_items")
      .select("*")
      .eq("preset_id", presetId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  if (!preset) {
    return null;
  }

  return {
    ...((preset ?? {}) as ExpensePreset),
    items: (items ?? []) as ExpensePresetItem[]
  };
}

export async function listInvoiceParametrizations(
  filters: InvoiceParametrizationListFilters = {}
): Promise<InvoiceParametrization[]> {
  await requireRole("admin");

  const supabase = await createClient();
  let query = supabase
    .from("invoice_parametrizations")
    .select("*")
    .order("operation_type", { ascending: true })
    .order("code", { ascending: true });

  if (filters.operationType) {
    query = query.eq("operation_type", filters.operationType);
  }

  if (typeof filters.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters.search) {
    const term = safeSearchTerm(filters.search);
    query = query.or(`code.ilike.%${term}%,description.ilike.%${term}%,customer_name.ilike.%${term}%,cfop.ilike.%${term}%`);
  }

  const { data } = await query;

  return (data ?? []) as InvoiceParametrization[];
}

export async function getInvoiceParametrizationById(id: string): Promise<InvoiceParametrization | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase.from("invoice_parametrizations").select("*").eq("id", id).maybeSingle();

  return (data ?? null) as InvoiceParametrization | null;
}

export async function listInvoiceParametrizationOptions(
  operationType: InvoiceParametrizationOperationType
): Promise<InvoiceParametrizationOption[]> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoice_parametrizations")
    .select("id, code, description, operation_type, customer_name, is_unified")
    .eq("operation_type", operationType)
    .eq("is_active", true)
    .order("code", { ascending: true })
    .order("description", { ascending: true });

  return (data ?? []) as InvoiceParametrizationOption[];
}

export async function getFinalSimulationFiscalSettings(
  simulationId: string
): Promise<FinalSimulationFiscalSettingsInput | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("final_simulations")
    .select(
      [
        "id",
        "trade_commission_mode",
        "trade_commission_percent",
        "trade_commission_amount_brl",
        "ignore_trade_commission_contract",
        "credits_ipi",
        "credits_pis",
        "credits_cofins",
        "credits_icms",
        "tax_credit_notes",
        "entry_invoice_parametrization_id",
        "exit_invoice_parametrization_id"
      ].join(", ")
    )
    .eq("id", simulationId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const row = data as unknown as {
    id: string;
    trade_commission_mode: string | null;
    trade_commission_percent: number | null;
    trade_commission_amount_brl: number | null;
    ignore_trade_commission_contract: boolean | null;
    credits_ipi: boolean | null;
    credits_pis: boolean | null;
    credits_cofins: boolean | null;
    credits_icms: boolean | null;
    tax_credit_notes: string | null;
    entry_invoice_parametrization_id: string | null;
    exit_invoice_parametrization_id: string | null;
  };

  return {
    simulationId: row.id,
    tradeCommissionMode: row.trade_commission_mode ?? undefined,
    tradeCommissionPercent: row.trade_commission_percent ?? 0,
    tradeCommissionAmountBrl: row.trade_commission_amount_brl ?? 0,
    ignoreTradeCommissionContract: row.ignore_trade_commission_contract ?? false,
    creditsIpi: row.credits_ipi ?? false,
    creditsPis: row.credits_pis ?? false,
    creditsCofins: row.credits_cofins ?? false,
    creditsIcms: row.credits_icms ?? false,
    taxCreditNotes: row.tax_credit_notes ?? undefined,
    entryInvoiceParametrizationId: row.entry_invoice_parametrization_id ?? undefined,
    exitInvoiceParametrizationId: row.exit_invoice_parametrization_id ?? undefined
  };
}
