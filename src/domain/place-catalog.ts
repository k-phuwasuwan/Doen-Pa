import { resolvePlaceId } from "../data/place-identities";
import type { Place, PlaceType } from "../types";

/** Query one catalog snapshot without depending on storage or the network. */
export function createPlaceCatalog(places: Place[], archive: Place[] = []) {
  const catalogById = new Map(places.map((place) => [place.id, place]));
  const archiveById = new Map(archive.map((place) => [place.id, place]));
  // Catalog snapshots are immutable; normalize text once, not per keystroke.
  const searchIndex = places.map((place) => ({
    place,
    text: [place.name, place.location, place.province, place.region, place.description].join(" ").toLowerCase(),
  }));
  return {
    places,
    search(query: string, type: PlaceType | "all" = "all") {
      const normalized = query.trim().toLowerCase();
      const matches: Place[] = [];
      for (const { place, text } of searchIndex) {
        if (type !== "all" && place.type !== type) continue;
        if (normalized && !text.includes(normalized)) continue;
        matches.push(place);
      }
      return matches;
    },
    getById(id: string): Place | null {
      const canonicalId = resolvePlaceId(id);
      return catalogById.get(canonicalId) ?? archiveById.get(canonicalId) ?? null;
    },
    isCatalogPlace(id: string) {
      return catalogById.has(resolvePlaceId(id));
    },
  };
}
