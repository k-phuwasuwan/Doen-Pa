"use client";

import { useSearchParams } from "next/navigation";
import type { PlaceType } from "@/types";

export function useSearchFilters() {
  const params = useSearchParams();
  const value = params.get("type");
  const type: PlaceType | "all" = value === "mountain" || value === "waterfall" || value === "cave" || value === "island" ? value : "all";
  const visitValue = params.get("visited");
  const visited: "all" | "visited" | "unvisited" = visitValue === "visited" || visitValue === "unvisited" ? visitValue : "all";
  return { query: params.get("q") || "", type, visited };
}

/** Filter the current catalog snapshot without another server navigation. */
export function updateSearchFilter(key: "q" | "type" | "visited", value: string) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  if (url.href !== window.location.href) {
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
}
