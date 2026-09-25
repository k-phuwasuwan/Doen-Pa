"use client";

import { useMemo, useSyncExternalStore } from "react";
import { userService } from "@/services/user.service";

export function useCurrentUser() {
  const snapshot = useSyncExternalStore(
    userService.subscribe,
    userService.getSnapshot,
    userService.getServerSnapshot,
  );

  return useMemo(() => userService.getUserFromSnapshot(snapshot), [snapshot]);
}
