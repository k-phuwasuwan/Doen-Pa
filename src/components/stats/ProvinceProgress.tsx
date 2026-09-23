import { MapPinned } from "lucide-react";
import type { Stats } from "@/types";

interface ProvinceProgressProps {
  stats: Stats;
}

const TOTAL_PROVINCES = 77;

export function ProvinceProgress({ stats }: ProvinceProgressProps) {
  const progress = Math.round((stats.totalProvinces / TOTAL_PROVINCES) * 100);

  return (
    <section className="liquid-glass-card p-6" aria-labelledby="province-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-800/65">การเดินทางทั่วไทย</p>
          <h2 id="province-heading" className="mt-1 text-2xl font-bold text-brand-800">{stats.totalProvinces}/{TOTAL_PROVINCES} จังหวัด</h2>
        </div>
        <MapPinned className="h-6 w-6 text-brand-800" aria-hidden="true" />
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-beige-100/40" role="progressbar" aria-valuenow={stats.totalProvinces} aria-valuemin={0} aria-valuemax={TOTAL_PROVINCES} aria-label="จำนวนจังหวัดที่ไปเยือน">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-sm text-brand-800/65">อีก {TOTAL_PROVINCES - stats.totalProvinces} จังหวัด รอให้คุณไปค้นพบ</p>
    </section>
  );
}
