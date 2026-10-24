import { REGION_LABELS } from "@/domain/place-display";
import type { Region, Stats } from "@/types";

interface RegionStatsProps {
  stats: Stats;
}

const regions: { key: Region; label: string }[] = [
  { key: "north", label: REGION_LABELS.north },
  { key: "central", label: REGION_LABELS.central },
  { key: "south", label: REGION_LABELS.south },
  { key: "northeast", label: REGION_LABELS.northeast },
  { key: "east", label: REGION_LABELS.east },
  { key: "west", label: REGION_LABELS.west },
];

export function RegionStats({ stats }: RegionStatsProps) {
  return (
    <section className="liquid-glass-card p-5 sm:p-6" aria-labelledby="region-heading">
      <h2 id="region-heading" className="text-base font-bold text-brand-800 sm:text-lg">ภูมิภาคที่ไปเยือน</h2>
      <div className="mt-4 space-y-4">
        {regions.map(({ key, label }) => {
          const region = stats.byRegion[key];
          const progress = region.totalNationalParks > 0 ? Math.round((region.visitedNationalParks / region.totalNationalParks) * 100) : 0;
          const remaining = Math.max(0, region.totalNationalParks - region.visitedNationalParks);
          return (
            <div key={key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-brand-800">{label}</span>
                <span className="font-num shrink-0 text-brand-800/65">{region.visitedNationalParks}/{region.totalNationalParks} แห่ง</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-800/[0.08]" role="progressbar" aria-valuenow={region.visitedNationalParks} aria-valuemin={0} aria-valuemax={region.totalNationalParks} aria-label={`อุทยานแห่งชาติใน${label}ที่ไปเยือน`}>
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-brand-800/60">
                {region.totalNationalParks === 0 ? "ยังไม่มีอุทยานแห่งชาติในรายการของภูมิภาคนี้" : remaining === 0 ? "คุณไปอุทยานแห่งชาติในภูมิภาคนี้ครบแล้ว" : `เหลืออีก ${remaining} อุทยานแห่งชาติใน${label}ที่คุณยังไม่ได้ไป`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
