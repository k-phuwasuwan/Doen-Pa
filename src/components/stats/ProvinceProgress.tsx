import type { Stats } from "@/types";
import { ProgressRing } from "./ProgressRing";

interface ProvinceProgressProps {
  stats: Stats;
}

const TOTAL_PROVINCES = 77;

export function ProvinceProgress({ stats }: ProvinceProgressProps) {
  const remaining = TOTAL_PROVINCES - stats.totalProvinces;

  return (
    <section className="liquid-glass-card flex h-full items-center gap-5 p-5 sm:gap-6 sm:p-6" aria-labelledby="province-heading">
      <ProgressRing value={stats.totalProvinces} total={TOTAL_PROVINCES} label="จำนวนจังหวัดที่ไปเยือน" />
      <div className="min-w-0">
        <h2 id="province-heading" className="text-lg font-bold text-brand-800 sm:text-xl">{stats.totalProvinces}/{TOTAL_PROVINCES} จังหวัด</h2>
        <p className="mt-1 text-sm leading-relaxed text-brand-800/60">อีก {remaining} จังหวัด รอให้คุณไปค้นพบ</p>
      </div>
    </section>
  );
}
