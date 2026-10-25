import type { Place, PlaceImage, PlaceType, Region } from "../types";

const PAGE_SIZE = 500;
const REQUEST_TIMEOUT_MS = 10_000;
const COLUMNS = "id,name,location,province,region,description,type,is_national_park,latitude,longitude,altitude,distance,image_path,image_author,image_license,image_license_url,image_source_url";

function isPlaceType(value: unknown): value is PlaceType {
  return value === "mountain" || value === "waterfall" || value === "cave" || value === "island";
}

function isRegion(value: unknown): value is Region {
  return value === "north" || value === "central" || value === "south" ||
    value === "northeast" || value === "east" || value === "west";
}

function coordinate(value: unknown, limit: number): number | undefined {
  if (value === null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > limit) {
    throw new Error("Invalid place coordinates in catalog response");
  }
  return value;
}

function optionalText(value: unknown): string | undefined {
  if (value === null) return undefined;
  if (typeof value !== "string") throw new Error("Invalid place measurement in catalog response");
  return value;
}

function decodeImage(row: Record<string, unknown>): PlaceImage | undefined {
  if (row.image_path === null || row.image_path === undefined) return undefined;
  const { image_path: path, image_author: author, image_license: license, image_source_url: sourceUrl, image_license_url: licenseUrl } = row;
  if (typeof path !== "string" || typeof author !== "string" || typeof license !== "string" || typeof sourceUrl !== "string" ||
    (licenseUrl !== null && licenseUrl !== undefined && typeof licenseUrl !== "string")) {
    throw new Error("Invalid place image in catalog response");
  }
  return { path, author, license, sourceUrl, ...(licenseUrl ? { licenseUrl } : {}) };
}

export function decodePlace(value: unknown): Place {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid place in catalog response");
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim() ||
    typeof row.name !== "string" || !row.name.trim() ||
    typeof row.location !== "string" || typeof row.province !== "string" || !row.province.trim() ||
    typeof row.description !== "string" || !isPlaceType(row.type) || !isRegion(row.region) ||
    typeof row.is_national_park !== "boolean") {
    throw new Error("Invalid place fields in catalog response");
  }
  const image = decodeImage(row);
  return {
    id: row.id, name: row.name, location: row.location, province: row.province,
    region: row.region, description: row.description, type: row.type,
    isNationalPark: row.is_national_park,
    latitude: coordinate(row.latitude, 90), longitude: coordinate(row.longitude, 180),
    altitude: optionalText(row.altitude), distance: optionalText(row.distance),
    ...(image ? { image } : {}),
  };
}

/** Public catalog reads use the publishable key, independent of user sessions. */
export async function loadPlaceCatalog(
  config: { url: string; publishableKey: string },
  request: typeof fetch = fetch,
): Promise<Place[]> {
  const places: Place[] = [];
  const seen = new Set<string>();
  for (;;) {
    const endpoint = new URL("/rest/v1/places", config.url);
    endpoint.searchParams.set("select", COLUMNS);
    endpoint.searchParams.set("order", "id.asc");
    endpoint.searchParams.set("offset", String(places.length));
    endpoint.searchParams.set("limit", String(PAGE_SIZE));
    const response = await request(endpoint, {
      headers: { apikey: config.publishableKey, Prefer: "count=exact" },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Place catalog request failed (HTTP ${response.status})`);
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) throw new Error("Invalid place catalog response");
    for (const row of rows) {
      const place = decodePlace(row);
      if (seen.has(place.id)) throw new Error("Duplicate place ID in catalog response");
      seen.add(place.id);
      places.push(place);
    }
    // Use the actual page length so project row caps cannot truncate statistics.
    const total = response.headers.get("content-range")?.match(/\/(\d+)$/)?.[1];
    if (total !== undefined && places.length >= Number(total)) return places;
    if (rows.length === 0) {
      if (total !== undefined && places.length < Number(total)) throw new Error("Incomplete place catalog response");
      return places;
    }
  }
}
