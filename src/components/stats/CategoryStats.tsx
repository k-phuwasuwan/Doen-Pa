import { PLACE_TYPE_LABELS } from "@/domain/place-display";
import type { PlaceType, Stats } from "@/types";

interface CategoryStatsProps {
  stats: Stats;
}

const categories: { type: PlaceType; label: string }[] = [
  { type: "mountain", label: PLACE_TYPE_LABELS.mountain },
  { type: "waterfall", label: PLACE_TYPE_LABELS.waterfall },
  { type: "cave", label: PLACE_TYPE_LABELS.cave },
  { type: "island", label: "หมู่เกาะและทะเล" },
];

export function CategoryStats({ stats }: CategoryStatsProps) {
  return (
    <section className="liquid-glass-card p-5 sm:p-6" aria-labelledby="category-heading">
      <h2 id="category-heading" className="text-base font-bold text-brand-800 sm:text-lg">ประเภทสถานที่</h2>
      <div className="mt-4 space-y-4">
        {categories.map(({ type, label }) => {
          const visited = stats.byType[type];
          const total = stats.totalByType[type];
          const remaining = Math.max(0, total - visited);
          const progress = total > 0 ? Math.round((visited / total) * 100) : 0;

          return (
            <div key={type}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-brand-800">{label}</span>
                <span className="font-num shrink-0 text-brand-800/65">{visited}/{total} แห่ง</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-800/[0.08]" role="progressbar" aria-valuenow={visited} aria-valuemin={0} aria-valuemax={total} aria-label={`${label}ที่ไปเยือน`}>
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-brand-800/60">
                {total === 0 ? "ยังไม่มีสถานที่ประเภทนี้ในรายการ" : remaining === 0 ? `คุณไป${label}ครบแล้ว` : `ยังมี${label}อีก ${remaining} แห่งที่คุณยังไม่ได้ไป`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
