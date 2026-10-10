/** Internal seam for browser storage and deterministic local test adapters. */
export interface StorageAdapter {
  read(): string | null;
  write(value: string): void;
  subscribe(listener: () => void): () => void;
}

export function createLocalSnapshot<T>(adapter: StorageAdapter, fallback: T, decode: (raw: string) => T) {
  let previousRaw: string | null | undefined;
  let snapshot = fallback;
  const listeners = new Set<() => void>();
  let unsubscribe: (() => void) | undefined;

  function getSnapshot(): T {
    let raw: string | null;
    try {
      raw = adapter.read();
    } catch {
      raw = null;
    }
    if (raw !== previousRaw) {
      previousRaw = raw;
      try {
        snapshot = raw ? decode(raw) : fallback;
      } catch {
        snapshot = fallback;
      }
    }
    return snapshot;
  }

  function notify() {
    for (const listener of listeners) listener();
  }

  return {
    getSnapshot,
    getServerSnapshot: () => fallback,
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      if (listeners.size === 1) unsubscribe = adapter.subscribe(notify);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          unsubscribe?.();
          unsubscribe = undefined;
        }
      };
    },
    write(value: T): void {
      // Failed serialization or writes must neither change the snapshot nor notify.
      adapter.write(JSON.stringify(value));
      getSnapshot();
      notify();
    },
  };
}

export function browserStorageAdapter(key: string, changedEvent: string): StorageAdapter {
  return {
    read: () => typeof window === "undefined" ? null : window.localStorage.getItem(key),
    write(value) {
      if (typeof window === "undefined") throw new Error("Local storage is only available in the browser");
      window.localStorage.setItem(key, value);
    },
    subscribe(listener) {
      if (typeof window === "undefined") return () => {};
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) listener();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(changedEvent, listener);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(changedEvent, listener);
      };
    },
  };
}
