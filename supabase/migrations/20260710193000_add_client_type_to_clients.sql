alter table public.clients
add column if not exists client_type text;

update public.clients
set client_type = 'client'
where client_type is null;

alter table public.clients
alter column client_type set default 'client';

alter table public.clients
alter column client_type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_client_type_check'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
    add constraint clients_client_type_check
    check (client_type in ('lead', 'client'));
  end if;
end $$;

create index if not exists idx_clients_client_type
on public.clients (client_type);
