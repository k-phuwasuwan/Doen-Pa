"use client";

import { indicatorStyle, useSlidingIndicator } from "@/components/navigation/useSlidingIndicator";
import { updateSearchFilter } from "./useSearchFilters";

interface VisitedFilterProps {
  current: "all" | "visited" | "unvisited";
}

export function VisitedFilter({ current }: VisitedFilterProps) {
  const { containerRef, box } = useSlidingIndicator(current, "[aria-pressed='true']");
  const select = (value: "all" | "visited" | "unvisited") => {
    updateSearchFilter("visited", value === "all" ? "" : value);
  };

  return (
    <div ref={containerRef} className="relative flex shrink-0 items-center gap-1" role="group" aria-label="กรองตามประวัติการเดินทาง">
      <span aria-hidden="true" className="nav-indicator pointer-events-none absolute left-0 top-0 rounded-full bg-lichen" style={indicatorStyle(box)} />
      {(["visited", "unvisited"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => select(current === value ? "all" : value)}
          aria-pressed={current === value}
          className={`relative z-10 min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
            current === value
              ? "text-brand-900"
              : "text-brand-800/75 hover:bg-white/80"
          }`}
        >
          {value === "visited" ? "เคยไปแล้ว" : "ยังไม่เคยไป"}
        </button>
      ))}
    </div>
  );
}
