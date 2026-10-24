"use client";

import { PLACE_TYPE_LABELS } from "@/domain/place-display";
import type { PlaceType } from "@/types";
import { CategoryCard } from "./CategoryCard";
import { useSearchFilters } from "./useSearchFilters";
import { indicatorStyle, useSlidingIndicator } from "@/components/navigation/useSlidingIndicator";
import { VisitedFilter } from "./VisitedFilter";

const categories: { label: string; type: PlaceType | "all" }[] = [
  { label: "ทั้งหมด", type: "all" },
  { label: PLACE_TYPE_LABELS.mountain, type: "mountain" },
  { label: PLACE_TYPE_LABELS.waterfall, type: "waterfall" },
  { label: PLACE_TYPE_LABELS.cave, type: "cave" },
  { label: PLACE_TYPE_LABELS.island, type: "island" },
];

/** Sticky filter rail: place types on the left, personal visit filter on the right. */
export function CategoryGrid() {
  const { type: currentType, query, visited } = useSearchFilters();
  const { containerRef, box } = useSlidingIndicator(currentType, "[aria-current='true']");
  return (
    <section aria-label="ตัวกรองสถานที่" className="sticky-filter-bar sticky z-30 mb-5">
      <div className="liquid-glass-capsule site-top-nav-surface flex items-center gap-2 overflow-x-auto overscroll-x-contain rounded-full p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ backdropFilter: "blur(28px) saturate(170%)", WebkitBackdropFilter: "blur(28px) saturate(170%)" }}>
        <div ref={containerRef} className="relative flex shrink-0 items-center gap-1" aria-label="ประเภทสถานที่">
          <span aria-hidden="true" className="nav-indicator pointer-events-none absolute left-0 top-0 rounded-full bg-gradient-to-r from-brand-600 to-emerald-700 shadow-glow-emerald" style={indicatorStyle(box)} />
          {categories.map((category) => (
            <CategoryCard
              key={category.type}
              {...category}
              active={currentType === category.type}
              query={query}
              visited={visited}
            />
          ))}
        </div>
        <span className="mx-1 h-7 w-px shrink-0 bg-brand-800/15" aria-hidden="true" />
        <VisitedFilter current={visited} />
      </div>
    </section>
  );
}
