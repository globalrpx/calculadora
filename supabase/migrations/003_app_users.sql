create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  phone text,
  role text not null check (role in ('admin', 'client')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  client_id uuid references public.clients(id) on delete set null,
  auth_provider text,
  auth_provider_user_id text,
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists app_users_email_lower_idx on public.app_users (lower(email));

create unique index if not exists app_users_auth_provider_user_id_idx
on public.app_users (auth_provider, auth_provider_user_id)
where auth_provider is not null and auth_provider_user_id is not null;

insert into public.app_users (
  id,
  name,
  email,
  phone,
  role,
  status,
  client_id,
  auth_provider,
  auth_provider_user_id,
  accepted_terms_at,
  created_at,
  updated_at
)
select
  profiles.id,
  profiles.name,
  coalesce(profiles.email, auth_users.email),
  profiles.phone,
  profiles.role,
  'active',
  profiles.client_id,
  'supabase',
  profiles.auth_user_id::text,
  null,
  profiles.created_at,
  profiles.updated_at
from public.profiles
left join auth.users as auth_users on auth_users.id = profiles.auth_user_id
where coalesce(profiles.email, auth_users.email) is not null
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  role = excluded.role,
  status = excluded.status,
  client_id = excluded.client_id,
  auth_provider = excluded.auth_provider,
  auth_provider_user_id = excluded.auth_provider_user_id,
  updated_at = excluded.updated_at;

alter table public.app_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users
    where auth_provider_user_id = auth.uid()::text
      and role = 'admin'
      and status = 'active'
  );
$$;

drop policy if exists "Users can read own app user" on public.app_users;
create policy "Users can read own app user"
on public.app_users
for select
to authenticated
using (auth_provider_user_id = auth.uid()::text);

drop policy if exists "Admins can read all app users" on public.app_users;
create policy "Admins can read all app users"
on public.app_users
for select
to authenticated
using (public.is_admin());

drop policy if exists "Clients can read linked client" on public.clients;
create policy "Clients can read linked client"
on public.clients
for select
to authenticated
using (
  id in (
    select client_id
    from public.app_users
    where auth_provider_user_id = auth.uid()::text
  )
);

drop policy if exists "Admins can read all clients" on public.clients;
create policy "Admins can read all clients"
on public.clients
for select
to authenticated
using (public.is_admin());

drop trigger if exists on_auth_user_created_profile on auth.users;
drop function if exists public.handle_new_user_profile();
