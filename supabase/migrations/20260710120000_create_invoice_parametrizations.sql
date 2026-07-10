create table if not exists public.invoice_parametrizations (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  key text,
  operation_type text not null,
  description text not null,
  operation_nature text,
  cfop text,
  operation_group text,
  tax_regime text,
  icms_rate numeric(10, 4) not null default 0,
  destination_scope text,
  customer_profile text,
  is_unified boolean not null default false,
  branch_id uuid,
  branch_name text,
  customer_id uuid references public.clients(id) on delete set null,
  customer_name text,
  is_active boolean not null default true,
  internal_notes text,
  created_by uuid references public.app_users(id) on delete set null,
  updated_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_parametrizations_operation_type_check check (
    operation_type in ('entrada', 'saida')
  ),
  constraint invoice_parametrizations_operation_group_check check (
    operation_group is null or operation_group in (
      'conta_e_ordem',
      'venda_mercadoria',
      'unificado',
      'compra_comercializacao',
      'simulacao_terceiros',
      'outro'
    )
  ),
  constraint invoice_parametrizations_tax_regime_check check (
    tax_regime is null or tax_regime in (
      'simples_nacional',
      'lucro_real',
      'lucro_presumido',
      'consumidor_final',
      'outro'
    )
  ),
  constraint invoice_parametrizations_destination_scope_check check (
    destination_scope is null or destination_scope in ('interno', 'interestadual', 'fora_estado', 'outro')
  ),
  constraint invoice_parametrizations_customer_profile_check check (
    customer_profile is null or customer_profile in ('revenda', 'consumidor_final', 'industria', 'outro')
  )
);

alter table public.final_simulations
  add column if not exists trade_commission_mode text,
  add column if not exists trade_commission_percent numeric(10, 4) not null default 0,
  add column if not exists trade_commission_amount_brl numeric(18, 6) not null default 0,
  add column if not exists ignore_trade_commission_contract boolean not null default false,
  add column if not exists credits_ipi boolean not null default false,
  add column if not exists credits_pis boolean not null default false,
  add column if not exists credits_cofins boolean not null default false,
  add column if not exists credits_icms boolean not null default false,
  add column if not exists tax_regime_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists tax_credit_notes text,
  add column if not exists tax_credit_validated_by uuid references public.app_users(id) on delete set null,
  add column if not exists tax_credit_validated_at timestamptz,
  add column if not exists entry_invoice_parametrization_id uuid references public.invoice_parametrizations(id) on delete set null,
  add column if not exists entry_invoice_parametrization_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists exit_invoice_parametrization_id uuid references public.invoice_parametrizations(id) on delete set null,
  add column if not exists exit_invoice_parametrization_snapshot jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'final_simulations_trade_commission_mode_check'
      and conrelid = 'public.final_simulations'::regclass
  ) then
    alter table public.final_simulations
      add constraint final_simulations_trade_commission_mode_check check (
        trade_commission_mode is null or trade_commission_mode in ('percent', 'fixed_expense', 'none')
      );
  end if;
end
$$;

create index if not exists invoice_parametrizations_operation_type_idx
  on public.invoice_parametrizations (operation_type);

create index if not exists invoice_parametrizations_code_idx
  on public.invoice_parametrizations (code);

create index if not exists invoice_parametrizations_is_active_idx
  on public.invoice_parametrizations (is_active);

create index if not exists invoice_parametrizations_customer_id_idx
  on public.invoice_parametrizations (customer_id);

create index if not exists final_simulations_entry_invoice_parametrization_id_idx
  on public.final_simulations (entry_invoice_parametrization_id);

create index if not exists final_simulations_exit_invoice_parametrization_id_idx
  on public.final_simulations (exit_invoice_parametrization_id);

drop trigger if exists invoice_parametrizations_set_updated_at on public.invoice_parametrizations;
create trigger invoice_parametrizations_set_updated_at
before update on public.invoice_parametrizations
for each row
execute function public.set_updated_at();

alter table public.invoice_parametrizations enable row level security;

drop policy if exists "Admins can read invoice parametrizations" on public.invoice_parametrizations;
create policy "Admins can read invoice parametrizations"
on public.invoice_parametrizations
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert invoice parametrizations" on public.invoice_parametrizations;
create policy "Admins can insert invoice parametrizations"
on public.invoice_parametrizations
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update invoice parametrizations" on public.invoice_parametrizations;
create policy "Admins can update invoice parametrizations"
on public.invoice_parametrizations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete invoice parametrizations" on public.invoice_parametrizations;
create policy "Admins can delete invoice parametrizations"
on public.invoice_parametrizations
for delete
to authenticated
using (public.is_admin());
