"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useTravelRecords } from "@/lib/use-travel-records";
import type { Place, PlaceType } from "@/types";
import { PlaceList } from "./PlaceList";
import { VisitedFilter } from "./VisitedFilter";
import { CATEGORY_SCROLL_KEY } from "./CategoryFilterLink";

interface SearchResultsProps {
  places: Place[];
  cards: ReactNode[];
  userId: string;
  query: string;
  type: PlaceType | "all";
  visited: "all" | "visited" | "unvisited";
}

export function SearchResults({ places, cards, userId, query, type, visited }: SearchResultsProps) {
  const records = useTravelRecords(userId);
  const visitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const record of records) {
      counts[record.placeId] = (counts[record.placeId] ?? 0) + 1;
    }
    return counts;
  }, [records]);

  const visibleCards = cards.filter((_, index) => {
    const place = places[index];
    const hasVisited = (visitCounts[place.id] ?? 0) > 0;
    return visited === "all" || (visited === "visited" ? hasVisited : !hasVisited);
  });

  useEffect(() => {
    if (sessionStorage.getItem(CATEGORY_SCROLL_KEY) !== "true") return;
    sessionStorage.removeItem(CATEGORY_SCROLL_KEY);
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    requestAnimationFrame(() => {
      document.getElementById("search-place-list")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
    });
  }, [query, type, visited]);

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
