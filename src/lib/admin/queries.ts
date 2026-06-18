import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/get-session-profile";

export type AdminDashboardStats = {
  clientsCount: number;
  quotesCount: number;
  simulationRequestsCount: number;
  publishedSimulationsCount: number;
};

export type AdminClientRow = {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  source: string;
  created_at: string;
};

export type AdminClientFormValues = {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source: string;
  status: string;
};

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  status: string;
  created_at: string;
};

export type AdminQuoteRow = {
  id: string;
  client_id: string;
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
  unit_cost_direct_brl: number;
  status: string;
  total_cost_direct_brl: number;
  total_cost_rpx_brl: number;
  savings_brl: number;
  savings_percent: number;
  product_image_urls: string[];
  supplier_contact_image_urls: string[];
  created_at: string;
  updated_at: string;
  client: {
    company_name: string | null;
    trade_name: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
  } | null;
  simulations: Array<{
    id: string;
    title: string;
    status: string;
    quote_file_url: string | null;
    storage_path: string | null;
    created_at: string;
    requested_at: string | null;
  }>;
};

export type AdminQuoteDetail = AdminQuoteRow;

export type AdminSimulationRow = {
  id: string;
  client_id: string;
  quote_id: string | null;
  title: string;
  status: string;
  quote_file_url: string | null;
  storage_path: string | null;
  client_notes: string | null;
  requested_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  client: {
    company_name: string | null;
    trade_name: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
  } | null;
  quote: {
    id: string;
    product_name: string;
    hs_code: string | null;
    supplier_name: string | null;
    supplier_email: string | null;
    supplier_phone: string | null;
    fob_unit_usd: number;
    quantity: number;
    fob_total_usd: number;
    total_cost_rpx_brl: number;
    total_cost_direct_brl: number;
    savings_brl: number;
    savings_percent: number;
  } | null;
};

export type AdminSimulationDetail = AdminSimulationRow;

export type AdminClientFilters = {
  name?: string;
  company?: string;
  source?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type AdminClientPagination = {
  page?: number;
  perPage?: number;
};

export type AdminQuoteFilters = {
  client?: string;
  product?: string;
  hsCode?: string;
  supplier?: string;
  situation?: "received" | "simulation_requested";
  dateFrom?: string;
  dateTo?: string;
};

export type AdminSimulationFilters = {
  client?: string;
  product?: string;
  hsCode?: string;
  supplier?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type AdminClientSortKey =
  | "company_name"
  | "responsible_name"
  | "email"
  | "source"
  | "status"
  | "created_at";

export type AdminSortDirection = "asc" | "desc";

export type AdminClientSort = {
  sort: AdminClientSortKey;
  direction: AdminSortDirection;
};

export type AdminQuoteSortKey =
  | "created_at"
  | "product_name"
  | "hs_code"
  | "fob_total_usd"
  | "quantity"
  | "total_cost_rpx_brl"
  | "savings_brl"
  | "status";

export type AdminQuoteSort = {
  sort: AdminQuoteSortKey;
  direction: AdminSortDirection;
};

export type AdminSimulationSortKey = "created_at" | "title" | "status";

export type AdminSimulationSort = {
  sort: AdminSimulationSortKey;
  direction: AdminSortDirection;
};

export const adminClientSortColumns: Record<AdminClientSortKey, keyof AdminClientRow> = {
  company_name: "company_name",
  responsible_name: "contact_name",
  email: "contact_email",
  source: "source",
  status: "status",
  created_at: "created_at"
};

export const defaultAdminClientSort: AdminClientSort = {
  sort: "created_at",
  direction: "desc"
};

export const adminQuoteSortColumns: Record<AdminQuoteSortKey, keyof AdminQuoteRow> = {
  created_at: "created_at",
  product_name: "product_name",
  hs_code: "hs_code",
  fob_total_usd: "fob_total_usd",
  quantity: "quantity",
  total_cost_rpx_brl: "total_cost_rpx_brl",
  savings_brl: "savings_brl",
  status: "status"
};

export const defaultAdminQuoteSort: AdminQuoteSort = {
  sort: "created_at",
  direction: "desc"
};

export const adminSimulationSortColumns: Record<AdminSimulationSortKey, keyof AdminSimulationRow> = {
  created_at: "created_at",
  title: "title",
  status: "status"
};

export const defaultAdminSimulationSort: AdminSimulationSort = {
  sort: "created_at",
  direction: "desc"
};

const adminQuoteSelect = [
  "id",
  "client_id",
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
  "updated_at",
  "client:clients(company_name, trade_name, contact_name, contact_email, contact_phone)",
  "simulations(id, title, status, quote_file_url, storage_path, created_at, requested_at)"
].join(", ");

const adminSimulationSelect = [
  "id",
  "client_id",
  "quote_id",
  "title",
  "status",
  "quote_file_url",
  "storage_path",
  "client_notes",
  "requested_at",
  "published_at",
  "created_at",
  "updated_at",
  "client:clients(company_name, trade_name, contact_name, contact_email, contact_phone)",
  "quote:quotes(id, product_name, hs_code, supplier_name, supplier_email, supplier_phone, fob_unit_usd, quantity, fob_total_usd, total_cost_rpx_brl, total_cost_direct_brl, savings_brl, savings_percent)"
].join(", ");

async function getExactCount(query: PromiseLike<{ count: number | null }>) {
  const { count } = await query;
  return count ?? 0;
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function mapAdminQuoteRow(row: Record<string, unknown>): AdminQuoteRow {
  const client = firstRelation(
    row.client as
      | {
          company_name: string | null;
          trade_name: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
        }
      | Array<{
          company_name: string | null;
          trade_name: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
        }>
      | null
  );
  const simulations = (row.simulations ?? []) as AdminQuoteRow["simulations"];

  return {
    id: String(row.id),
    client_id: String(row.client_id),
    product_name: String(row.product_name ?? ""),
    hs_code: row.hs_code ? String(row.hs_code) : null,
    supplier_name: row.supplier_name ? String(row.supplier_name) : null,
    supplier_email: row.supplier_email ? String(row.supplier_email) : null,
    supplier_phone: row.supplier_phone ? String(row.supplier_phone) : null,
    fob_unit_usd: toNumber(row.fob_unit_usd),
    quantity: toNumber(row.quantity),
    fob_total_usd: toNumber(row.fob_total_usd),
    used_dollar: toNumber(row.used_dollar),
    rpx_factor: toNumber(row.rpx_factor),
    direct_import_factor: toNumber(row.direct_import_factor),
    unit_cost_rpx_brl: toNumber(row.unit_cost_rpx_brl),
    total_cost_rpx_brl: toNumber(row.total_cost_rpx_brl),
    unit_cost_direct_brl: toNumber(row.unit_cost_direct_brl),
    total_cost_direct_brl: toNumber(row.total_cost_direct_brl),
    savings_brl: toNumber(row.savings_brl),
    savings_percent: toNumber(row.savings_percent),
    status: String(row.status ?? ""),
    product_image_urls: Array.isArray(row.product_image_urls) ? (row.product_image_urls as string[]) : [],
    supplier_contact_image_urls: Array.isArray(row.supplier_contact_image_urls)
      ? (row.supplier_contact_image_urls as string[])
      : [],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    client,
    simulations
  };
}

function mapAdminSimulationRow(row: Record<string, unknown>): AdminSimulationRow {
  const client = firstRelation(
    row.client as
      | {
          company_name: string | null;
          trade_name: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
        }
      | Array<{
          company_name: string | null;
          trade_name: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
        }>
      | null
  );
  const quote = firstRelation(
    row.quote as
      | {
          id: string;
          product_name: string;
          hs_code: string | null;
          supplier_name: string | null;
          supplier_email: string | null;
          supplier_phone: string | null;
          fob_unit_usd: unknown;
          quantity: unknown;
          fob_total_usd: unknown;
          total_cost_rpx_brl: unknown;
          total_cost_direct_brl: unknown;
          savings_brl: unknown;
          savings_percent: unknown;
        }
      | Array<{
          id: string;
          product_name: string;
          hs_code: string | null;
          supplier_name: string | null;
          supplier_email: string | null;
          supplier_phone: string | null;
          fob_unit_usd: unknown;
          quantity: unknown;
          fob_total_usd: unknown;
          total_cost_rpx_brl: unknown;
          total_cost_direct_brl: unknown;
          savings_brl: unknown;
          savings_percent: unknown;
        }>
      | null
  );

  return {
    id: String(row.id),
    client_id: String(row.client_id),
    quote_id: row.quote_id ? String(row.quote_id) : null,
    title: String(row.title ?? ""),
    status: String(row.status ?? ""),
    quote_file_url: row.quote_file_url ? String(row.quote_file_url) : null,
    storage_path: row.storage_path ? String(row.storage_path) : null,
    client_notes: row.client_notes ? String(row.client_notes) : null,
    requested_at: row.requested_at ? String(row.requested_at) : null,
    published_at: row.published_at ? String(row.published_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    client,
    quote: quote
      ? {
          id: String(quote.id),
          product_name: String(quote.product_name ?? ""),
          hs_code: quote.hs_code ? String(quote.hs_code) : null,
          supplier_name: quote.supplier_name ? String(quote.supplier_name) : null,
          supplier_email: quote.supplier_email ? String(quote.supplier_email) : null,
          supplier_phone: quote.supplier_phone ? String(quote.supplier_phone) : null,
          fob_unit_usd: toNumber(quote.fob_unit_usd),
          quantity: toNumber(quote.quantity),
          fob_total_usd: toNumber(quote.fob_total_usd),
          total_cost_rpx_brl: toNumber(quote.total_cost_rpx_brl),
          total_cost_direct_brl: toNumber(quote.total_cost_direct_brl),
          savings_brl: toNumber(quote.savings_brl),
          savings_percent: toNumber(quote.savings_percent)
        }
      : null
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [clientsCount, quotesCount, simulationRequestsCount, publishedSimulationsCount] =
    await Promise.all([
      getExactCount(supabase.from("clients").select("*", { count: "exact", head: true }).is("deleted_at", null)),
      getExactCount(supabase.from("quotes").select("*", { count: "exact", head: true })),
      getExactCount(
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "simulation_requested")
      ),
      getExactCount(
        supabase.from("simulations").select("*", { count: "exact", head: true }).eq("status", "published")
      )
    ]);

  return {
    clientsCount,
    quotesCount,
    simulationRequestsCount,
    publishedSimulationsCount
  };
}

export async function getAdminClients(
  filters: AdminClientFilters = {},
  pagination: AdminClientPagination = {},
  sort: AdminClientSort = defaultAdminClientSort
) {
  await requireRole("admin");

  const supabase = await createClient();
  const page = Math.max(1, pagination.page ?? 1);
  const perPage = Math.max(1, pagination.perPage ?? 20);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const sortColumn = adminClientSortColumns[sort.sort] ?? adminClientSortColumns[defaultAdminClientSort.sort];
  const sortDirection = sort.direction === "asc" ? "asc" : "desc";

  let query = supabase
    .from("clients")
    .select("id, company_name, contact_name, contact_email, contact_phone, status, source, created_at", {
      count: "exact"
    })
    .is("deleted_at", null)
    .order(sortColumn, { ascending: sortDirection === "asc", nullsFirst: false })
    .range(from, to);

  if (filters.name) {
    query = query.ilike("contact_name", `%${filters.name}%`);
  }

  if (filters.company) {
    query = query.ilike("company_name", `%${filters.company}%`);
  }

  if (filters.source) {
    query = query.eq("source", filters.source);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00`);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999`);
  }

  const { data, count } = await query;

  return {
    rows: (data ?? []) as AdminClientRow[],
    total: count ?? 0,
    page,
    perPage
  };
}

export async function getAdminClientById(id: string) {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, company_name, contact_name, contact_email, contact_phone, source, status")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  return (data ?? null) as AdminClientFormValues | null;
}

export async function getAdminUsers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_users")
    .select("id, name, email, status, created_at")
    .eq("role", "admin")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (data ?? []) as AdminUserRow[];
}

async function findAdminQuoteClientIds(clientFilter: string) {
  const supabase = await createClient();
  const term = `%${clientFilter}%`;
  const [companyResult, tradeResult, emailResult, contactResult] = await Promise.all([
    supabase.from("clients").select("id").ilike("company_name", term).is("deleted_at", null).limit(200),
    supabase.from("clients").select("id").ilike("trade_name", term).is("deleted_at", null).limit(200),
    supabase.from("clients").select("id").ilike("contact_email", term).is("deleted_at", null).limit(200),
    supabase.from("clients").select("id").ilike("contact_name", term).is("deleted_at", null).limit(200)
  ]);

  return Array.from(
    new Set(
      [companyResult.data, tradeResult.data, emailResult.data, contactResult.data]
        .flat()
        .filter((client): client is { id: string } => Boolean(client?.id))
        .map((client) => client.id)
    )
  );
}

export async function getAdminQuotes(
  filters: AdminQuoteFilters = {},
  pagination: AdminClientPagination = {},
  sort: AdminQuoteSort = defaultAdminQuoteSort
) {
  await requireRole("admin");

  const supabase = await createClient();
  const page = Math.max(1, pagination.page ?? 1);
  const perPage = Math.max(1, pagination.perPage ?? 20);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const sortColumn = adminQuoteSortColumns[sort.sort] ?? adminQuoteSortColumns[defaultAdminQuoteSort.sort];
  const sortDirection = sort.direction === "asc" ? "asc" : "desc";

  let query = supabase
    .from("quotes")
    .select(adminQuoteSelect, {
      count: "exact"
    })
    .order(sortColumn, { ascending: sortDirection === "asc", nullsFirst: false })
    .range(from, to);

  if (filters.client) {
    const clientIds = await findAdminQuoteClientIds(filters.client);

    if (clientIds.length === 0) {
      return {
        rows: [],
        total: 0,
        page,
        perPage
      };
    }

    query = query.in("client_id", clientIds);
  }

  if (filters.product) {
    query = query.ilike("product_name", `%${filters.product}%`);
  }

  if (filters.hsCode) {
    query = query.ilike("hs_code", `%${filters.hsCode}%`);
  }

  if (filters.supplier) {
    query = query.ilike("supplier_name", `%${filters.supplier}%`);
  }

  if (filters.situation === "simulation_requested") {
    query = query.eq("status", "simulation_requested");
  }

  if (filters.situation === "received") {
    query = query.neq("status", "simulation_requested");
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00`);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999`);
  }

  const { data, count } = await query;

  return {
    rows: ((data ?? []) as unknown as Record<string, unknown>[]).map(mapAdminQuoteRow),
    total: count ?? 0,
    page,
    perPage
  };
}

export async function getAdminQuoteById(id: string): Promise<AdminQuoteDetail | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase.from("quotes").select(adminQuoteSelect).eq("id", id).maybeSingle();

  return data ? mapAdminQuoteRow(data as unknown as Record<string, unknown>) : null;
}

async function findAdminSimulationQuoteIds(filters: Pick<AdminSimulationFilters, "product" | "hsCode" | "supplier">) {
  const supabase = await createClient();
  let query = supabase.from("quotes").select("id").limit(500);

  if (filters.product) {
    query = query.ilike("product_name", `%${filters.product}%`);
  }

  if (filters.hsCode) {
    query = query.ilike("hs_code", `%${filters.hsCode}%`);
  }

  if (filters.supplier) {
    query = query.ilike("supplier_name", `%${filters.supplier}%`);
  }

  const { data } = await query;
  return (data ?? []).map((quote) => quote.id);
}

export async function getAdminSimulations(
  filters: AdminSimulationFilters = {},
  pagination: AdminClientPagination = {},
  sort: AdminSimulationSort = defaultAdminSimulationSort
) {
  await requireRole("admin");

  const supabase = await createClient();
  const page = Math.max(1, pagination.page ?? 1);
  const perPage = Math.max(1, pagination.perPage ?? 20);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const sortColumn =
    adminSimulationSortColumns[sort.sort] ?? adminSimulationSortColumns[defaultAdminSimulationSort.sort];
  const sortDirection = sort.direction === "asc" ? "asc" : "desc";

  let query = supabase
    .from("simulations")
    .select(adminSimulationSelect, {
      count: "exact"
    })
    .order(sortColumn, { ascending: sortDirection === "asc", nullsFirst: false })
    .range(from, to);

  if (filters.client) {
    const clientIds = await findAdminQuoteClientIds(filters.client);

    if (clientIds.length === 0) {
      return {
        rows: [],
        total: 0,
        page,
        perPage
      };
    }

    query = query.in("client_id", clientIds);
  }

  if (filters.product || filters.hsCode || filters.supplier) {
    const quoteIds = await findAdminSimulationQuoteIds(filters);

    if (quoteIds.length === 0) {
      return {
        rows: [],
        total: 0,
        page,
        perPage
      };
    }

    query = query.in("quote_id", quoteIds);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00`);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999`);
  }

  const { data, count } = await query;

  return {
    rows: ((data ?? []) as unknown as Record<string, unknown>[]).map(mapAdminSimulationRow),
    total: count ?? 0,
    page,
    perPage
  };
}

export async function getAdminSimulationById(id: string): Promise<AdminSimulationDetail | null> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data } = await supabase.from("simulations").select(adminSimulationSelect).eq("id", id).maybeSingle();

  return data ? mapAdminSimulationRow(data as unknown as Record<string, unknown>) : null;
}

export async function getAdminSimulationFormOptions() {
  await requireRole("admin");

  const supabase = await createClient();
  const [clientsResult, quotesResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id, company_name, trade_name, contact_name, contact_email")
      .is("deleted_at", null)
      .order("company_name", { ascending: true, nullsFirst: false })
      .limit(500),
    supabase
      .from("quotes")
      .select("id, client_id, product_name, hs_code, fob_total_usd, quantity, supplier_name, client:clients(company_name, trade_name)")
      .order("created_at", { ascending: false })
      .limit(500)
  ]);

  return {
    clients: (clientsResult.data ?? []).map((client) => ({
      id: client.id,
      label: client.trade_name || client.company_name || client.contact_name || client.contact_email || "Cliente sem nome"
    })),
    quotes: ((quotesResult.data ?? []) as Array<{
      id: string;
      client_id: string;
      product_name: string;
      hs_code: string | null;
      fob_total_usd: number;
      quantity: number;
      supplier_name: string | null;
      client:
        | Array<{
            company_name: string | null;
            trade_name: string | null;
          }>
        | {
            company_name: string | null;
            trade_name: string | null;
          }
        | null;
    }>).map((quote) => {
      const client = firstRelation(quote.client);

      return {
        id: quote.id,
        clientId: quote.client_id,
        label: `${quote.product_name} - ${client?.trade_name || client?.company_name || "cliente sem nome"}`,
        productName: quote.product_name,
        hsCode: quote.hs_code,
        fobTotalUsd: toNumber(quote.fob_total_usd),
        quantity: toNumber(quote.quantity),
        supplierName: quote.supplier_name
      };
    })
  };
}
