import { resolvePlaceId } from "../data/place-identities";
import type { Place, PlaceType } from "../types";

/** Query one catalog snapshot without depending on storage or the network. */
export function createPlaceCatalog(places: Place[], archive: Place[] = []) {
  const catalogById = new Map(places.map((place) => [place.id, place]));
  const archiveById = new Map(archive.map((place) => [place.id, place]));
  return {
    places,
    search(query: string, type: PlaceType | "all" = "all") {
      const normalized = query.trim().toLowerCase();
      return places.filter((place) =>
        (type === "all" || place.type === type) &&
        (!normalized || [place.name, place.location, place.province, place.region, place.description]
          .join(" ").toLowerCase().includes(normalized)),
      );
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
