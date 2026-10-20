import "server-only";
import { cache } from "react";
import { archivedPlaces } from "@/data/archived-places";
import { createPlaceCatalog } from "@/domain/place-catalog";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { loadPlaceCatalog } from "./place-catalog-source";

/** Share the same Supabase snapshot across a page and its metadata. */
export const getPlaceCatalog = cache(async () => {
  const places = await loadPlaceCatalog(getSupabaseConfig());
  return createPlaceCatalog(places, archivedPlaces);
});
