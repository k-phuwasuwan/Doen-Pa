-- Keep the existing text IDs: saved records and URLs already reference them.
create table public.places (
  id text primary key check (btrim(id) <> ''),
  name text not null check (btrim(name) <> ''),
  location text not null default '',
  province text not null check (btrim(province) <> ''),
  region text not null check (
    region in ('north', 'central', 'south', 'northeast', 'east', 'west')
  ),
  description text not null default '',
  type text not null check (type in ('mountain', 'waterfall', 'cave', 'island')),
  is_national_park boolean not null default false,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  altitude text check (altitude ~ '^[0-9]+([.][0-9]+)? m$'),
  distance text check (distance ~ '^[0-9]+([.][0-9]+)? กม[.]$')
);

alter table public.places enable row level security;

-- Explicit grants work even when automatic Data API grants are disabled.
-- Revoke Supabase's possible default write grants, including TRUNCATE.
revoke all on table public.places from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select on table public.places to anon, authenticated;

create policy "Anyone can read the place catalog"
  on public.places for select
  to anon, authenticated
  using (true);

-- Only trusted administrative imports may write; no client write policy.
grant select, insert, update on table public.places to service_role;
