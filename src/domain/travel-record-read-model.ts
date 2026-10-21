import type { Place, Stats, TravelRecord } from "../types";
import { resolvePlaceId } from "../data/place-identities";

interface TravelRecordEntry {
  record: TravelRecord;
  place: Place;
}

export interface TravelPhoto {
  photo: string;
  place: Place;
  recordId: string;
  /** Position in this place's complete photo gallery, not within one record. */
  photoIndex: number;
}

interface PlaceMemory {
  records: TravelRecord[];
  photos: string[];
  mapPhoto: string | undefined;
}

const EMPTY_MEMORY: PlaceMemory = { records: [], photos: [], mapPhoto: undefined };

/** Read personal memories without storage or rendering dependencies. */
export function readTravelRecords(userId: string, records: readonly TravelRecord[], catalog: readonly Place[], archive: readonly Place[] = []) {
  // Archived places can resolve old memories without increasing active catalog totals.
  const catalogById = new Map([...archive, ...catalog].map((place) => [place.id, place]));
  const entries: TravelRecordEntry[] = [];
  const recordsByPlace = new Map<string, TravelRecord[]>();

  for (const record of records) {
    const place = catalogById.get(resolvePlaceId(record.placeId));
    if (record.userId !== userId || !place) continue;
    entries.push({ record, place });
    const group = recordsByPlace.get(place.id) ?? [];
    group.push(record);
    recordsByPlace.set(place.id, group);
  }

  const memories = new Map<string, PlaceMemory>();
  const mapPhotos = new Map<string, string | undefined>();
  let photos: TravelPhoto[] | undefined;

  function getMapPhoto(placeId: string): string | undefined {
    if (mapPhotos.has(placeId)) return mapPhotos.get(placeId);
    let latest: TravelRecord | undefined;
    for (const record of recordsByPlace.get(placeId) ?? []) {
      if (record.photos.length === 0) continue;
      // Strictly newer dates retain storage order when visit dates tie.
      if (!latest || record.visitedAt.getTime() > latest.visitedAt.getTime()) latest = record;
    }
    const photo = latest?.photos[0];
    mapPhotos.set(placeId, photo);
    return photo;
  }

  const visitedPlaces = [...recordsByPlace.keys()].flatMap((id) => {
    const place = catalogById.get(id);
    return place ? [place] : [];
  });
  const counts = {
    records: entries.length,
    places: visitedPlaces.length,
    provinces: new Set(visitedPlaces.map((place) => place.province)).size,
    photos: entries.reduce((total, { record }) => total + record.photos.length, 0),
  };
  let stats: Stats | undefined;

  return {
    /** Preserve storage order for Passport cards. */
    entries,
    counts,
    get photos(): TravelPhoto[] {
      if (photos) return photos;
      const photoCounts = new Map<string, number>();
      photos = entries
        .filter(({ record }) => record.photos.length > 0)
        .sort((a, b) => compareRecords(a.record, b.record))
        .flatMap(({ record, place }) => record.photos.map((photo) => {
          const photoIndex = photoCounts.get(place.id) ?? 0;
          photoCounts.set(place.id, photoIndex + 1);
          return { photo, place, recordId: record.id, photoIndex };
        }));
      return photos;
    },
    mapPlaces: visitedPlaces.filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)),
    getMapPhoto,
    getVisitCount(placeId: string): number {
      return recordsByPlace.get(placeId)?.length ?? 0;
    },
    getPlaceMemory(placeId: string): PlaceMemory {
      const cached = memories.get(placeId);
      if (cached) return cached;
      const group = recordsByPlace.get(placeId);
      if (!group) return EMPTY_MEMORY;
      const ordered = [...group].sort(compareRecords);
      const memory = { records: ordered, photos: ordered.flatMap((record) => record.photos), mapPhoto: getMapPhoto(placeId) };
      memories.set(placeId, memory);
      return memory;
    },
    getStats(): Stats {
      // Search and galleries do not need catalog progress calculations.
      return stats ??= calculateStats(catalog, visitedPlaces, counts);
    },
  };
}

function compareRecords(a: TravelRecord, b: TravelRecord): number {
  return b.visitedAt.getTime() - a.visitedAt.getTime() || b.createdAt.getTime() - a.createdAt.getTime();
}

function calculateStats(catalog: readonly Place[], visitedPlaces: Place[], counts: { places: number; provinces: number; photos: number }): Stats {
  const byType: Stats["byType"] = { mountain: 0, waterfall: 0, cave: 0, island: 0 };
  const totalByType: Stats["totalByType"] = { mountain: 0, waterfall: 0, cave: 0, island: 0 };
  const byRegion: Stats["byRegion"] = {
    north: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
    central: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
    south: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
    northeast: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
    east: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
    west: { count: 0, provinces: [], totalNationalParks: 0, visitedNationalParks: 0 },
  };
  const visitedIds = new Set(visitedPlaces.map((place) => place.id));
  let totalNationalParks = 0;
  let visitedNationalParks = 0;

  for (const place of catalog) {
    totalByType[place.type]++;
    const visited = visitedIds.has(place.id);
    const region = byRegion[place.region];
    if (place.isNationalPark) {
      totalNationalParks++;
      region.totalNationalParks++;
      if (visited) {
        visitedNationalParks++;
        region.visitedNationalParks++;
      }
    }
    // Preserve catalog order for region province labels.
    if (!visited) continue;
    byType[place.type]++;
    region.count++;
    if (!region.provinces.includes(place.province)) region.provinces.push(place.province);
  }
  return {
    totalPlaces: counts.places,
    totalProvinces: counts.provinces,
    totalPhotos: counts.photos,
    totalRegions: new Set(visitedPlaces.map((place) => place.region)).size,
    totalNationalParks,
    visitedNationalParks,
    byType,
    totalByType,
    byRegion,
  };
}

/** Share one model per immutable storage snapshot and user; old snapshots can be collected. */
export function createTravelRecordReader(catalog: readonly Place[], archive: readonly Place[] = []) {
  const snapshots = new WeakMap<readonly TravelRecord[], Map<string, ReturnType<typeof readTravelRecords>>>();
  return (userId: string, records: readonly TravelRecord[]) => {
    let users = snapshots.get(records);
    if (!users) {
      users = new Map();
      snapshots.set(records, users);
    }
    let model = users.get(userId);
    if (!model) {
      model = readTravelRecords(userId, records, catalog, archive);
      users.set(userId, model);
    }
    return model;
  };
}
