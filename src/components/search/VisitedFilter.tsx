"use client";

import { useRouter } from "next/navigation";
import type { PlaceType } from "@/types";

interface VisitedFilterProps {
  current: "all" | "visited" | "unvisited";
  query: string;
  type: PlaceType | "all";
}

export function VisitedFilter({ current, query, type }: VisitedFilterProps) {
  const router = useRouter();

  const select = (value: "all" | "visited" | "unvisited") => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type !== "all") params.set("type", type);
    if (value !== "all") params.set("visited", value);
    router.push(`/search${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="กรองตามประวัติการเดินทาง">
      {(["visited", "unvisited"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => select(current === value ? "all" : value)}
          aria-pressed={current === value}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            current === value
              ? "bg-brand-600 text-white shadow-glow-emerald"
              : "bg-transparent text-brand-800/70 hover:bg-brand-100/50"
          }`}
        >
          {value === "visited" ? "เคยไปแล้ว" : "ยังไม่เคยไป"}
        </button>
      ))}
    </div>
  );
}
