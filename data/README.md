# Place catalog

`national-parks-156.csv` is the editable source for the app's 156 national parks. It combines the supplied DNP address catalog, matched Thai tourism descriptions, and the reviewed altitude/distance enrichment. The imported values reflect the user's choices where sources disagree, including the 1,628 m Phu Chi Fa summit.

Missing descriptions and measurements remain empty. Components show `-`; the data does not substitute zero or sample values. Distance is stored as `n กม.`. Each distance represents the selected trail or walking segment, not the sum of every trail in a park.

The initial `type` classification uses the supplied names and descriptions to choose one dominant feature:

- `mountain`: mountains and inland forest parks — 98 parks.
- `waterfall`: waterfalls and waterfall-led forest attractions — 27 parks.
- `cave`: caves and cave-led karst attractions — 8 parks.
- `island`: islands, beaches and coastal/marine parks — 23 parks.

Parks may contain multiple features. These display categories are editable and are not official DNP park designations. They do not affect national park membership.

After editing the CSV, run `pnpm import:places` (Python 3). The importer validates the source and generates the typed `src/data/places.ts` catalog used by the shared place service. It trims district/province whitespace for display and statistics, maps provinces to the app's six geographical regions, and converts coordinates to numbers. Source CSV values are preserved.

Existing matched place IDs are retained. The two former Sam Roi Yot IDs resolve to one park so revisits do not inflate progress. Doi Luang Chiang Dao is outside the supplied catalog: its existing records stay readable through minimal history-only metadata, without measurements, map coordinates, new stamping, or national park credit. It is not added to Search.
