import { browserStorageAdapter, createLocalSnapshot } from "@/lib/storage/local-snapshot";
import type { User } from "@/types";

const USER_CHANGED_EVENT = "doen-pa-user-changed";
export const GUEST_USER: User = {
  id: "",
  name: "ผู้ใช้ใหม่",
  username: "new_hiker",
};

function readUser(snapshot: string, fallback: User): User {
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

export function createUserService(account: User) {
  // Legacy v2 remains untouched for the later explicit import flow.
  const adapter = account.id ? browserStorageAdapter(`doen-pa-current-user-account-v1:${account.id}`, USER_CHANGED_EVENT) : {
    read: () => null,
    write: () => { throw new Error("Sign in before editing your profile"); },
    subscribe: () => () => {},
  };
  const store = createLocalSnapshot(adapter, account, (raw) => readUser(raw, account));
  return {
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
}
