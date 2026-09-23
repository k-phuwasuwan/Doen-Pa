import type { Region, Stats } from "@/types";

interface RegionStatsProps {
  stats: Stats;
}

const regions: { key: Region; label: string }[] = [
  { key: "north", label: "ภาคเหนือ" },
  { key: "central", label: "ภาคกลาง" },
  { key: "south", label: "ภาคใต้" },
  { key: "northeast", label: "ภาคตะวันออกเฉียงเหนือ" },
  { key: "east", label: "ภาคตะวันออก" },
  { key: "west", label: "ภาคตะวันตก" },
];

export function RegionStats({ stats }: RegionStatsProps) {
  return (
    <section className="liquid-glass-card p-6" aria-labelledby="region-heading">
      <h2 id="region-heading" className="text-xl font-bold text-brand-800">ภูมิภาคที่ไปเยือน</h2>
      <div className="mt-5 space-y-5">
        {regions.map(({ key, label }) => {
          const region = stats.byRegion[key];
          const progress = stats.totalPlaces ? Math.round((region.count / stats.totalPlaces) * 100) : 0;
          return (
            <div key={key} className={region.count === 0 ? "opacity-45" : ""}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-brand-800">{label}</span>
                <span className="shrink-0 text-brand-800/65">{region.count} แห่ง</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-beige-100/40">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-brand-800/65">{region.provinces.length ? region.provinces.join(" · ") : "ยังไม่มีจังหวัดที่บันทึก"}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
