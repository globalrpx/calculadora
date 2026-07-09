insert into storage.buckets (id, name, public, file_size_limit)
values ('app-uploads', 'app-uploads', false, 10485760)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = 10485760;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'app-uploads',
  path text not null,
  original_name text not null,
  stored_name text not null,
  mime_type text,
  size_bytes bigint not null,
  extension text,
  context text not null,
  simulation_id uuid references public.simulations(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uploads_exactly_one_owner_check check (
    (
      case when simulation_id is not null then 1 else 0 end
      +
      case when quote_id is not null then 1 else 0 end
    ) = 1
  ),
  constraint uploads_size_bytes_positive_check check (size_bytes >= 0)
);

create unique index if not exists uploads_bucket_path_idx on public.uploads (bucket, path);
create index if not exists uploads_simulation_id_idx on public.uploads (simulation_id);
create index if not exists uploads_quote_id_idx on public.uploads (quote_id);
create index if not exists uploads_context_idx on public.uploads (context);
create index if not exists uploads_created_at_idx on public.uploads (created_at);
create index if not exists uploads_deleted_at_idx on public.uploads (deleted_at);

drop trigger if exists uploads_set_updated_at on public.uploads;
create trigger uploads_set_updated_at
before update on public.uploads
for each row
execute function public.set_updated_at();

alter table public.uploads enable row level security;

drop policy if exists "Admins can read uploads" on public.uploads;
create policy "Admins can read uploads"
on public.uploads
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert uploads" on public.uploads;
create policy "Admins can insert uploads"
on public.uploads
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update uploads" on public.uploads;
create policy "Admins can update uploads"
on public.uploads
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete uploads" on public.uploads;
create policy "Admins can delete uploads"
on public.uploads
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read app uploads objects" on storage.objects;
create policy "Admins can read app uploads objects"
on storage.objects
for select
to authenticated
using (bucket_id = 'app-uploads' and public.is_admin());

drop policy if exists "Admins can insert app uploads objects" on storage.objects;
create policy "Admins can insert app uploads objects"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'app-uploads' and public.is_admin());

drop policy if exists "Admins can update app uploads objects" on storage.objects;
create policy "Admins can update app uploads objects"
on storage.objects
for update
to authenticated
using (bucket_id = 'app-uploads' and public.is_admin())
with check (bucket_id = 'app-uploads' and public.is_admin());

drop policy if exists "Admins can delete app uploads objects" on storage.objects;
create policy "Admins can delete app uploads objects"
on storage.objects
for delete
to authenticated
using (bucket_id = 'app-uploads' and public.is_admin());
