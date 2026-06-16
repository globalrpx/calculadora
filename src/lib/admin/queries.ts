import { createClient } from "@/lib/supabase/server";

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
  product_name: string;
  status: string;
  total_cost_rpx_brl: number;
  savings_brl: number;
  created_at: string;
  client: {
    company_name: string | null;
    trade_name: string | null;
  } | null;
};

export type AdminClientFilters = {
  name?: string;
  company?: string;
  source?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

async function getExactCount(query: PromiseLike<{ count: number | null }>) {
  const { count } = await query;
  return count ?? 0;
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

export async function getAdminClients(filters: AdminClientFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id, company_name, contact_name, contact_email, contact_phone, status, source, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

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

  const { data } = await query;

  return (data ?? []) as AdminClientRow[];
}

export async function getAdminClientById(id: string) {
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

export async function getAdminQuotes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select(
      "id, product_name, status, total_cost_rpx_brl, savings_brl, created_at, client:clients(company_name, trade_name)"
    )
    .order("created_at", { ascending: false });

  return ((data ?? []) as Array<
    Omit<AdminQuoteRow, "client"> & {
      client:
        | Array<{
            company_name: string | null;
            trade_name: string | null;
          }>
        | null;
    }
  >).map((row) => ({
    ...row,
    client: row.client?.[0] ?? null
  }));
}
