"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export function useCurrentUser() {
  const { profile } = useAuth();
  return useSyncExternalStore(
    profile.subscribe,
    profile.getSnapshot,
    profile.getServerSnapshot,
  );
}
