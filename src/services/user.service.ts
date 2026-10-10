import { browserStorageAdapter, createLocalSnapshot } from "@/lib/storage/local-snapshot";
import type { User } from "@/types";

const STORAGE_KEY = "doen-pa-current-user-v2";
const USER_CHANGED_EVENT = "doen-pa-user-changed";
const DEFAULT_USER: User = {
  id: "local-user",
  name: "ผู้ใช้ใหม่",
  username: "new_hiker",
};

function readUser(snapshot: string): User {
  const fallback = DEFAULT_USER;
  if (!snapshot) return fallback;

  try {
    const saved: unknown = JSON.parse(snapshot);
    if (!saved || typeof saved !== "object") return fallback;
    const value = saved as Partial<User>;
    if (value.id !== fallback.id || typeof value.name !== "string" || typeof value.username !== "string") return fallback;
    return {
      ...fallback,
      name: value.name,
      username: value.username,
      bio: typeof value.bio === "string" ? value.bio : undefined,
      avatar: typeof value.avatar === "string" ? value.avatar : undefined,
      coverImage: typeof value.coverImage === "string" ? value.coverImage : undefined,
    };
  } catch {
    return fallback;
  }
}

const store = createLocalSnapshot(browserStorageAdapter(STORAGE_KEY, USER_CHANGED_EVENT), DEFAULT_USER, readUser);

export const userService = {
  getCurrentUser: store.getSnapshot,
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
  getServerSnapshot: store.getServerSnapshot,
  updateCurrentUser(changes: Pick<User, "name" | "username" | "bio" | "avatar" | "coverImage">): User {
    const updated = { ...store.getSnapshot(), ...changes };
    store.write(updated);
    return updated;
  },
};
