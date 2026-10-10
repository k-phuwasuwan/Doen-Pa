import type { Place, Stats, TravelRecord } from "../types";

export interface TravelRecordEntry {
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

export interface PlaceMemory {
  records: TravelRecord[];
  photos: string[];
  mapPhoto: string | undefined;
}

const EMPTY_MEMORY: PlaceMemory = { records: [], photos: [], mapPhoto: undefined };

/** Read personal memories without storage or rendering dependencies. */
export function readTravelRecords(userId: string, records: readonly TravelRecord[], catalog: readonly Place[]) {
  const catalogById = new Map(catalog.map((place) => [place.id, place]));
  const entries: TravelRecordEntry[] = [];
  const recordsByPlace = new Map<string, TravelRecord[]>();

  for (const record of records) {
    const place = catalogById.get(record.placeId);
    if (record.userId !== userId || !place) continue;
    entries.push({ record, place });
    const group = recordsByPlace.get(place.id) ?? [];
    group.push(record);
    recordsByPlace.set(place.id, group);
  }

  const memories = new Map<string, PlaceMemory>();
  let photos: TravelPhoto[] | undefined;

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
      photos = [...entries]
        .sort((a, b) => compareRecords(a.record, b.record))
        .flatMap(({ record, place }) => record.photos.map((photo) => {
          const photoIndex = photoCounts.get(place.id) ?? 0;
          photoCounts.set(place.id, photoIndex + 1);
          return { photo, place, recordId: record.id, photoIndex };
        }));
      return photos;
    },
    mapPlaces: visitedPlaces.filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)),
    getVisitCount(placeId: string): number {
      return recordsByPlace.get(placeId)?.length ?? 0;
    },
    getPlaceMemory(placeId: string): PlaceMemory {
      const cached = memories.get(placeId);
      if (cached) return cached;
      const group = recordsByPlace.get(placeId);
      if (!group) return EMPTY_MEMORY;
      // The map historically breaks equal visit dates by storage order.
      const mapPhoto = [...group]
        .filter((record) => record.photos.length > 0)
        .sort((a, b) => b.visitedAt.getTime() - a.visitedAt.getTime())[0]?.photos[0];
      const ordered = [...group].sort(compareRecords);
      const memory = { records: ordered, photos: ordered.flatMap((record) => record.photos), mapPhoto };
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
    if (!place.isNationalPark) continue;
    totalNationalParks++;
    byRegion[place.region].totalNationalParks++;
    if (visitedIds.has(place.id)) {
      visitedNationalParks++;
      byRegion[place.region].visitedNationalParks++;
    }
  }
  // Preserve catalog order for region province labels.
  for (const place of catalog) {
    if (!visitedIds.has(place.id)) continue;
    byType[place.type]++;
    const region = byRegion[place.region];
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
export function createTravelRecordReader(catalog: readonly Place[]) {
  const snapshots = new WeakMap<readonly TravelRecord[], Map<string, ReturnType<typeof readTravelRecords>>>();
  return (userId: string, records: readonly TravelRecord[]) => {
    let users = snapshots.get(records);
    if (!users) {
      users = new Map();
      snapshots.set(records, users);
    }
    let model = users.get(userId);
    if (!model) {
      model = readTravelRecords(userId, records, catalog);
      users.set(userId, model);
    }
    return model;
  };
}
