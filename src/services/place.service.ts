import { places } from "@/data/places";
import { archivedPlaces } from "@/data/archived-places";
import { resolvePlaceId } from "@/data/place-identities";
import type { Place, PlaceType } from "@/types";

const catalogById = new Map(places.map((place) => [place.id, place]));
const archiveById = new Map(archivedPlaces.map((place) => [place.id, place]));

function matchesQuery(place: Place, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return [place.name, place.location, place.province, place.region, place.description]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function matchesType(place: Place, type: PlaceType | "all"): boolean {
  if (type === "all") return true;
  return place.type === type;
}

export const placeService = {
  searchPlaces(query: string): Place[] {
    return places.filter((place) => matchesQuery(place, query));
  },

  getPlaceById(id: string): Place | null {
    const canonicalId = resolvePlaceId(id);
    return catalogById.get(canonicalId) ?? archiveById.get(canonicalId) ?? null;
  },

  isCatalogPlace(id: string): boolean {
    return catalogById.has(resolvePlaceId(id));
  },

  getArchivedPlaces(): Place[] {
    return [...archivedPlaces];
  },

  filterByType(type: PlaceType | "all"): Place[] {
    return places.filter((place) => matchesType(place, type));
  },

  matchesType(place: Place, type: PlaceType | "all"): boolean {
    return matchesType(place, type);
  },

  getAll(): Place[] {
    return [...places];
  },

  getNationalParks(): Place[] {
    return places.filter((place) => place.isNationalPark === true);
  },
};
