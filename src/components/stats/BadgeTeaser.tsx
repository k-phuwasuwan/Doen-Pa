import { Award } from "lucide-react";
import type { Stats } from "@/types";

interface BadgeTeaserProps {
  stats: Stats;
}

export function BadgeTeaser({ stats }: BadgeTeaserProps) {
  const target = 10;
  const progress = Math.min(100, Math.round((stats.totalPlaces / target) * 100));

  return (
    <section className="liquid-glass-card border-amber-400/60 p-6" aria-labelledby="next-badge-heading">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
          <Award className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-800/65">ตราถัดไปของคุณ</p>
          <h2 id="next-badge-heading" className="mt-1 text-xl font-bold text-brand-800">นักสำรวจเส้นทาง</h2>
          <p className="mt-1 text-sm text-brand-800/65">บันทึกให้ครบ {target} สถานที่</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm font-medium text-brand-800">
        <span>{stats.totalPlaces} / {target} สถานที่</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-beige-100/40" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="ความคืบหน้าตราถัดไป">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
