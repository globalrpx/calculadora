create table if not exists public.final_simulations (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  number bigint,
  status text not null default 'draft',
  customer_id uuid references public.clients(id) on delete set null,
  customer_name text,
  supplier_id uuid,
  supplier_name text,
  branch_id uuid,
  branch_name text,
  created_by uuid references public.app_users(id) on delete set null,
  updated_by uuid references public.app_users(id) on delete set null,
  assigned_to uuid references public.app_users(id) on delete set null,
  approved_by uuid references public.app_users(id) on delete set null,
  approved_at timestamptz,
  reopened_by uuid references public.app_users(id) on delete set null,
  reopened_at timestamptz,
  reopen_reason text,
  quote_date date,
  valid_until date,
  operation_type text,
  import_modality text,
  goods_application text,
  transport_mode text,
  origin text,
  destination text,
  final_destination text,
  destination_state text,
  destination_city text,
  country text,
  packaging text,
  transit_time text,
  requires_import_license boolean not null default false,
  notes text,
  incoterm text,
  currency text default 'USD',
  exchange_rate numeric(18, 6) not null default 0,
  exchange_rate_source text,
  exchange_rate_date date,
  freight_rate numeric(18, 6) not null default 0,
  dollar_parity numeric(18, 6) not null default 0,
  total_products_usd numeric(18, 6) not null default 0,
  international_freight_usd numeric(18, 6) not null default 0,
  international_insurance_usd numeric(18, 6) not null default 0,
  customs_value_usd numeric(18, 6) not null default 0,
  customs_value_brl numeric(18, 6) not null default 0,
  total_taxes_brl numeric(18, 6) not null default 0,
  total_expenses_brl numeric(18, 6) not null default 0,
  total_cost_brl numeric(18, 6) not null default 0,
  total_cost_per_unit_brl numeric(18, 6) not null default 0,
  gross_weight numeric(18, 6) not null default 0,
  net_weight numeric(18, 6) not null default 0,
  volume_cbm numeric(18, 6) not null default 0,
  container_20_qty numeric(18, 6) not null default 0,
  container_40_qty numeric(18, 6) not null default 0,
  container_lcl_qty numeric(18, 6) not null default 0,
  container_other_qty numeric(18, 6) not null default 0,
  container_load_type text,
  has_national_freight boolean not null default false,
  national_freight_brl numeric(18, 6) not null default 0,
  calculation_snapshot jsonb not null default '{}'::jsonb,
  public_snapshot jsonb not null default '{}'::jsonb,
  internal_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint final_simulations_status_check check (
    status in ('draft', 'in_review', 'needs_adjustment', 'approved', 'sent_to_customer', 'archived')
  ),
  constraint final_simulations_import_modality_check check (
    import_modality is null or import_modality in ('propria', 'conta_e_ordem', 'encomenda')
  ),
  constraint final_simulations_transport_mode_check check (
    transport_mode is null or transport_mode in ('maritimo', 'aereo', 'rodoviario')
  ),
  constraint final_simulations_currency_format_check check (
    currency is null or (char_length(trim(currency)) between 1 and 3)
  )
);

create table if not exists public.final_simulation_items (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.final_simulations(id) on delete cascade,
  product_name text,
  product_description text not null,
  hs_code text,
  ncm text not null,
  ncm_official_description text,
  ncm_source text,
  ncm_source_updated_at timestamptz,
  ncm_tax_snapshot jsonb not null default '{}'::jsonb,
  ncm_validated boolean not null default false,
  ncm_validated_by uuid references public.app_users(id) on delete set null,
  ncm_validated_at timestamptz,
  ncm_validation_notes text,
  ii_rate numeric(10, 4) not null default 0,
  ipi_rate numeric(10, 4) not null default 0,
  pis_rate numeric(10, 4) not null default 0,
  cofins_rate numeric(10, 4) not null default 0,
  icms_rate numeric(10, 4) not null default 0,
  internal_consumption boolean not null default false,
  fiscal_exception text,
  reduced_base_rate numeric(10, 4) not null default 0,
  unit text,
  quantity numeric(18, 6) not null default 0,
  unit_price numeric(18, 6) not null default 0,
  currency text default 'USD',
  total_price numeric(18, 6) not null default 0,
  unit_net_weight numeric(18, 6) not null default 0,
  unit_gross_weight numeric(18, 6) not null default 0,
  total_net_weight numeric(18, 6) not null default 0,
  total_gross_weight numeric(18, 6) not null default 0,
  fob_total numeric(18, 6) not null default 0,
  cif_total numeric(18, 6) not null default 0,
  allocated_expenses_total numeric(18, 6) not null default 0,
  taxes_total numeric(18, 6) not null default 0,
  unit_cost_without_taxes_brl numeric(18, 6) not null default 0,
  unit_cost_with_taxes_brl numeric(18, 6) not null default 0,
  unit_cost_without_taxes_usd numeric(18, 6) not null default 0,
  unit_cost_with_taxes_usd numeric(18, 6) not null default 0,
  total_cost numeric(18, 6) not null default 0,
  antidumping_calculation_type text,
  antidumping_factor numeric(18, 6) not null default 0,
  antidumping_amount numeric(18, 6) not null default 0,
  antidumping_snapshot jsonb not null default '{}'::jsonb,
  special_regime text,
  special_regime_snapshot jsonb not null default '{}'::jsonb,
  purchase_order_id uuid,
  purchase_order_item_id uuid,
  purchase_order_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint final_simulation_items_currency_format_check check (
    currency is null or (char_length(trim(currency)) between 1 and 3)
  )
);

create table if not exists public.simulation_tax_lines (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.final_simulations(id) on delete cascade,
  item_id uuid references public.final_simulation_items(id) on delete cascade,
  tax_type text not null,
  base_amount_brl numeric(18, 6) not null default 0,
  rate_percent numeric(10, 4) not null default 0,
  amount_brl numeric(18, 6) not null default 0,
  formula_snapshot jsonb not null default '{}'::jsonb,
  is_manual_adjustment boolean not null default false,
  manual_adjustment_reason text,
  adjusted_by uuid references public.app_users(id) on delete set null,
  adjusted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint simulation_tax_lines_tax_type_check check (
    tax_type in ('II', 'IPI', 'PIS_IMPORTACAO', 'COFINS_IMPORTACAO', 'ICMS', 'AFRMM', 'ANTIDUMPING', 'OUTROS')
  )
);

create table if not exists public.simulation_expense_lines (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.final_simulations(id) on delete cascade,
  item_id uuid references public.final_simulation_items(id) on delete set null,
  source_preset_id uuid,
  source_preset_item_id uuid,
  expense_type_id uuid,
  expense_code text,
  expense_name text not null,
  expense_category text,
  description text,
  currency text default 'BRL',
  amount_brl numeric(18, 6) not null default 0,
  amount_usd numeric(18, 6) not null default 0,
  calculation_type text,
  allocation_type text,
  allocation_snapshot jsonb not null default '{}'::jsonb,
  applied_import_modality text,
  applied_behavior text,
  applied_behavior_label text,
  expense_type_snapshot jsonb not null default '{}'::jsonb,
  is_from_preset boolean not null default false,
  is_manual boolean not null default false,
  is_editable boolean not null default true,
  sort_order integer not null default 0,
  notes text,
  created_by uuid references public.app_users(id) on delete set null,
  updated_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint simulation_expense_lines_currency_format_check check (
    currency is null or (char_length(trim(currency)) between 1 and 3)
  )
);

create table if not exists public.simulation_versions (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.final_simulations(id) on delete cascade,
  version_number integer not null,
  snapshot_type text not null default 'internal',
  snapshot_json jsonb not null default '{}'::jsonb,
  change_reason text,
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint simulation_versions_simulation_version_unique unique (simulation_id, version_number)
);

create table if not exists public.simulation_documents (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.final_simulations(id) on delete cascade,
  version_id uuid references public.simulation_versions(id) on delete set null,
  upload_id uuid references public.uploads(id) on delete set null,
  document_type text not null,
  file_name text not null,
  file_path text,
  version_number integer,
  snapshot_json jsonb not null default '{}'::jsonb,
  generated_by uuid references public.app_users(id) on delete set null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint simulation_documents_document_type_check check (
    document_type in ('client_pdf', 'internal_detailed_report', 'pricing_excel')
  )
);

create table if not exists public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  uf char(2) not null unique,
  ibge_code text,
  country text not null default 'BR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ncm_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null,
  hierarchical_description text,
  legal_act text,
  source text,
  source_updated_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ncm_tax_profiles (
  id uuid primary key default gen_random_uuid(),
  ncm_code text not null references public.ncm_codes(code) on delete cascade,
  country_code text,
  operation_type text,
  effective_date date,
  ii_rate numeric(10, 4) not null default 0,
  ipi_rate numeric(10, 4) not null default 0,
  pis_rate numeric(10, 4) not null default 0,
  cofins_rate numeric(10, 4) not null default 0,
  icms_rate numeric(10, 4) not null default 0,
  antidumping_info jsonb not null default '{}'::jsonb,
  ex_tariff_info jsonb not null default '{}'::jsonb,
  legal_basis_snapshot jsonb not null default '{}'::jsonb,
  source text,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists final_simulations_status_idx on public.final_simulations (status);
create index if not exists final_simulations_customer_id_idx on public.final_simulations (customer_id);
create index if not exists final_simulations_created_by_idx on public.final_simulations (created_by);
create index if not exists final_simulations_quote_date_idx on public.final_simulations (quote_date);
create index if not exists final_simulation_items_simulation_id_idx on public.final_simulation_items (simulation_id);
create index if not exists final_simulation_items_ncm_idx on public.final_simulation_items (ncm);
create index if not exists simulation_tax_lines_simulation_id_idx on public.simulation_tax_lines (simulation_id);
create index if not exists simulation_tax_lines_item_id_idx on public.simulation_tax_lines (item_id);
create index if not exists simulation_expense_lines_simulation_id_idx on public.simulation_expense_lines (simulation_id);
create index if not exists simulation_versions_simulation_id_idx on public.simulation_versions (simulation_id);
create index if not exists simulation_documents_simulation_id_idx on public.simulation_documents (simulation_id);
create index if not exists states_uf_idx on public.states (uf);
create index if not exists ncm_codes_code_idx on public.ncm_codes (code);
create index if not exists ncm_tax_profiles_ncm_code_idx on public.ncm_tax_profiles (ncm_code);

drop trigger if exists final_simulations_set_updated_at on public.final_simulations;
create trigger final_simulations_set_updated_at
before update on public.final_simulations
for each row
execute function public.set_updated_at();

drop trigger if exists final_simulation_items_set_updated_at on public.final_simulation_items;
create trigger final_simulation_items_set_updated_at
before update on public.final_simulation_items
for each row
execute function public.set_updated_at();

drop trigger if exists simulation_expense_lines_set_updated_at on public.simulation_expense_lines;
create trigger simulation_expense_lines_set_updated_at
before update on public.simulation_expense_lines
for each row
execute function public.set_updated_at();

drop trigger if exists states_set_updated_at on public.states;
create trigger states_set_updated_at
before update on public.states
for each row
execute function public.set_updated_at();

drop trigger if exists ncm_codes_set_updated_at on public.ncm_codes;
create trigger ncm_codes_set_updated_at
before update on public.ncm_codes
for each row
execute function public.set_updated_at();

drop trigger if exists ncm_tax_profiles_set_updated_at on public.ncm_tax_profiles;
create trigger ncm_tax_profiles_set_updated_at
before update on public.ncm_tax_profiles
for each row
execute function public.set_updated_at();

alter table public.final_simulations enable row level security;
alter table public.final_simulation_items enable row level security;
alter table public.simulation_tax_lines enable row level security;
alter table public.simulation_expense_lines enable row level security;
alter table public.simulation_versions enable row level security;
alter table public.simulation_documents enable row level security;
alter table public.states enable row level security;
alter table public.ncm_codes enable row level security;
alter table public.ncm_tax_profiles enable row level security;

drop policy if exists "Admins can read final simulations" on public.final_simulations;
create policy "Admins can read final simulations"
on public.final_simulations
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert final simulations" on public.final_simulations;
create policy "Admins can insert final simulations"
on public.final_simulations
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update final simulations" on public.final_simulations;
create policy "Admins can update final simulations"
on public.final_simulations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete final simulations" on public.final_simulations;
create policy "Admins can delete final simulations"
on public.final_simulations
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read final simulation items" on public.final_simulation_items;
create policy "Admins can read final simulation items"
on public.final_simulation_items
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert final simulation items" on public.final_simulation_items;
create policy "Admins can insert final simulation items"
on public.final_simulation_items
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update final simulation items" on public.final_simulation_items;
create policy "Admins can update final simulation items"
on public.final_simulation_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete final simulation items" on public.final_simulation_items;
create policy "Admins can delete final simulation items"
on public.final_simulation_items
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read simulation tax lines" on public.simulation_tax_lines;
create policy "Admins can read simulation tax lines"
on public.simulation_tax_lines
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert simulation tax lines" on public.simulation_tax_lines;
create policy "Admins can insert simulation tax lines"
on public.simulation_tax_lines
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update simulation tax lines" on public.simulation_tax_lines;
create policy "Admins can update simulation tax lines"
on public.simulation_tax_lines
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete simulation tax lines" on public.simulation_tax_lines;
create policy "Admins can delete simulation tax lines"
on public.simulation_tax_lines
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read simulation expense lines" on public.simulation_expense_lines;
create policy "Admins can read simulation expense lines"
on public.simulation_expense_lines
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert simulation expense lines" on public.simulation_expense_lines;
create policy "Admins can insert simulation expense lines"
on public.simulation_expense_lines
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update simulation expense lines" on public.simulation_expense_lines;
create policy "Admins can update simulation expense lines"
on public.simulation_expense_lines
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete simulation expense lines" on public.simulation_expense_lines;
create policy "Admins can delete simulation expense lines"
on public.simulation_expense_lines
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read simulation versions" on public.simulation_versions;
create policy "Admins can read simulation versions"
on public.simulation_versions
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert simulation versions" on public.simulation_versions;
create policy "Admins can insert simulation versions"
on public.simulation_versions
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update simulation versions" on public.simulation_versions;
create policy "Admins can update simulation versions"
on public.simulation_versions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete simulation versions" on public.simulation_versions;
create policy "Admins can delete simulation versions"
on public.simulation_versions
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read simulation documents" on public.simulation_documents;
create policy "Admins can read simulation documents"
on public.simulation_documents
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert simulation documents" on public.simulation_documents;
create policy "Admins can insert simulation documents"
on public.simulation_documents
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update simulation documents" on public.simulation_documents;
create policy "Admins can update simulation documents"
on public.simulation_documents
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete simulation documents" on public.simulation_documents;
create policy "Admins can delete simulation documents"
on public.simulation_documents
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read states" on public.states;
create policy "Admins can read states"
on public.states
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert states" on public.states;
create policy "Admins can insert states"
on public.states
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update states" on public.states;
create policy "Admins can update states"
on public.states
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete states" on public.states;
create policy "Admins can delete states"
on public.states
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read ncm codes" on public.ncm_codes;
create policy "Admins can read ncm codes"
on public.ncm_codes
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert ncm codes" on public.ncm_codes;
create policy "Admins can insert ncm codes"
on public.ncm_codes
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update ncm codes" on public.ncm_codes;
create policy "Admins can update ncm codes"
on public.ncm_codes
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete ncm codes" on public.ncm_codes;
create policy "Admins can delete ncm codes"
on public.ncm_codes
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read ncm tax profiles" on public.ncm_tax_profiles;
create policy "Admins can read ncm tax profiles"
on public.ncm_tax_profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert ncm tax profiles" on public.ncm_tax_profiles;
create policy "Admins can insert ncm tax profiles"
on public.ncm_tax_profiles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update ncm tax profiles" on public.ncm_tax_profiles;
create policy "Admins can update ncm tax profiles"
on public.ncm_tax_profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete ncm tax profiles" on public.ncm_tax_profiles;
create policy "Admins can delete ncm tax profiles"
on public.ncm_tax_profiles
for delete
to authenticated
using (public.is_admin());

insert into public.states (name, uf, ibge_code, country, is_active)
values
  ('Acre', 'AC', '12', 'BR', true),
  ('Alagoas', 'AL', '27', 'BR', true),
  ('Amapa', 'AP', '16', 'BR', true),
  ('Amazonas', 'AM', '13', 'BR', true),
  ('Bahia', 'BA', '29', 'BR', true),
  ('Ceara', 'CE', '23', 'BR', true),
  ('Distrito Federal', 'DF', '53', 'BR', true),
  ('Espirito Santo', 'ES', '32', 'BR', true),
  ('Goias', 'GO', '52', 'BR', true),
  ('Maranhao', 'MA', '21', 'BR', true),
  ('Mato Grosso', 'MT', '51', 'BR', true),
  ('Mato Grosso do Sul', 'MS', '50', 'BR', true),
  ('Minas Gerais', 'MG', '31', 'BR', true),
  ('Para', 'PA', '15', 'BR', true),
  ('Paraiba', 'PB', '25', 'BR', true),
  ('Parana', 'PR', '41', 'BR', true),
  ('Pernambuco', 'PE', '26', 'BR', true),
  ('Piaui', 'PI', '22', 'BR', true),
  ('Rio de Janeiro', 'RJ', '33', 'BR', true),
  ('Rio Grande do Norte', 'RN', '24', 'BR', true),
  ('Rio Grande do Sul', 'RS', '43', 'BR', true),
  ('Rondonia', 'RO', '11', 'BR', true),
  ('Roraima', 'RR', '14', 'BR', true),
  ('Santa Catarina', 'SC', '42', 'BR', true),
  ('Sao Paulo', 'SP', '35', 'BR', true),
  ('Sergipe', 'SE', '28', 'BR', true),
  ('Tocantins', 'TO', '17', 'BR', true)
on conflict (uf) do update
set
  name = excluded.name,
  ibge_code = excluded.ibge_code,
  country = excluded.country,
  is_active = excluded.is_active,
  updated_at = now();
