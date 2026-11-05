-- ════════════════════════════════════════════════════════════════════
-- Exchange UCV · Base de datos compartida (Supabase)
-- Cómo usarlo: en Supabase abre "SQL Editor" → "New query", pega TODO este
-- archivo y pulsa "Run". Se puede ejecutar más de una vez sin problema.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

-- 1. Datos de la página (publicaciones, perfiles, solicitudes, reportes,
--    estrellas, roles e historial). Cada fila es un objeto JSON.
create table if not exists public.items (
  collection text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

alter table public.items enable row level security;

drop policy if exists "items_leer" on public.items;
drop policy if exists "items_crear" on public.items;
drop policy if exists "items_editar" on public.items;
drop policy if exists "items_borrar" on public.items;
create policy "items_leer"   on public.items for select to anon, authenticated using (true);
create policy "items_crear"  on public.items for insert to anon, authenticated with check (true);
create policy "items_editar" on public.items for update to anon, authenticated using (true) with check (true);
create policy "items_borrar" on public.items for delete to anon, authenticated using (true);

-- 2. Cuentas: correo + contraseña cifrada con bcrypt.
--    Nadie puede leer esta tabla desde la página; solo las funciones de abajo.
create table if not exists public.accounts (
  email text primary key,
  user_id text not null unique,
  pass text not null,
  created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;
revoke all on public.accounts from anon, authenticated;

create or replace function public.exchange_register(p_user_id text, p_email text, p_password text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if length(coalesce(p_password, '')) < 8 then
    return false;
  end if;
  insert into public.accounts (email, user_id, pass)
  values (lower(trim(p_email)), p_user_id, crypt(p_password, gen_salt('bf')));
  return true;
exception when unique_violation then
  return false;
end $$;

create or replace function public.exchange_login(p_email text, p_password text)
returns text
language sql security definer set search_path = public, extensions as $$
  select user_id from public.accounts
  where email = lower(trim(p_email)) and pass = crypt(p_password, pass);
$$;

create or replace function public.exchange_change_password(p_email text, p_old text, p_new text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if length(coalesce(p_new, '')) < 8 then
    return false;
  end if;
  update public.accounts set pass = crypt(p_new, gen_salt('bf'))
  where email = lower(trim(p_email)) and pass = crypt(p_old, pass);
  return found;
end $$;

create or replace function public.exchange_delete_account(p_user_id text)
returns void
language sql security definer set search_path = public as $$
  delete from public.accounts
  where user_id = p_user_id
    and email not in ('admin@exchangeucv.pe', 'mdelgadoc@ucvvirtual.edu.pe', 'jgonzalezg@ucvvirtual.edu.pe', 'mgrandeza@ucvvirtual.edu.pe');
$$;

grant execute on function public.exchange_register(text, text, text) to anon, authenticated;
grant execute on function public.exchange_login(text, text) to anon, authenticated;
grant execute on function public.exchange_change_password(text, text, text) to anon, authenticated;
grant execute on function public.exchange_delete_account(text) to anon, authenticated;

-- Cuentas iniciales (administrador y autores del Grupo 5).
insert into public.accounts (email, user_id, pass) values
  ('admin@exchangeucv.pe',        'u-admin',    extensions.crypt('AdminUCV2026', extensions.gen_salt('bf'))),
  ('mdelgadoc@ucvvirtual.edu.pe', 'u-delgado',  extensions.crypt('AdminExchange2026*', extensions.gen_salt('bf'))),
  ('jgonzalezg@ucvvirtual.edu.pe','u-gonzalez', extensions.crypt('AdminExchange2026*', extensions.gen_salt('bf'))),
  ('mgrandeza@ucvvirtual.edu.pe', 'u-grandez',  extensions.crypt('AdminExchange2026*', extensions.gen_salt('bf')))
on conflict (email) do nothing;

-- 3. Archivos adjuntos (PDF, imágenes…): carpeta pública "adjuntos".
insert into storage.buckets (id, name, public, file_size_limit)
values ('adjuntos', 'adjuntos', true, 10485760)
on conflict (id) do update set public = true, file_size_limit = 10485760;

drop policy if exists "adjuntos_leer" on storage.objects;
drop policy if exists "adjuntos_subir" on storage.objects;
drop policy if exists "adjuntos_actualizar" on storage.objects;
drop policy if exists "adjuntos_borrar" on storage.objects;
create policy "adjuntos_leer"       on storage.objects for select to anon, authenticated using (bucket_id = 'adjuntos');
create policy "adjuntos_subir"      on storage.objects for insert to anon, authenticated with check (bucket_id = 'adjuntos');
create policy "adjuntos_actualizar" on storage.objects for update to anon, authenticated using (bucket_id = 'adjuntos');
create policy "adjuntos_borrar"     on storage.objects for delete to anon, authenticated using (bucket_id = 'adjuntos');
