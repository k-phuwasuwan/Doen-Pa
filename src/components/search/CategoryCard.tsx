"use client";

import type { PlaceType } from "@/types";
import Link from "next/link";
import { PlaceTypeIcon } from "@/components/ui/PlaceTypeIcon";
import { updateSearchFilter } from "./useSearchFilters";

interface CategoryCardProps {
  label: string;
  type: PlaceType | "all";
  active?: boolean;
  query?: string;
  visited?: "all" | "visited" | "unvisited";
}

export function CategoryCard({ label, type, active = false, query = "", visited = "all" }: CategoryCardProps) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type !== "all") params.set("type", type);
  if (visited !== "all") params.set("visited", visited);

  return (
    <Link
      href={`/search${params.size ? `?${params.toString()}` : ""}`}
      scroll={false}
      prefetch={false}
      onNavigate={(event) => {
        event.preventDefault();
        updateSearchFilter("type", type === "all" ? "" : type);
      }}
      aria-current={active ? "true" : undefined}
      className={`relative z-10 inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
        active ? "text-white" : "text-brand-800 hover:bg-white/80"
      }`}
    >
      {type !== "all" && <PlaceTypeIcon type={type} className="h-[18px] w-[18px]" />}
      {label}
    </Link>
  );
}
