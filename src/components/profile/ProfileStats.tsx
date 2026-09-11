import { StatCard } from "@/components/ui/StatCard";

interface ProfileStatsProps {
  placeCount: number;
  provinceCount: number;
  badgeCount: number;
}

export function ProfileStats({ placeCount, provinceCount, badgeCount }: ProfileStatsProps) {
  return (
    <section className="card-glass p-5" aria-label="สถิติโปรไฟล์">
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={placeCount} label="สถานที่" />
        <StatCard value={provinceCount} label="จังหวัด" />
        <StatCard value={badgeCount} label="ตราสะสม" />
      </div>
    </section>
  );
}
