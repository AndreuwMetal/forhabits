-- ---------------------------------------------------------------------------
-- ForHabits · esquema premium (perfiles, bolsa de retos y control de pagos).
--
-- Pensado para correr de una sola pasada sobre un proyecto Supabase recién
-- creado, y para poder repetirse sin romper nada (create ... if not exists,
-- drop policy if exists antes de cada create policy).
--
-- Los usuarios son ANÓNIMOS: la app llama a `auth.signInAnonymously()`, no hay
-- login con email. Supabase les asigna igualmente el rol `authenticated`
-- (el rol `anon` es el de las peticiones sin sesión), así que todas las
-- políticas apuntan a `authenticated`.
--
-- El catálogo de retos NO vive aquí: es contenido estático de `src/challenges.ts`.
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- Utilidad compartida: mantener `updated_at` sin que el cliente pueda mentir.
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- profiles · una fila por usuario
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  -- nombre público corto; lo genera el cliente y sobrescribe el valor por defecto
  display_name text not null default 'Anónimo',
  avatar text not null default '⭐',
  -- estas tres columnas SOLO las escribe el webhook de Stripe (service_role)
  is_premium boolean not null default false,
  premium_until timestamptz,          -- null = premium sin caducidad conocida (pago único)
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Blindaje de is_premium / premium_until / stripe_customer_id.
--
-- RLS decide QUÉ FILAS puedes tocar, pero no qué columnas. Para las columnas
-- usamos privilegios de Postgres a nivel de columna, que es la vía más simple
-- y la que PostgREST respeta de serie: revocamos todo a los roles del cliente
-- y devolvemos solo SELECT y UPDATE sobre las dos columnas cosméticas.
-- Un intento de escribir is_premium desde la app falla con "permission denied
-- for column", sin necesidad de triggers que reviertan valores.
-- `service_role` no se toca, así que el webhook sigue pudiendo escribirlas.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar) on public.profiles to authenticated;

-- Cada usuario ve únicamente su propia fila: los perfiles ajenos no se exponen
-- (la clasificación de retos usa datos denormalizados, ver más abajo).
drop policy if exists "perfil: leer solo el propio" on public.profiles;
create policy "perfil: leer solo el propio"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

-- Y solo puede actualizar su propia fila. Combinado con el grant de columnas
-- de arriba, eso significa: únicamente display_name y avatar.
drop policy if exists "perfil: actualizar solo el propio" on public.profiles;
create policy "perfil: actualizar solo el propio"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sin políticas de INSERT ni DELETE: el perfil lo crea el trigger de abajo y
-- se borra en cascada al borrarse el usuario. El cliente no puede ni crear ni
-- eliminar perfiles.

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();


-- Alta automática del perfil al registrarse (incluido el registro anónimo).
-- SECURITY DEFINER porque el rol que inserta en auth.users no tiene permisos
-- sobre public.profiles; `search_path = ''` obliga a cualificar los nombres.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- challenge_entries · participación de un usuario en un reto de la bolsa
-- ---------------------------------------------------------------------------
create table if not exists public.challenge_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- id del catálogo estático (src/challenges.ts); a propósito sin FK
  challenge_id text not null,
  habit_name text,
  habit_emoji text,
  -- denormalizados: así la clasificación es un SELECT plano, sin join y sin
  -- necesidad de abrir profiles a lectura ajena. Contrapartida asumida: el
  -- cliente escribe su propio alias, así que puede poner el que quiera (igual
  -- que en profiles); solo afecta a lo que ven los demás en el ranking.
  display_name text not null,
  avatar text not null,
  started_at timestamptz not null default now(),
  done_days integer not null default 0 check (done_days >= 0),
  total_days integer not null check (total_days > 0),
  updated_at timestamptz not null default now(),
  unique (user_id, challenge_id),
  -- no se puede completar más días de los que dura el reto
  constraint challenge_entries_done_le_total check (done_days <= total_days)
);

-- Índice de la clasificación: filtra por reto y ordena por progreso.
create index if not exists challenge_entries_ranking_idx
  on public.challenge_entries (challenge_id, done_days desc);

alter table public.challenge_entries enable row level security;

-- La clasificación es la gracia del reto: cualquier usuario autenticado lee
-- todas las filas. Solo se exponen alias, emoji y progreso, nunca el perfil.
drop policy if exists "retos: la clasificación es pública" on public.challenge_entries;
create policy "retos: la clasificación es pública"
  on public.challenge_entries for select to authenticated
  using (true);

-- Apuntarse: solo a título propio. `with check` impide insertar filas con el
-- user_id de otra persona.
drop policy if exists "retos: apuntarse solo a título propio" on public.challenge_entries;
create policy "retos: apuntarse solo a título propio"
  on public.challenge_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Actualizar progreso: solo filas propias, y sin poder reasignarlas a otro
-- usuario (`using` filtra la fila original, `with check` la resultante).
drop policy if exists "retos: actualizar solo lo propio" on public.challenge_entries;
create policy "retos: actualizar solo lo propio"
  on public.challenge_entries for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Abandonar un reto: solo el suyo.
drop policy if exists "retos: borrar solo lo propio" on public.challenge_entries;
create policy "retos: borrar solo lo propio"
  on public.challenge_entries for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ponytail: no se comprueba profiles.is_premium al apuntarse. El techo es que
-- un usuario con la app parcheada podría insertar entradas sin haber pagado
-- (ver la clasificación, no cobrar de más). Si algún día molesta, basta añadir
-- `and exists (select 1 from public.profiles p where p.id = (select auth.uid())
-- and p.is_premium)` al `with check` del insert.

drop trigger if exists challenge_entries_touch_updated_at on public.challenge_entries;
create trigger challenge_entries_touch_updated_at
  before update on public.challenge_entries
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------------
-- stripe_events · idempotencia de los webhooks
-- ---------------------------------------------------------------------------
-- Stripe reintenta la entrega de cada evento. Guardamos el id procesado y el
-- webhook sale pronto si ya está.
create table if not exists public.stripe_events (
  id text primary key,
  received_at timestamptz not null default now()
);

-- RLS activo y CERO políticas: nadie que llegue por la API pública puede leerla
-- ni escribirla. Además le quitamos los privilegios a los roles del cliente.
-- Solo `service_role` (el webhook) la toca.
alter table public.stripe_events enable row level security;
revoke all on public.stripe_events from anon, authenticated;
