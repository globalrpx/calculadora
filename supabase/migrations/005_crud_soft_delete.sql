alter table public.clients
alter column company_name drop not null;

alter table public.clients
add column if not exists deleted_at timestamptz;

alter table public.app_users
add column if not exists deleted_at timestamptz;

update public.clients
set status = 'inactive'
where deleted_at is not null;

update public.app_users
set status = 'inactive'
where deleted_at is not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'clients_status_check'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients drop constraint clients_status_check;
  end if;
end $$;

alter table public.clients
add constraint clients_status_check
check (status in ('active', 'inactive'));

drop index if exists app_users_email_lower_idx;
create unique index if not exists app_users_email_lower_active_idx
on public.app_users (lower(email))
where deleted_at is null;

create index if not exists clients_deleted_at_idx on public.clients (deleted_at);
create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_source_idx on public.clients (source);
create index if not exists app_users_deleted_at_idx on public.app_users (deleted_at);
