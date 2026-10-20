"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { archivedPlaces } from "@/data/archived-places";
import { createTravelRecordReader } from "@/domain/travel-record-read-model";
import type { Place } from "@/types";

const CatalogReaderContext = createContext<ReturnType<typeof createTravelRecordReader> | null>(null);

export function PlaceCatalogProvider({ places, children }: { places: Place[]; children: ReactNode }) {
  const reader = useMemo(() => createTravelRecordReader(places, archivedPlaces), [places]);
  return <CatalogReaderContext.Provider value={reader}>{children}</CatalogReaderContext.Provider>;
}

export function useCatalogReader() {
  const reader = useContext(CatalogReaderContext);
  if (!reader) throw new Error("Personal place views must be inside PlaceCatalogProvider");
  return reader;
}
