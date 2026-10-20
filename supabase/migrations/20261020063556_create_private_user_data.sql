-- Database foundation only: application reads/writes remain local until Auth
-- and private Storage are connected. No local data is imported here.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'นักเดินทาง' check (char_length(btrim(name)) between 1 and 60),
  username text not null default 'new_hiker' check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  bio text not null default '' check (char_length(bio) <= 160),
  created_at timestamptz not null default now()
);

-- A username is a private display field, not a globally unique public handle.
-- Scope text IDs to an account so old record IDs can be imported unchanged.
create table public.travel_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null default gen_random_uuid()::text check (btrim(id) <> ''),
  -- Deliberately no catalog FK: archived/unknown place IDs must survive imports
  -- and later catalog changes, without becoming searchable places or park credit.
  place_id text not null check (btrim(place_id) <> ''),
  visited_at timestamptz not null check (isfinite(visited_at)),
  note text not null default '',
  rating smallint not null default 0 check (rating between 0 and 5),
  created_at timestamptz not null default now() check (isfinite(created_at)),
  primary key (user_id, id)
);

create index travel_records_user_visited_idx
  on public.travel_records (user_id, visited_at desc, id);
create index travel_records_user_place_idx
  on public.travel_records (user_id, place_id);

-- Only metadata and private object paths, never image bytes or signed URLs.
-- Profile images are resolved by (user_id, kind); travel images by record/position.
create table public.photos (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null default gen_random_uuid()::text check (btrim(id) <> ''),
  kind text not null check (kind in ('travel', 'avatar', 'cover')),
  travel_record_id text,
  position smallint not null default 0,
  object_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, travel_record_id)
    references public.travel_records(user_id, id) on delete cascade,
  constraint photos_kind_record_check check (
    (kind = 'travel' and travel_record_id is not null and position between 0 and 4)
    or (kind in ('avatar', 'cover') and travel_record_id is null and position = 0)
  ),
  constraint photos_size_check check (
    size_bytes <= case when kind = 'travel' then 5 * 1024 * 1024 else 1024 * 1024 end
  ),
  constraint photos_owner_path_check check (
    object_path ~ ('^' || user_id::text || '/' ||
      case when kind = 'travel' then 'record-photos' else 'profile' end ||
      '/[a-zA-Z0-9_-]+[.](jpg|jpeg|png|webp)$')
  )
);

-- Five distinct slots enforce the per-record limit without a race-prone count
-- trigger. A revisit is another record and gets another five slots.
create unique index photos_record_position_idx
  on public.photos (user_id, travel_record_id, position) where kind = 'travel';
create index photos_record_fk_idx on public.photos (user_id, travel_record_id);
create unique index photos_profile_kind_idx
  on public.photos (user_id, kind) where kind in ('avatar', 'cover');

alter table public.profiles enable row level security;
alter table public.travel_records enable row level security;
alter table public.photos enable row level security;

-- Explicitly undo any project-wide automatic grants, including TRUNCATE,
-- REFERENCES and TRIGGER, which are not governed by row policies.
revoke all on table public.profiles, public.travel_records, public.photos
  from public, anon, authenticated;
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete
  on table public.profiles, public.travel_records, public.photos
  to authenticated, service_role;

create policy profiles_owner on public.profiles for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy travel_records_owner on public.travel_records for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy photos_owner on public.photos for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- The hosted project's existing event-trigger function already has a safe
-- search_path. Keep ensure_rls and its SECURITY DEFINER behavior, but remove
-- direct API execution (including the inherited PUBLIC default). Fresh local
-- databases may not have this optional dashboard-created function.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable()
      from public, anon, authenticated, service_role;
  end if;
end;
$$;
