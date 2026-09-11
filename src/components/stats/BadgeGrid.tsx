import { Award, Check } from "lucide-react";
import type { Stats } from "@/types";

interface BadgeGridProps {
  stats: Stats;
}

const BADGE_TOTAL = 14;

export function BadgeGrid({ stats }: BadgeGridProps) {
  const earnedCount = Math.min(BADGE_TOTAL, stats.totalPlaces);

  return (
    <section className="card-glass p-6" aria-labelledby="badges-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="badges-heading" className="text-xl font-bold text-forest">ตราสะสม</h2>
          <p className="mt-1 text-sm text-slate">ปลดล็อกความสำเร็จจากการเดินทาง</p>
        </div>
        <span className="text-sm font-semibold text-gold">{earnedCount}/{BADGE_TOTAL}</span>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-3">
        {Array.from({ length: BADGE_TOTAL }, (_, index) => {
          const earned = index < earnedCount;
          return (
            <div key={index} className={`relative flex aspect-square items-center justify-center rounded-full border-2 ${earned ? "border-gold bg-gold/15 text-gold" : "border-beige/60 bg-beige/10 text-beige"}`} aria-label={earned ? `ตราที่ ${index + 1} ได้รับแล้ว` : `ตราที่ ${index + 1} ยังไม่ปลดล็อก`}>
              {earned ? <Check className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> : <Award className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
