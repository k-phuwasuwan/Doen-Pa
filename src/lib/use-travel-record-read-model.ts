"use client";

import { useSyncExternalStore } from "react";
import { useCatalogReader } from "@/components/place/PlaceCatalogProvider";
import { travelRecordService } from "@/services/travel-record.service";

export function useTravelRecordReadModel(userId: string) {
  const readSnapshot = useCatalogReader();
  const snapshot = useSyncExternalStore(
    travelRecordService.subscribe,
    travelRecordService.getSnapshot,
    travelRecordService.getServerSnapshot,
  );
  return readSnapshot(userId, snapshot);
}
