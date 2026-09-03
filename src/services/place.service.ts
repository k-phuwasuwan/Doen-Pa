import { mockPlaces } from "@/mocks/places";
import type { Place, PlaceType } from "@/types";

function matchesQuery(place: Place, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return [place.name, place.location, place.province, place.description]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export const placeService = {
  searchPlaces(query: string): Place[] {
    return mockPlaces.filter((place) => matchesQuery(place, query));
  },

  getPlaceById(id: string): Place | null {
    return mockPlaces.find((place) => place.id === id) ?? null;
  },

  filterByType(type: PlaceType | 'all'): Place[] {
    if (type === 'all') {
      return mockPlaces;
    }
    return mockPlaces.filter((place) => place.type === type);
  },

  getAll(): Place[] {
    return [...mockPlaces];
  },
};
