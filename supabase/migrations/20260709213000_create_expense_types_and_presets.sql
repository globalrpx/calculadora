create table if not exists public.expense_types (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  description text not null,
  key text,
  print_order integer not null default 0,
  expense_modality text not null default 'expense',
  expense_modality_label text,
  allocation_type text not null default 'value',
  allocation_type_label text,
  expense_calculation_type text not null default 'parameters',
  expense_calculation_label text,
  own_import_behavior text not null default 'not_applicable',
  own_import_behavior_label text,
  order_account_behavior text not null default 'not_applicable',
  order_account_behavior_label text,
  encomenda_behavior text not null default 'not_applicable',
  encomenda_behavior_label text,
  expense_resulting text,
  siscomex_addition_id uuid,
  expense_group_id uuid,
  expense_group_name text,
  considers_container boolean not null default false,
  considers_icms_entry_invoice boolean not null default false,
  composes_service_invoice boolean not null default false,
  title_type_id uuid,
  title_type_name text,
  service_id uuid,
  service_name text,
  bank_account_id uuid,
  bank_account_name text,
  erp_key text,
  paid_by_cash_own_import boolean not null default false,
  paid_by_cash_encomenda boolean not null default false,
  paid_by_cash_order_account boolean not null default false,
  paid_by_cash_direct_export boolean not null default false,
  paid_by_cash_indirect_export boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.app_users(id) on delete set null,
  updated_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expense_types_expense_modality_check check (
    expense_modality in ('tax', 'expense', 'calculation_base')
  ),
  constraint expense_types_allocation_type_check check (
    allocation_type in ('value', 'net_weight', 'cif', 'gross_weight')
  ),
  constraint expense_types_expense_calculation_type_check check (
    expense_calculation_type in ('parameters', 'fob', 'freight', 'insurance', 'cif', 'ii', 'ipi', 'icms')
  ),
  constraint expense_types_own_import_behavior_check check (
    own_import_behavior in (
      'accessory_expense',
      'tax_base',
      'icms_base',
      'not_applicable',
      'product_cost_only',
      'icms_base_courier_fine',
      'ipi_base'
    )
  ),
  constraint expense_types_order_account_behavior_check check (
    order_account_behavior in (
      'accessory_expense',
      'tax_base',
      'icms_base',
      'not_applicable',
      'product_cost_only',
      'icms_base_courier_fine',
      'ipi_base'
    )
  ),
  constraint expense_types_encomenda_behavior_check check (
    encomenda_behavior in (
      'accessory_expense',
      'tax_base',
      'icms_base',
      'not_applicable',
      'product_cost_only',
      'icms_base_courier_fine',
      'ipi_base'
    )
  )
);

create table if not exists public.expense_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  transport_mode text not null,
  is_active boolean not null default true,
  created_by uuid references public.app_users(id) on delete set null,
  updated_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expense_presets_transport_mode_check check (
    transport_mode in ('maritimo', 'aereo', 'rodoviario')
  )
);

create table if not exists public.expense_preset_items (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.expense_presets(id) on delete cascade,
  expense_type_id uuid not null references public.expense_types(id),
  expense_code_snapshot text,
  expense_description_snapshot text,
  default_amount_brl numeric(18, 6) not null default 0,
  default_amount_usd numeric(18, 6) not null default 0,
  default_currency text default 'BRL',
  override_calculation_type text,
  override_allocation_type text,
  override_behavior text,
  is_editable boolean not null default true,
  sort_order integer not null default 0,
  notes text,
  created_by uuid references public.app_users(id) on delete set null,
  updated_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expense_preset_items_default_currency_check check (
    default_currency is null or (char_length(trim(default_currency)) between 1 and 3)
  ),
  constraint expense_preset_items_override_calculation_type_check check (
    override_calculation_type is null or override_calculation_type in (
      'parameters',
      'fob',
      'freight',
      'insurance',
      'cif',
      'ii',
      'ipi',
      'icms'
    )
  ),
  constraint expense_preset_items_override_allocation_type_check check (
    override_allocation_type is null or override_allocation_type in ('value', 'net_weight', 'cif', 'gross_weight')
  ),
  constraint expense_preset_items_override_behavior_check check (
    override_behavior is null or override_behavior in (
      'accessory_expense',
      'tax_base',
      'icms_base',
      'not_applicable',
      'product_cost_only',
      'icms_base_courier_fine',
      'ipi_base'
    )
  )
);

create index if not exists expense_types_code_idx on public.expense_types (code);
create index if not exists expense_types_is_active_idx on public.expense_types (is_active);
create index if not exists expense_types_expense_modality_idx on public.expense_types (expense_modality);
create index if not exists expense_presets_transport_mode_idx on public.expense_presets (transport_mode);
create index if not exists expense_presets_is_active_idx on public.expense_presets (is_active);
create index if not exists expense_preset_items_preset_id_idx on public.expense_preset_items (preset_id);
create index if not exists expense_preset_items_expense_type_id_idx on public.expense_preset_items (expense_type_id);

drop trigger if exists expense_types_set_updated_at on public.expense_types;
create trigger expense_types_set_updated_at
before update on public.expense_types
for each row
execute function public.set_updated_at();

drop trigger if exists expense_presets_set_updated_at on public.expense_presets;
create trigger expense_presets_set_updated_at
before update on public.expense_presets
for each row
execute function public.set_updated_at();

drop trigger if exists expense_preset_items_set_updated_at on public.expense_preset_items;
create trigger expense_preset_items_set_updated_at
before update on public.expense_preset_items
for each row
execute function public.set_updated_at();

alter table public.expense_types enable row level security;
alter table public.expense_presets enable row level security;
alter table public.expense_preset_items enable row level security;

drop policy if exists "Admins can read expense types" on public.expense_types;
create policy "Admins can read expense types"
on public.expense_types
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert expense types" on public.expense_types;
create policy "Admins can insert expense types"
on public.expense_types
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update expense types" on public.expense_types;
create policy "Admins can update expense types"
on public.expense_types
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete expense types" on public.expense_types;
create policy "Admins can delete expense types"
on public.expense_types
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read expense presets" on public.expense_presets;
create policy "Admins can read expense presets"
on public.expense_presets
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert expense presets" on public.expense_presets;
create policy "Admins can insert expense presets"
on public.expense_presets
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update expense presets" on public.expense_presets;
create policy "Admins can update expense presets"
on public.expense_presets
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete expense presets" on public.expense_presets;
create policy "Admins can delete expense presets"
on public.expense_presets
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read expense preset items" on public.expense_preset_items;
create policy "Admins can read expense preset items"
on public.expense_preset_items
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert expense preset items" on public.expense_preset_items;
create policy "Admins can insert expense preset items"
on public.expense_preset_items
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update expense preset items" on public.expense_preset_items;
create policy "Admins can update expense preset items"
on public.expense_preset_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete expense preset items" on public.expense_preset_items;
create policy "Admins can delete expense preset items"
on public.expense_preset_items
for delete
to authenticated
using (public.is_admin());
