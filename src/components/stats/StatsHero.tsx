import type { Stats } from "@/types";

interface StatsHeroProps {
  stats: Stats;
  journeyCount: number;
}

export function StatsHero({ stats, journeyCount }: StatsHeroProps) {
  const figures = [
    { value: stats.totalPlaces, label: "สถานที่" },
    { value: stats.totalProvinces, label: "จังหวัด" },
    { value: stats.totalRegions, label: "ภูมิภาค" },
  ];

  return (
    <section className="flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between" aria-labelledby="stats-heading">
      <div>
        <p className="text-sm text-brand-800/60">ภาพรวมการเดินทางของคุณ</p>
        <h1 id="stats-heading" className="mt-0.5 text-[1.75rem] font-bold tracking-tight text-brand-800 sm:text-4xl">
          <span className="font-num">{journeyCount}</span> การเดินทาง
        </h1>
      </div>
      <dl className="liquid-glass-capsule grid grid-cols-3 divide-x divide-brand-800/10 rounded-2xl py-2.5">
        {figures.map((figure) => (
          <div key={figure.label} className="flex flex-col-reverse px-4 text-center sm:px-6">
            <dt className="text-xs text-brand-800/60">{figure.label}</dt>
            <dd className="font-num text-xl font-semibold text-brand-800">{figure.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
