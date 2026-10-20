"use client";

import { useSyncExternalStore } from "react";
import { useCatalogReader } from "@/components/place/PlaceCatalogProvider";
import { useAuth } from "@/components/auth/AuthProvider";

export function useTravelRecordReadModel(userId: string) {
  const readSnapshot = useCatalogReader();
  const { records } = useAuth();
  const snapshot = useSyncExternalStore(
    records.subscribe,
    records.getSnapshot,
    records.getServerSnapshot,
  );
  return readSnapshot(userId, snapshot);
}
