# Place catalog in Supabase

The app reads the `public.places` table on the server. Search, Place Details,
stamping, Passport, Map, Stats and Profile use the same per-request catalog
snapshot. `src/data/places.ts` has been removed. Profiles, travel records and
private photos persist in Supabase; see [Auth setup](supabase-setup.md) and
[private account data](private-data-backend.md).

## Hosted rollout status — 2026-10-20

The CLI is linked to the `doen-pa` project matching the app's configured
Supabase URL. Migration `20261020011436_create_places.sql` and the 156-place
seed have been applied. An anonymous Data API read using the app's publishable
key returned all 156 rows with every field matching the generated local catalog.
The `anon` and `authenticated` roles have SELECT access and no INSERT, UPDATE,
DELETE or TRUNCATE grants. Catalog reads now use Supabase throughout the app.

The two prior Security Advisor warnings about API execution of
`public.rls_auto_enable()` were resolved in the subsequent private-data
migration. The auto-RLS event trigger still works; see
[private account data](private-data-backend.md#existing-auto-rls-warning).

## Files and source of truth

- Edit `data/national-parks-156.csv` to change catalog data.
- Run `pnpm import:places` to regenerate `supabase/seed.sql` from validated input.
- Run `pnpm import:places:check` to detect a stale seed without writing.
- `python3 scripts/import-national-parks.py --json` supplies offline test and
  benchmark data directly from the CSV; no application catalog is generated.
- `supabase/migrations/20261020011436_create_places.sql` creates the table,
  constraints, grants and RLS policy. Applying the seed requires this migration.

The table follows the current `Place` interface, using `is_national_park` for
`isNationalPark`. IDs are **text**, preserving existing links and saved records.
Coordinates are nullable numbers; altitude and distance retain their reviewed
display strings (`1351 m`, `8 กม.`). Missing coordinates and measurements are
`NULL`; missing descriptions and locations remain empty strings. Zero is a real
value, never a placeholder. No personal data is imported. Optional park photos are imported as attribution columns (`image_path`, `image_author`, `image_license`, `image_license_url`, `image_source_url`, added by migration `20261025120000_place_photos.sql`); the resized files ship in `public/images/parks/`. Apply that migration before deploying the app version that reads these columns, otherwise catalog reads fail with `column places.image_path does not exist`.

The old Sam Roi Yot alias remains resolved by `src/data/place-identities.ts`.
History-only Chiang Dao metadata stays in `src/data/archived-places.ts`, outside
the searchable 156 parks and their statistics.

## Apply to a hosted project

Use Node 22+ and the project's pinned Supabase CLI. Authenticate in your own
terminal; do not put CLI tokens or database passwords in source files or chat.
If the CLI is already authenticated and linked to the intended project, skip
those setup steps.

```sh
pnpm exec supabase login
pnpm exec supabase link --project-ref YOUR_PROJECT_REF
pnpm import:places:check
pnpm exec supabase db push --linked --dry-run
pnpm exec supabase db push --linked
pnpm db:seed:places
```

Review the dry run: it should contain the new places migration. Stop and inspect
any unexpected migrations or an existing conflicting `public.places` table.
`db push` applies schema migrations; `db:seed:places` separately executes the
generated seed through the linked project's Management API. It requires an
authenticated CLI with permission to query that project's database.

Alternatively, use the intended project's Supabase SQL Editor: execute the
migration once, then execute `supabase/seed.sql` as an administrator. Keep using
the migration file as the schema history and reconcile CLI migration history
before switching deployment methods. Neither a publishable API key nor the
`.env.local` frontend settings authorize administrative imports.

The seed uses one transaction and `ON CONFLICT (id) DO UPDATE`. Repeating it
updates the CSV-managed fields for matching IDs without duplicates, replacing
place IDs, breaking record references, or deleting other places. CSV edits are
authoritative for those fields: reimport overwrites database edits to matching
rows. Removing a row from the CSV does **not** delete it from the database.

For a fresh local Supabase installation, the existing seed configuration points
to `supabase/seed.sql`; starting a new stack applies migrations and seed. Do not
reset an existing database just to import places.

## Verify the hosted rollout

Run these checks in SQL Editor or with `pnpm exec supabase db query --linked`:

```sql
-- On a new database, both counts should be 156.
select count(*) as places,
       count(*) filter (where is_national_park) as national_parks
from public.places;

select id, name, province, region
from public.places
where id in ('place-khao-yai', 'place-khao-sam-roi-yod');

-- Public callers can read the catalog without logging in.
begin;
set local role anon;
select count(*) from public.places;
rollback;
```

`anon` and `authenticated` have only SELECT permission and a SELECT-only RLS
policy. INSERT, UPDATE, DELETE and TRUNCATE are revoked, even if the project
automatically grants broad permissions to newly created tables. Trusted
administrators and the server-only `service_role` can import data; that role's
key must never appear in client code or `NEXT_PUBLIC_` variables.

Also verify an anonymous read through the project's Data API using its existing
publishable key, then run Supabase Security Advisors. Local tests cannot verify
hosted API exposure, project-specific grants or advisor results.

Reference: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
and [database seeds](https://supabase.com/docs/guides/local-development/seeding-your-database).

## Automated verification

`pnpm test` runs the migration and generated seed on an isolated, in-memory
Postgres engine through the test-only PGlite dependency. It checks all 156 rows
against the reviewed CSV, repeated imports with existing foreign-key references,
SQL text escaping, read/write grants, RLS enforcement and invalid data. No
hosted database, credentials, Docker or user's stored data are used.

## Runtime data flow

`src/services/place.service.ts` is server-only. React `cache` deduplicates the
catalog within a request, including Place Details metadata. The loader uses the
publishable key and the public Data API, with explicit columns, stable ID order,
a request timeout, runtime field validation and pagination. Reads use `no-store`
so new requests see database changes. No user session or administrative key is
needed to read this public catalog.

`CatalogContent` handles load errors and wraps successful content in
`PlaceCatalogProvider`. The provider shares one catalog-aware personal record
reader across client components; those components do not fetch the catalog or
import local place data. An empty table produces empty results and zero catalog
totals. An unavailable or invalid response produces a retry panel, preserving
local records and navigation. It is never presented as an empty Passport or
zero progress. Next.js control-flow exceptions are rethrown so dynamic rendering,
404s and redirects keep working.

Login, Profile editing and guest Passport/Stats/Profile previews do not need the
catalog. The small history-only archive and ID alias remain for saved memories;
they do not add searchable places or inflate national-park totals.

CSV and seed files remain deployment inputs. They are not read by the running
application. Updating the database takes effect on the next server request;
an already open page keeps its snapshot until navigation or reload.

Search receives the full catalog snapshot and server-rendered place cards,
including when its initial URL contains filters. Changes to `q`, `type` and
`visited` filter those cards in the browser and use native history updates,
without another Auth or catalog request. Back/Forward restores the filter
state; a reload or navigation into Search reads a fresh catalog snapshot.
