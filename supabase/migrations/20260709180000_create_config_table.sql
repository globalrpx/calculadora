create table if not exists public.config (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint config_key_format_check check (key ~ '^[a-z0-9_]+$')
);

create unique index if not exists config_key_idx on public.config (key);

drop trigger if exists config_set_updated_at on public.config;
create trigger config_set_updated_at
before update on public.config
for each row
execute function public.set_updated_at();

alter table public.config enable row level security;

drop policy if exists "Admins can read config" on public.config;
create policy "Admins can read config"
on public.config
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert config" on public.config;
create policy "Admins can insert config"
on public.config
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update config" on public.config;
create policy "Admins can update config"
on public.config
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete config" on public.config;
create policy "Admins can delete config"
on public.config
for delete
to authenticated
using (public.is_admin());

insert into public.config (key, value, description)
values (
  'import_factor',
  '1.8',
  'Fator de importação aplicado sobre o valor FOB no cálculo da cotação.'
)
on conflict (key) do nothing;
