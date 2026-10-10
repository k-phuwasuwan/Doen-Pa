"use client";

import { useSyncExternalStore } from "react";
import { createTravelRecordReader } from "@/domain/travel-record-read-model";
import { placeService } from "@/services/place.service";
import { travelRecordService } from "@/services/travel-record.service";

const readSnapshot = createTravelRecordReader(placeService.getAll());

export function useTravelRecordReadModel(userId: string) {
  const snapshot = useSyncExternalStore(
    travelRecordService.subscribe,
    travelRecordService.getSnapshot,
    travelRecordService.getServerSnapshot,
  );
  return readSnapshot(userId, snapshot);
}
