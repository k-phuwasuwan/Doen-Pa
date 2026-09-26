import { StatCard } from "@/components/ui/StatCard";
import type { Stats } from "@/types";

interface StatsHeroProps {
  stats: Stats;
  journeyCount: number;
}

export function StatsHero({ stats, journeyCount }: StatsHeroProps) {
  return (
    <section className="liquid-glass-card p-6 sm:p-8" aria-labelledby="stats-heading">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-brand-800/65">ภาพรวมการเดินทาง</p>
        <h1 id="stats-heading" className="mt-2 text-3xl font-bold text-brand-800 sm:text-4xl">
          {journeyCount} การเดินทาง
        </h1>
        <p className="mt-2 text-brand-800/65">ทุกเส้นทางที่คุณบันทึกไว้ในแพสพอร์ต</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard value={stats.totalProvinces} label="จังหวัด" variant="yellow" />
        <StatCard value={stats.totalRegions} label="ภูมิภาค" variant="yellow" />
        <StatCard value={stats.totalPhotos} label="รูปภาพ" variant="yellow" />
      </div>
    </section>
  );
}
