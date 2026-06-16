create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  trade_name text,
  document text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null check (role in ('admin', 'client')),
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and role = 'admin'
  );
$$;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth_user_id = auth.uid());

create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

create policy "Clients can read linked client"
on public.clients
for select
to authenticated
using (
  id in (
    select client_id
    from public.profiles
    where auth_user_id = auth.uid()
  )
);

create policy "Admins can read all clients"
on public.clients
for select
to authenticated
using (public.is_admin());
