alter table public.clients
add column if not exists source text not null default 'site' check (source in ('site', 'admin'));

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  created_by_app_user_id uuid references public.app_users(id) on delete set null,
  product_name text not null,
  hs_code text,
  supplier_name text,
  supplier_email text,
  supplier_phone text,
  fob_unit_usd numeric(12, 2) not null default 0,
  quantity integer not null default 0,
  fob_total_usd numeric(14, 2) not null default 0,
  used_dollar numeric(12, 4) not null default 0,
  unit_cost_rpx_brl numeric(14, 2) not null default 0,
  total_cost_rpx_brl numeric(14, 2) not null default 0,
  unit_cost_direct_brl numeric(14, 2) not null default 0,
  total_cost_direct_brl numeric(14, 2) not null default 0,
  savings_brl numeric(14, 2) not null default 0,
  savings_percent numeric(10, 4) not null default 0,
  status text not null default 'submitted' check (
    status in ('draft', 'submitted', 'simulation_requested', 'in_review', 'completed')
  ),
  simulation_request_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  created_by_app_user_id uuid references public.app_users(id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  file_name text,
  storage_path text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_client_id_idx on public.quotes (client_id);
create index if not exists quotes_status_idx on public.quotes (status);
create index if not exists simulations_client_id_idx on public.simulations (client_id);
create index if not exists simulations_status_idx on public.simulations (status);

alter table public.quotes enable row level security;
alter table public.simulations enable row level security;

drop policy if exists "Clients can read own quotes" on public.quotes;
create policy "Clients can read own quotes"
on public.quotes
for select
to authenticated
using (
  client_id in (
    select client_id
    from public.app_users
    where auth_provider_user_id = auth.uid()::text
  )
);

drop policy if exists "Admins can read all quotes" on public.quotes;
create policy "Admins can read all quotes"
on public.quotes
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert quotes" on public.quotes;
create policy "Admins can insert quotes"
on public.quotes
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update quotes" on public.quotes;
create policy "Admins can update quotes"
on public.quotes
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Clients can read own simulations" on public.simulations;
create policy "Clients can read own simulations"
on public.simulations
for select
to authenticated
using (
  client_id in (
    select client_id
    from public.app_users
    where auth_provider_user_id = auth.uid()::text
  )
);

drop policy if exists "Admins can read all simulations" on public.simulations;
create policy "Admins can read all simulations"
on public.simulations
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert simulations" on public.simulations;
create policy "Admins can insert simulations"
on public.simulations
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update simulations" on public.simulations;
create policy "Admins can update simulations"
on public.simulations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

with inserted_clients as (
  insert into public.clients (
    company_name,
    trade_name,
    contact_name,
    contact_email,
    contact_phone,
    source
  )
  select
    coalesce(nullif(app_users.name, ''), app_users.email),
    nullif(app_users.name, ''),
    app_users.name,
    app_users.email,
    app_users.phone,
    'site'
  from public.app_users
  where app_users.role = 'client'
    and app_users.client_id is null
  returning id, contact_email
)
update public.app_users
set client_id = inserted_clients.id
from inserted_clients
where public.app_users.role = 'client'
  and public.app_users.client_id is null
  and public.app_users.email = inserted_clients.contact_email;
