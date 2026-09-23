import { Map, Mountain, Camera } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { Stats } from "@/types";

interface StatsHeroProps {
  stats: Stats;
  journeyCount: number;
}

export function StatsHero({ stats, journeyCount }: StatsHeroProps) {
  return (
    <section className="liquid-glass-card p-6 sm:p-8" aria-labelledby="stats-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-800/65">ภาพรวมการเดินทาง</p>
          <h1 id="stats-heading" className="mt-2 text-3xl font-bold text-brand-800 sm:text-4xl">
            {journeyCount} การเดินทาง
          </h1>
          <p className="mt-2 text-brand-800/65">ทุกเส้นทางที่คุณบันทึกไว้ในแพสพอร์ต</p>
        </div>
        <div className="hidden rounded-full bg-amber-400/15 p-3 text-amber-400 sm:block">
          <Mountain className="h-7 w-7" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard value={stats.totalProvinces} label="จังหวัด" variant="yellow" />
        <StatCard value={stats.totalRegions} label="ภูมิภาค" variant="yellow" />
        <StatCard value={stats.totalPhotos} label="รูปภาพ" variant="yellow" />
      </div>
      <div className="mt-5 flex flex-wrap gap-4 text-sm text-brand-800/65">
        <span className="inline-flex items-center gap-2"><Map className="h-4 w-4 text-brand-800" aria-hidden="true" /> สำรวจทั่วประเทศ</span>
        <span className="inline-flex items-center gap-2"><Camera className="h-4 w-4 text-brand-800" aria-hidden="true" /> เก็บทุกความทรงจำ</span>
      </div>
    </section>
  );
}
