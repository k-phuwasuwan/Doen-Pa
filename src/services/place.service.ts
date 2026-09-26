import { mockPlaces } from "@/mocks/places";
import type { Place, PlaceType } from "@/types";

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
  if (type === "national_park") return place.type === "national_park" || place.isNationalPark === true;
  return place.type === type;
}

export const placeService = {
  searchPlaces(query: string): Place[] {
    return mockPlaces.filter((place) => matchesQuery(place, query));
  },

  getPlaceById(id: string): Place | null {
    return mockPlaces.find((place) => place.id === id) ?? null;
  },

  filterByType(type: PlaceType | "all"): Place[] {
    return mockPlaces.filter((place) => matchesType(place, type));
  },

  matchesType(place: Place, type: PlaceType | "all"): boolean {
    return matchesType(place, type);
  },

  getAll(): Place[] {
    return [...mockPlaces];
  },

  getNationalParks(): Place[] {
    return mockPlaces.filter((place) => matchesType(place, "national_park"));
  },
};
