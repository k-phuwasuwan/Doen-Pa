"use client";

import { useMemo, type ReactNode } from "react";
import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import type { Place } from "@/types";
import { createPlaceCatalog } from "@/domain/place-catalog";
import { useSearchFilters } from "./useSearchFilters";
import { PlaceList } from "./PlaceList";
import { VisitedFilter } from "./VisitedFilter";

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="places-heading" className="text-xl font-bold text-brand-800">
            {query ? `ผลการค้นหา "${query}"` : "สถานที่แนะนำ"}
          </h2>
          <span className="text-sm text-brand-800/65">{visibleCards.length} แห่ง</span>
        </div>
        <VisitedFilter current={visited} />
      </div>
      <PlaceList cards={visibleCards} />
    </section>
  );
}
