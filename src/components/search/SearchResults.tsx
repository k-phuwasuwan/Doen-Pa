"use client";

import { useMemo, type ReactNode } from "react";
import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import type { Place } from "@/types";
import { createPlaceCatalog } from "@/domain/place-catalog";
import { useSearchFilters } from "./useSearchFilters";
import { PlaceList } from "./PlaceList";
import { PLACE_TYPE_LABELS } from "@/domain/place-display";

interface SearchResultsProps {
  places: Place[];
  cards: ReactNode[];
  userId: string;
}

export function SearchResults({ places, cards, userId }: SearchResultsProps) {
  const { query, type, visited } = useSearchFilters();
  const catalog = useMemo(() => createPlaceCatalog(places), [places]);
  const matchingIds = useMemo(() => new Set(catalog.search(query, type).map((place) => place.id)), [catalog, query, type]);
  const memories = useTravelRecordReadModel(userId);

  const visibleCards = cards.filter((_, index) => {
    const place = places[index];
    if (!matchingIds.has(place.id)) return false;
    if (visited === "all") return true;
    return (memories.getVisitCount(place.id) > 0) === (visited === "visited");
  });

  return (
    <section aria-labelledby="places-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3 px-1 sm:mb-4">
        <h2 id="places-heading" className="min-w-0 truncate text-lg font-bold text-brand-800 sm:text-xl">
          {query ? `ผลการค้นหา "${query}"` : type === "all" ? "สถานที่ทั้งหมด" : PLACE_TYPE_LABELS[type]}
        </h2>
        <span className="font-num shrink-0 text-sm text-brand-800/65">{visibleCards.length} แห่ง</span>
      </div>
      <PlaceList cards={visibleCards} />
    </section>
  );
}
