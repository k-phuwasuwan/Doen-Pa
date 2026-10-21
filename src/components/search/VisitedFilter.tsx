"use client";

import { updateSearchFilter } from "./useSearchFilters";

interface VisitedFilterProps {
  current: "all" | "visited" | "unvisited";
}

export function VisitedFilter({ current }: VisitedFilterProps) {
  const select = (value: "all" | "visited" | "unvisited") => {
    updateSearchFilter("visited", value === "all" ? "" : value);
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="กรองตามประวัติการเดินทาง">
      {(["visited", "unvisited"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => select(current === value ? "all" : value)}
          aria-pressed={current === value}
          className={`min-h-11 min-w-11 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            current === value
              ? "bg-brand-600 text-white"
              : "bg-transparent text-brand-800/70 hover:bg-brand-100/50"
          }`}
        >
          {value === "visited" ? "เคยไปแล้ว" : "ยังไม่เคยไป"}
        </button>
      ))}
    </div>
  );
}
