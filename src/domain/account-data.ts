import type { TravelRecord, User } from "../types";

export interface AccountData {
  user: User;
  records: Array<Omit<TravelRecord, "visitedAt" | "createdAt"> & { visitedAt: string; createdAt: string }>;
}
export const photoUrl = (userId: string, id: string) => `/api/photos/${encodeURIComponent(id)}?owner=${encodeURIComponent(userId)}`;

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid account data");
  return value as Record<string, unknown>;
}

function isPrivatePhoto(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/api/photos/");
}

function decodeUser(value: unknown, userId: string): User {
  const user = object(value);
  if (user.id !== userId || typeof user.name !== "string" || typeof user.username !== "string" ||
    (user.bio !== undefined && typeof user.bio !== "string") ||
    (user.avatar !== undefined && !isPrivatePhoto(user.avatar)) ||
    (user.coverImage !== undefined && !isPrivatePhoto(user.coverImage)) ||
    (user.needsProfileSetup !== undefined && typeof user.needsProfileSetup !== "boolean")) {
    throw new Error("Invalid account profile");
  }
  return { id: userId, name: user.name, username: user.username, bio: user.bio,
    avatar: user.avatar, coverImage: user.coverImage, needsProfileSetup: user.needsProfileSetup };
}

function decodeRecord(value: unknown, userId: string): TravelRecord {
  const record = object(value);
  if (record.userId !== userId || typeof record.id !== "string" || typeof record.placeId !== "string" ||
    typeof record.note !== "string" || typeof record.rating !== "number" ||
    !Number.isInteger(record.rating) || record.rating < 0 || record.rating > 5 ||
    !Array.isArray(record.photos) || !record.photos.every(isPrivatePhoto)) {
    throw new Error("Invalid travel record");
  }
  // Date(null) and Date(0) are valid JS dates, but invalid network timestamps.
  if (typeof record.visitedAt !== "string" || typeof record.createdAt !== "string") throw new Error("Invalid record date");
  const visitedAt = new Date(record.visitedAt);
  const createdAt = new Date(record.createdAt);
  if (!Number.isFinite(visitedAt.getTime()) || !Number.isFinite(createdAt.getTime())) throw new Error("Invalid record date");
  return { id: record.id, userId, placeId: record.placeId, note: record.note,
    rating: record.rating, photos: record.photos, visitedAt, createdAt };
}

/** Decode network snapshots before publishing them to personal views. */
export function decodeAccountData(value: unknown, userId: string): { user: User; records: TravelRecord[] } {
  const data = object(value);
  const user = decodeUser(data.user, userId);
  if (!Array.isArray(data.records)) throw new Error("Invalid account records");
  return { user, records: data.records.map((record: unknown) => decodeRecord(record, userId)) };
}
