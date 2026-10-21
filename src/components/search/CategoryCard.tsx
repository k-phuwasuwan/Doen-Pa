import type { PlaceType } from "@/types";
import Link from "next/link";

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
      aria-current={active ? "true" : undefined}
      className={`group relative flex min-h-16 min-w-36 shrink-0 items-center justify-center overflow-hidden rounded-3xl border bg-white/80 px-3 py-3 text-center shadow-glass transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
        active ? "border-2 border-brand-500" : "border-white/90"
      }`}
    >
      <span className="font-semibold text-brand-800">{label}</span>
    </Link>
  );
}
