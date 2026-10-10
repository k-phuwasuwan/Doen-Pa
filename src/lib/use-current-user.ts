"use client";

import { useSyncExternalStore } from "react";
import { userService } from "@/services/user.service";

export function useCurrentUser() {
  return useSyncExternalStore(
    userService.subscribe,
    userService.getSnapshot,
    userService.getServerSnapshot,
  );
}
