import { mockTravelRecords } from "@/mocks/travel-records";
import type { TravelRecord } from "@/types";

const STORAGE_KEY = "doen-pa-travel-records";

function getStorageRecords(): TravelRecord[] {
  if (typeof window === "undefined") return mockTravelRecords;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((record: Record<string, unknown>) => ({
        ...record,
        visitedAt: new Date(record.visitedAt as string),
        createdAt: new Date(record.createdAt as string),
      })) as TravelRecord[];
    }
  } catch (error) {
    console.error("Failed to parse travel records from storage:", error);
  }

  return mockTravelRecords;
}

function setStorageRecords(records: TravelRecord[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to save travel records to storage:", error);
  }
}

export const travelRecordService = {
  getRecordsByUser(userId: string): TravelRecord[] {
    const records = getStorageRecords();
    return records.filter((record) => record.userId === userId);
  },

  getRecordByPlace(userId: string, placeId: string): TravelRecord | null {
    const records = getStorageRecords();
    return (
      records.find(
        (record) => record.userId === userId && record.placeId === placeId,
      ) ?? null
    );
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
