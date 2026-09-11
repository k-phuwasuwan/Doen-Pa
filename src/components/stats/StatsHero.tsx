import { Map, Mountain, Camera } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { Stats } from "@/types";

interface StatsHeroProps {
  stats: Stats;
}

export function StatsHero({ stats }: StatsHeroProps) {
  return (
    <section className="card-glass p-6 sm:p-8" aria-labelledby="stats-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate">ภาพรวมการเดินทาง</p>
          <h1 id="stats-heading" className="mt-2 text-3xl font-bold text-forest sm:text-4xl">
            {stats.totalPlaces} การเดินทาง
          </h1>
          <p className="mt-2 text-slate">ทุกเส้นทางที่คุณบันทึกไว้ในแพสพอร์ต</p>
        </div>
        <div className="hidden rounded-full bg-gold/15 p-3 text-gold sm:block">
          <Mountain className="h-7 w-7" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard value={stats.totalProvinces} label="จังหวัด" variant="yellow" />
        <StatCard value={stats.totalRegions} label="ภูมิภาค" variant="yellow" />
        <StatCard value={stats.totalPhotos} label="รูปภาพ" variant="yellow" />
      </div>
      <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate">
        <span className="inline-flex items-center gap-2"><Map className="h-4 w-4 text-forest" aria-hidden="true" /> สำรวจทั่วประเทศ</span>
        <span className="inline-flex items-center gap-2"><Camera className="h-4 w-4 text-forest" aria-hidden="true" /> เก็บทุกความทรงจำ</span>
      </div>
    </section>
  );
}
