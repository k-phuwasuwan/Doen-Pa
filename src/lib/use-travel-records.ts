"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export function useTravelRecords(userId: string) {
  const { records } = useAuth();
  const snapshot = useSyncExternalStore(
    records.subscribe,
    records.getSnapshot,
    records.getServerSnapshot,
  );

  return useMemo(
    () => snapshot.filter((record) => record.userId === userId),
    [snapshot, userId],
  );
}
