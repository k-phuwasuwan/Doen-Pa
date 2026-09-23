"use client";

import { useMemo, useSyncExternalStore } from "react";
import { travelRecordService } from "@/services/travel-record.service";

export function useTravelRecords(userId: string) {
  const snapshot = useSyncExternalStore(
    travelRecordService.subscribe,
    travelRecordService.getSnapshot,
    travelRecordService.getServerSnapshot,
  );

  return useMemo(
    () => travelRecordService.getRecordsFromSnapshot(snapshot).filter((record) => record.userId === userId),
    [snapshot, userId],
  );
}
