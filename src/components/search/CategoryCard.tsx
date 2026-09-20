import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { PlaceType } from "@/types";

interface CategoryCardProps {
  label: string;
  type: PlaceType | "all";
  count: number;
  icon: LucideIcon;
  active?: boolean;
}

export function CategoryCard({ label, type, count, icon: Icon, active = false }: CategoryCardProps) {
  const query = type === "all" ? "" : `?type=${type}`;

  return (
    <Link
      href={`/search${query}`}
      scroll={false}
      className={`group relative flex min-w-36 flex-1 flex-col items-center gap-2 overflow-hidden rounded-3xl border bg-white/80 px-4 py-4 text-center shadow-glass transition-colors ${
        active ? "border-2 border-brand-500" : "border-white/90"
      }`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? "bg-brand-600 text-white shadow-glow" : "border border-white bg-white text-brand-800 shadow-sm"}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="font-semibold text-brand-800">{label}</span>
      <span className="text-sm text-brand-800/60">{count} {type === "all" ? "อุทยาน" : "แห่ง"}</span>
    </Link>
  );
}
