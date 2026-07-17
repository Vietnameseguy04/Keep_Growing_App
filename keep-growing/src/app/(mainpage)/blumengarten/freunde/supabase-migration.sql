-- ============================================================
-- Keep Growing – Migration: Freunde-System & Garten-Reset
-- ============================================================
-- Ausführen im Supabase-Dashboard: SQL Editor -> New query ->
-- kompletten Inhalt einfügen -> Run.
--
-- Das Skript ist idempotent (mehrfaches Ausführen schadet nicht).
--
-- Es legt an:
--   1. profiles         – öffentliche Profil-Daten (Name, E-Mail) pro Konto,
--                         damit Freunde per E-Mail gefunden werden können
--   2. friendships      – Freundschaftsanfragen (pending/accepted)
--   3. garden_settings  – Zeitpunkt des letzten manuellen Wiesen-Resets
--   4. garden_likes     – Likes auf Blumenwiesen von Freunden
--   5. notifications    – Benachrichtigungen ("X gefällt deine Blumenwiese")
--   6. RLS-Policy, damit Freunde gegenseitig ihre flower_garden-Einträge
--      LESEN (nicht verändern) dürfen
-- ============================================================


-- ------------------------------------------------------------
-- 1. profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Eingeloggte dürfen Profile lesen (nötig für die Freundes-Suche per E-Mail).
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Neues Konto -> automatisch Profil anlegen
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bereits vorhandene Konten nachtragen
insert into public.profiles (id, full_name, email)
select id, coalesce(raw_user_meta_data ->> 'full_name', ''), email
from auth.users
on conflict (id) do nothing;


-- ------------------------------------------------------------
-- 2. friendships
-- ------------------------------------------------------------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table public.friendships enable row level security;

drop policy if exists "friendships_select_involved" on public.friendships;
create policy "friendships_select_involved"
  on public.friendships for select
  to authenticated
  using (auth.uid() in (requester_id, addressee_id));

drop policy if exists "friendships_insert_requester" on public.friendships;
create policy "friendships_insert_requester"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = requester_id and status = 'pending');

-- Nur die angefragte Person darf annehmen
drop policy if exists "friendships_update_addressee" on public.friendships;
create policy "friendships_update_addressee"
  on public.friendships for update
  to authenticated
  using (auth.uid() = addressee_id)
  with check (status = 'accepted');

-- Beide Seiten dürfen die Freundschaft/Anfrage löschen (ablehnen/beenden)
drop policy if exists "friendships_delete_involved" on public.friendships;
create policy "friendships_delete_involved"
  on public.friendships for delete
  to authenticated
  using (auth.uid() in (requester_id, addressee_id));

-- Hilfsfunktion: Sind zwei Personen befreundet?
-- (security definer, damit sie in Policies anderer Tabellen nutzbar ist)
create or replace function public.are_friends(person_a uuid, person_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.friendships
    where status = 'accepted'
      and (
        (requester_id = person_a and addressee_id = person_b)
        or (requester_id = person_b and addressee_id = person_a)
      )
  );
$$;


-- ------------------------------------------------------------
-- 3. garden_settings (manueller Wiesen-Reset)
-- ------------------------------------------------------------
create table if not exists public.garden_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  last_reset_at timestamptz
);

alter table public.garden_settings enable row level security;

-- Eigene Einstellungen + die von Freunden lesen (damit beim Besuch einer
-- Wiese dieselbe Sichtbarkeitsregel gilt wie für die Besitzerin selbst)
drop policy if exists "garden_settings_select" on public.garden_settings;
create policy "garden_settings_select"
  on public.garden_settings for select
  to authenticated
  using (
    auth.uid() = user_id
    or public.are_friends(auth.uid(), user_id)
  );

drop policy if exists "garden_settings_insert_own" on public.garden_settings;
create policy "garden_settings_insert_own"
  on public.garden_settings for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "garden_settings_update_own" on public.garden_settings;
create policy "garden_settings_update_own"
  on public.garden_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 4. garden_likes
-- ------------------------------------------------------------
-- Likes sind bewusst mehrfach möglich (kein Unique-Constraint): Nach dem
-- Absenden springt das Herz zurück und es kann später erneut geliked
-- werden. Optional kann eine kurze Nachricht mitgeschickt werden.
create table if not exists public.garden_likes (
  id uuid primary key default gen_random_uuid(),
  garden_owner_id uuid not null references public.profiles (id) on delete cascade,
  liker_id uuid not null references public.profiles (id) on delete cascade,
  message text,
  created_at timestamptz not null default now(),
  check (garden_owner_id <> liker_id)
);

-- Upgrade für Installationen, die die frühere Version dieses Skripts
-- (mit Unique-Constraint und ohne message-Spalte) bereits ausgeführt haben:
alter table public.garden_likes
  drop constraint if exists garden_likes_garden_owner_id_liker_id_key;
alter table public.garden_likes
  add column if not exists message text;

alter table public.garden_likes enable row level security;

drop policy if exists "garden_likes_select_involved" on public.garden_likes;
create policy "garden_likes_select_involved"
  on public.garden_likes for select
  to authenticated
  using (auth.uid() in (garden_owner_id, liker_id));

-- Liken dürfen nur Freunde
drop policy if exists "garden_likes_insert_friend" on public.garden_likes;
create policy "garden_likes_insert_friend"
  on public.garden_likes for insert
  to authenticated
  with check (
    auth.uid() = liker_id
    and public.are_friends(auth.uid(), garden_owner_id)
  );

drop policy if exists "garden_likes_delete_own" on public.garden_likes;
create policy "garden_likes_delete_own"
  on public.garden_likes for delete
  to authenticated
  using (auth.uid() = liker_id);


-- ------------------------------------------------------------
-- 5. notifications
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null default 'garden_like',
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Upgrade für Installationen mit der früheren Skript-Version:
alter table public.notifications
  add column if not exists message text;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

-- Als gelesen markieren
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Benachrichtigungen entstehen NICHT vom Client aus, sondern automatisch
-- über diesen Trigger, sobald ein Like gespeichert wird:
create or replace function public.notify_garden_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, actor_id, type, message)
  values (new.garden_owner_id, new.liker_id, 'garden_like', new.message);
  return new;
end;
$$;

drop trigger if exists on_garden_like on public.garden_likes;
create trigger on_garden_like
  after insert on public.garden_likes
  for each row execute function public.notify_garden_like();


-- Realtime für notifications aktivieren, damit der Browser sofort
-- benachrichtigt werden kann, wenn ein neues Like eintrifft
-- (genutzt von blumengarten/freunde/LikeBenachrichtigungen.tsx):
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;


-- ------------------------------------------------------------
-- 6. flower_garden: Freunde dürfen (nur) lesen
-- ------------------------------------------------------------
-- Voraussetzung: Auf flower_garden ist RLS bereits aktiv und es existiert
-- eine Policy, die Besitzerinnen ihre eigenen Zeilen erlaubt.
-- Diese zusätzliche Policy erlaubt Freunden ausschließlich SELECT:
drop policy if exists "flower_garden_select_friends" on public.flower_garden;
create policy "flower_garden_select_friends"
  on public.flower_garden for select
  to authenticated
  using (public.are_friends(auth.uid(), user_id));
