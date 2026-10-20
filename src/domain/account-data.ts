import type { TravelRecord, User } from "../types";

export interface AccountData {
  user: User;
  records: Array<Omit<TravelRecord, "visitedAt" | "createdAt"> & { visitedAt: string; createdAt: string }>;
}
export const photoUrl = (userId: string, id: string) => `/api/photos/${encodeURIComponent(id)}?owner=${encodeURIComponent(userId)}`;

/** Decode network snapshots before publishing them to personal views. */
export function decodeAccountData(value: unknown, userId: string): { user: User; records: TravelRecord[] } {
  if (!value || typeof value !== "object") throw new Error("Invalid account data");
  const { user, records } = value as Partial<AccountData>;
  if (!user || user.id !== userId || typeof user.name !== "string" || typeof user.username !== "string" || !Array.isArray(records)) throw new Error("Invalid account data");
  const decoded = records.map((record) => {
    if (!record || record.userId !== userId || typeof record.id !== "string" || typeof record.placeId !== "string" || typeof record.note !== "string" || !Number.isInteger(record.rating) || record.rating < 0 || record.rating > 5 || !Array.isArray(record.photos) || !record.photos.every((p) => typeof p === "string" && p.startsWith("/api/photos/"))) throw new Error("Invalid travel record");
    const visitedAt = new Date(record.visitedAt), createdAt = new Date(record.createdAt);
    if (!Number.isFinite(visitedAt.getTime()) || !Number.isFinite(createdAt.getTime())) throw new Error("Invalid record date");
    return { ...record, visitedAt, createdAt };
  });
  return { user, records: decoded };
}
