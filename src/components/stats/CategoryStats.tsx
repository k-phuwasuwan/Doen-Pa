import { Mountain, Waves, Castle, Palmtree, TreePine } from "lucide-react";
import type { PlaceType, Stats } from "@/types";

interface CategoryStatsProps {
  stats: Stats;
}

const categories: { type: PlaceType; label: string; icon: typeof Mountain }[] = [
  { type: "mountain", label: "ภูเขา", icon: Mountain },
  { type: "waterfall", label: "น้ำตก", icon: Waves },
  { type: "cave", label: "ถ้ำ", icon: Castle },
  { type: "island", label: "หมู่เกาะและทะเล", icon: Palmtree },
  { type: "national_park", label: "อุทยานแห่งชาติ", icon: TreePine },
];

export function CategoryStats({ stats }: CategoryStatsProps) {
  return (
    <section className="liquid-glass-card p-6" aria-labelledby="category-heading">
      <h2 id="category-heading" className="text-xl font-bold text-brand-800">ประเภทสถานที่</h2>
      <div className="mt-5 space-y-5">
        {categories.map(({ type, label, icon: Icon }) => {
          const visited = type === "national_park" ? stats.visitedNationalParks : stats.byType[type];
          const total = type === "national_park" ? stats.totalNationalParks : stats.totalByType[type];
          const remaining = Math.max(0, total - visited);
          const progress = total > 0 ? Math.round((visited / total) * 100) : 0;

          return (
            <div key={type}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-brand-800">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </span>
                <span className="shrink-0 text-brand-800/65">{visited}/{total} แห่ง</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-beige-100/40" role="progressbar" aria-valuenow={visited} aria-valuemin={0} aria-valuemax={total} aria-label={`${label}ที่ไปเยือน`}>
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-brand-800/65">
                {total === 0 ? "ยังไม่มีสถานที่ประเภทนี้ในรายการ" : remaining === 0 ? `คุณไป${label}ครบแล้ว` : `ยังมี${label}อีก ${remaining} แห่งที่คุณยังไม่ได้ไป`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
