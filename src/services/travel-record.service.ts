import { mockTravelRecords } from "@/mocks/travel-records";
import { placeService } from "@/services/place.service";
import type { TravelRecord } from "@/types";

const STORAGE_KEY = "doen-pa-travel-records";
const RECORDS_CHANGED_EVENT = "doen-pa-records-changed";
const SERVER_SNAPSHOT = "__server_snapshot__";

function getMockRecords(): TravelRecord[] {
  return mockTravelRecords.map((record) => ({ ...record, photos: [...record.photos] }));
}

function parseRecords(raw: string | null): TravelRecord[] {
  if (!raw) return getMockRecords();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getMockRecords();
    return parsed.map((record: TravelRecord) => ({
      ...record,
      visitedAt: new Date(record.visitedAt),
      createdAt: new Date(record.createdAt),
    }));
  } catch (error) {
    console.error("Failed to parse travel records from storage:", error);
    return getMockRecords();
  }
}

function getStorageRecords(): TravelRecord[] {
  if (typeof window === "undefined") return mockTravelRecords;
  return parseRecords(travelRecordService.getSnapshot());
}

function getVisibleRecords(records: TravelRecord[]): TravelRecord[] {
  return records.filter((record) => placeService.getPlaceById(record.placeId) !== null);
}

function setStorageRecords(records: TravelRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(RECORDS_CHANGED_EVENT));
}

export const travelRecordService = {
  subscribe(listener: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(RECORDS_CHANGED_EVENT, listener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(RECORDS_CHANGED_EVENT, listener);
    };
  },

  getSnapshot(): string {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  },

  getServerSnapshot(): string {
    return SERVER_SNAPSHOT;
  },

  getRecordsFromSnapshot(snapshot: string): TravelRecord[] {
    return getVisibleRecords(snapshot === SERVER_SNAPSHOT ? mockTravelRecords : parseRecords(snapshot));
  },

  getRecordsByUser(userId: string): TravelRecord[] {
    const records = getStorageRecords();
    return getVisibleRecords(records).filter((record) => record.userId === userId);
  },

  getRecordByPlace(userId: string, placeId: string): TravelRecord | null {
    const records = getVisibleRecords(getStorageRecords());
    return (
      records.find(
        (record) => record.userId === userId && record.placeId === placeId,
      ) ?? null
    );
  },

  getVisitCount(userId: string, placeId: string): number {
    return getVisibleRecords(getStorageRecords()).filter(
      (record) => record.userId === userId && record.placeId === placeId,
    ).length;
  },

  createRecord(record: Omit<TravelRecord, "id" | "createdAt">): TravelRecord {
    const records = getStorageRecords();
    const newRecord: TravelRecord = {
      ...record,
      id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    records.push(newRecord);
    setStorageRecords(records);

    return newRecord;
  },

  deleteRecord(recordId: string): void {
    const records = getStorageRecords();
    const filtered = records.filter((record) => record.id !== recordId);
    setStorageRecords(filtered);
  },
};
