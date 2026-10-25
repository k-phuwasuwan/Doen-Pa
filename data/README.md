# Place catalog

`national-parks-156.csv` is the editable source for the app's 156 national parks. It combines the supplied DNP address catalog, matched Thai tourism descriptions, and the reviewed altitude/distance enrichment. The imported values reflect the user's choices where sources disagree, including the 1,628 m Phu Chi Fa summit.

Missing descriptions and measurements remain empty. Components show `-`; the data does not substitute zero or sample values. Distance is stored as `n กม.`. Each distance represents the selected trail or walking segment, not the sum of every trail in a park.

The initial `type` classification uses the supplied names and descriptions to choose one dominant feature:

- `mountain`: mountains and inland forest parks — 98 parks.
- `waterfall`: waterfalls and waterfall-led forest attractions — 27 parks.
- `cave`: caves and cave-led karst attractions — 8 parks.
- `island`: islands, beaches and coastal/marine parks — 23 parks.

Parks may contain multiple features. These display categories are editable and are not official DNP park designations. They do not affect national park membership.

The running app reads the `places` table in Supabase. After editing the CSV, run `pnpm import:places` (Python 3) to validate it and regenerate the repeatable `supabase/seed.sql` import. Then apply the seed to update the database. Generating files alone does not update the app. The importer trims district/province whitespace, maps provinces to six regions and converts coordinates to numbers. Source CSV values are preserved. Run `pnpm import:places:check` to verify the seed is current; `--json` prints validated data for offline tests and benchmarks without writing an application catalog. See [Supabase catalog setup](../docs/places-backend.md). There is no local catalog fallback in the app.

Existing matched place IDs are retained. The two former Sam Roi Yot IDs resolve to one park so revisits do not inflate progress. Doi Luang Chiang Dao is outside the supplied catalog: its existing records stay readable through minimal history-only metadata, without measurements, map coordinates, new stamping, or national park credit. It is not added to Search.

## Park photos

Each park may have one freely licensed photo (Wikimedia Commons, CC BY / CC BY-SA / CC0 / public domain). The CSV carries five optional columns that are filled together or left empty: `image_path` (always `<id>.webp`), `image_author`, `image_license`, `image_license_url` and `image_source_url`. The resized files live in `public/images/parks/640/` and `public/images/parks/1280/`; the importer fails if a listed file is missing. Parks without a photo keep the topographic placeholder. Attribution is shown wherever a park photo is displayed.

Workflow: `node scripts/find-place-photos.mjs` searches candidates into `data/place-photos.json` (review it; set `"approved": false` to drop one) → `node scripts/build-place-photos.mjs` downloads and resizes the files → `python3 scripts/merge-place-photos.py` writes the columns into the CSV → `pnpm import:places` regenerates the seed. Search covers the national parks only; it never touches personal photos.
