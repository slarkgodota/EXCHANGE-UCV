create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  career text not null default 'General / Interdisciplinario',
  campus text not null default 'Lima Norte',
  cycle text not null default 'Ciclo I',
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 10000),
  category text not null check (category in ('conocimientos', 'materiales', 'investigacion')),
  career text not null default 'General / Interdisciplinario',
  course text not null default '',
  cycle_level text not null default 'Todos',
  tags text[] not null default '{}',
  exchange_type text not null check (
    exchange_type in ('Intercambio Académico', 'Gratuito / RSU', 'Colaboración en Equipo')
  ),
  file_type text check (file_type in ('PDF', 'DOCX', 'ZIP', 'XLSX', 'Sesión Google Meet')),
  file_size text,
  status text not null default 'en_revision' check (
    status in ('aprobado', 'en_revision', 'destacado', 'reportado')
  ),
  ai_audit jsonb,
  download_count integer not null default 0 check (download_count >= 0),
  contact_count integer not null default 0 check (contact_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publication_reviews (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 3000),
  verified_exchange boolean not null default false,
  created_at timestamptz not null default now(),
  unique (publication_id, author_id)
);

create table public.exchange_requests (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  message text not null check (char_length(message) between 1 and 3000),
  proposed_exchange text not null default '' check (char_length(proposed_exchange) <= 1000),
  status text not null default 'pendiente' check (
    status in ('pendiente', 'aceptada', 'rechazada', 'completada')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

create table public.plagiarism_reports (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (
    reason in ('plagio', 'material_inapropiado', 'informacion_falsa', 'otro')
  ),
  details text not null default '' check (char_length(details) <= 5000),
  status text not null default 'pendiente' check (
    status in ('pendiente', 'investigando', 'resuelto', 'descartado')
  ),
  created_at timestamptz not null default now()
);

create index publications_author_created_idx
  on public.publications (author_id, created_at desc);
create index publications_public_feed_idx
  on public.publications (created_at desc)
  where status in ('aprobado', 'destacado');
create index exchange_requests_sender_idx
  on public.exchange_requests (sender_id, created_at desc);
create index exchange_requests_receiver_idx
  on public.exchange_requests (receiver_id, created_at desc);
create index plagiarism_reports_publication_idx
  on public.plagiarism_reports (publication_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger publications_set_updated_at
before update on public.publications
for each row execute function public.set_updated_at();

create trigger exchange_requests_set_updated_at
before update on public.exchange_requests
for each row execute function public.set_updated_at();

create or replace function public.guard_exchange_request_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (to_jsonb(new) - 'status' - 'updated_at')
    is distinct from (to_jsonb(old) - 'status' - 'updated_at') then
    raise exception 'Only the request status can be changed';
  end if;

  if old.status = 'pendiente'
    and new.status in ('aceptada', 'rechazada') then
    return new;
  end if;

  if old.status = 'aceptada'
    and new.status = 'completada' then
    return new;
  end if;

  raise exception 'Invalid exchange request status transition';
end;
$$;

create trigger exchange_requests_guard_update
before update on public.exchange_requests
for each row execute function public.guard_exchange_request_update();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');

  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(requested_name, split_part(coalesce(new.email, 'Estudiante'), '@', 1)), 100)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.publications enable row level security;
alter table public.publication_reviews enable row level security;
alter table public.exchange_requests enable row level security;
alter table public.plagiarism_reports enable row level security;

create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Approved publications are publicly readable"
on public.publications for select
to anon, authenticated
using (
  status in ('aprobado', 'destacado')
  or (select auth.uid()) = author_id
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Signed-in users can create their own pending publications"
on public.publications for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and status = 'en_revision'
);

create policy "Authors can update their own pending publications"
on public.publications for update
to authenticated
using (
  (select auth.uid()) = author_id
  and status = 'en_revision'
)
with check (
  (select auth.uid()) = author_id
  and status = 'en_revision'
);

create policy "Authors can delete their own pending publications"
on public.publications for delete
to authenticated
using (
  (select auth.uid()) = author_id
  and status = 'en_revision'
);

create policy "Reviews are publicly readable"
on public.publication_reviews for select
to anon, authenticated
using (true);

create policy "Signed-in users can create their own reviews"
on public.publication_reviews for insert
to authenticated
with check ((select auth.uid()) = author_id);

create policy "Authors can update their own reviews"
on public.publication_reviews for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Authors can delete their own reviews"
on public.publication_reviews for delete
to authenticated
using ((select auth.uid()) = author_id);

create policy "Participants can read their exchange requests"
on public.exchange_requests for select
to authenticated
using (
  (select auth.uid()) = sender_id
  or (select auth.uid()) = receiver_id
);

create policy "Signed-in users can send exchange requests"
on public.exchange_requests for insert
to authenticated
with check (
  (select auth.uid()) = sender_id
  and sender_id <> receiver_id
  and exists (
    select 1
    from public.publications p
    where p.id = publication_id
      and p.author_id = receiver_id
      and p.status in ('aprobado', 'destacado')
  )
);

create policy "Receivers can update their exchange request status"
on public.exchange_requests for update
to authenticated
using ((select auth.uid()) = receiver_id)
with check (
  (select auth.uid()) = receiver_id
  and status in ('aceptada', 'rechazada', 'completada')
);

create policy "Users can submit reports"
on public.plagiarism_reports for insert
to authenticated
with check ((select auth.uid()) = reporter_id);

create policy "Users can read their own reports"
on public.plagiarism_reports for select
to authenticated
using (
  (select auth.uid()) = reporter_id
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.publications, public.publication_reviews to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.publications to authenticated;
grant insert, update, delete on public.publication_reviews to authenticated;
grant select, insert, update on public.exchange_requests to authenticated;
grant select, insert on public.plagiarism_reports to authenticated;
