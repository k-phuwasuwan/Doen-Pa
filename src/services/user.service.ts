import type { User } from "@/types";

const STORAGE_KEY = "doen-pa-current-user-v2";
const USER_CHANGED_EVENT = "doen-pa-user-changed";
const SERVER_SNAPSHOT = "__server_snapshot__";
const DEFAULT_USER: User = {
  id: "local-user",
  name: "ผู้ใช้ใหม่",
  username: "new_hiker",
};

function readUser(snapshot: string): User {
  const fallback = DEFAULT_USER;
  if (!snapshot || snapshot === SERVER_SNAPSHOT) return fallback;

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

export const userService = {
  getCurrentUser(): User {
    return readUser(typeof window === "undefined" ? SERVER_SNAPSHOT : this.getSnapshot());
  },

  getUserById(id: string): User | null {
    return id === DEFAULT_USER.id ? this.getCurrentUser() : null;
  },

  subscribe(listener: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(USER_CHANGED_EVENT, listener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(USER_CHANGED_EVENT, listener);
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

  getUserFromSnapshot(snapshot: string): User {
    return readUser(snapshot);
  },

  updateCurrentUser(changes: Pick<User, "name" | "username" | "bio" | "avatar" | "coverImage">): User {
    const updated = { ...this.getCurrentUser(), ...changes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(USER_CHANGED_EVENT));
    return updated;
  },
};
