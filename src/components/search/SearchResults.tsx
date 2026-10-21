"use client";

import type { ReactNode } from "react";
import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import type { Place, PlaceType } from "@/types";
import { PlaceList } from "./PlaceList";
import { VisitedFilter } from "./VisitedFilter";

interface SearchResultsProps {
  places: Place[];
  cards: ReactNode[];
  userId: string;
  query: string;
  type: PlaceType | "all";
  visited: "all" | "visited" | "unvisited";
}

export function SearchResults({ places, cards, userId, query, type, visited }: SearchResultsProps) {
  const memories = useTravelRecordReadModel(userId);

  const visibleCards = cards.filter((_, index) => {
    const place = places[index];
    const hasVisited = memories.getVisitCount(place.id) > 0;
    return visited === "all" || (visited === "visited" ? hasVisited : !hasVisited);
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
        <VisitedFilter current={visited} query={query} type={type} />
      </div>
      <PlaceList cards={visibleCards} />
    </section>
  );
}
