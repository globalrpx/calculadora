alter table public.quotes
add column if not exists rpx_factor numeric(10, 4) not null default 1.8,
add column if not exists direct_import_factor numeric(10, 4) not null default 2.2,
add column if not exists product_image_urls text[] not null default '{}',
add column if not exists supplier_contact_image_urls text[] not null default '{}',
add column if not exists calculation_payload jsonb not null default '{}'::jsonb;

alter table public.simulations
add column if not exists quote_file_url text,
add column if not exists requested_at timestamptz,
add column if not exists client_notes text;

alter table public.quotes drop constraint if exists quotes_status_check;
alter table public.quotes
add constraint quotes_status_check
check (status in ('draft', 'submitted', 'simulation_requested', 'in_review', 'completed'));

alter table public.simulations drop constraint if exists simulations_status_check;
alter table public.simulations
add constraint simulations_status_check
check (status in ('draft', 'aguardando', 'em_producao', 'published', 'finalizado', 'cancelado'));

create index if not exists quotes_created_by_app_user_id_idx on public.quotes (created_by_app_user_id);
create index if not exists simulations_quote_id_idx on public.simulations (quote_id);

create unique index if not exists simulations_pending_quote_idx
on public.simulations (quote_id)
where quote_id is not null and status in ('aguardando', 'em_producao', 'draft');

drop policy if exists "Clients can insert own quotes" on public.quotes;
create policy "Clients can insert own quotes"
on public.quotes
for insert
to authenticated
with check (
  client_id in (
    select client_id
    from public.app_users
    where auth_provider_user_id = auth.uid()::text
      and role = 'client'
      and status = 'active'
      and deleted_at is null
  )
);

drop policy if exists "Clients can update own quotes" on public.quotes;
create policy "Clients can update own quotes"
on public.quotes
for update
to authenticated
using (
  client_id in (
    select client_id
    from public.app_users
    where auth_provider_user_id = auth.uid()::text
      and role = 'client'
      and status = 'active'
      and deleted_at is null
  )
)
with check (
  client_id in (
    select client_id
    from public.app_users
    where auth_provider_user_id = auth.uid()::text
      and role = 'client'
      and status = 'active'
      and deleted_at is null
  )
);

drop policy if exists "Clients can insert own simulation requests" on public.simulations;
create policy "Clients can insert own simulation requests"
on public.simulations
for insert
to authenticated
with check (
  client_id in (
    select client_id
    from public.app_users
    where auth_provider_user_id = auth.uid()::text
      and role = 'client'
      and status = 'active'
      and deleted_at is null
  )
);
