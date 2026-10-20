import { browserStorageAdapter, createLocalSnapshot } from "@/lib/storage/local-snapshot";
import type { TravelRecord } from "@/types";
import { resolvePlaceId } from "@/data/place-identities";

const STORAGE_KEY = "doen-pa-travel-records-v2";
const RECORDS_CHANGED_EVENT = "doen-pa-records-changed";

function parseRecords(raw: string | null): TravelRecord[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((value): TravelRecord[] => {
      if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
      const record = value as Record<string, unknown>;
      if (
        typeof record.id !== "string" ||
        typeof record.userId !== "string" ||
        typeof record.placeId !== "string" ||
        typeof record.note !== "string" ||
        !Array.isArray(record.photos) ||
        !record.photos.every((photo: unknown) => typeof photo === "string") ||
        typeof record.rating !== "number" ||
        !Number.isInteger(record.rating) ||
        record.rating < 0 || record.rating > 5 ||
        typeof record.visitedAt !== "string" ||
        typeof record.createdAt !== "string"
      ) return [];

      const visitedAt = new Date(record.visitedAt);
      const createdAt = new Date(record.createdAt);
      if (Number.isNaN(visitedAt.getTime()) || Number.isNaN(createdAt.getTime())) return [];
      return [{
        id: record.id,
        userId: record.userId,
        placeId: resolvePlaceId(record.placeId),
        note: record.note,
        photos: record.photos as string[],
        rating: record.rating,
        visitedAt,
        createdAt,
      }];
    });
  } catch {
    return [];
  }
}

const store = createLocalSnapshot<TravelRecord[]>(
  browserStorageAdapter(STORAGE_KEY, RECORDS_CHANGED_EVENT), [], parseRecords,
);
export const travelRecordService = {
  subscribe: store.subscribe,
  // Resolve place IDs in the read model using its server-provided catalog.
  getSnapshot: store.getSnapshot,
  getServerSnapshot: store.getServerSnapshot,

  createRecord(record: Omit<TravelRecord, "id" | "createdAt">): TravelRecord {
    const records = store.getSnapshot();
    const newRecord: TravelRecord = {
      ...record,
      id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    store.write([...records, newRecord]);

    return newRecord;
  },

  deleteRecord(recordId: string): void {
    const records = store.getSnapshot();
    const filtered = records.filter((record) => record.id !== recordId);
    store.write(filtered);
  },
};
