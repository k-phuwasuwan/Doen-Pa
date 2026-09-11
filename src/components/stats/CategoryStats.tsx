import { Mountain, Waves, Castle, Palmtree } from "lucide-react";
import type { PlaceType, Stats } from "@/types";

interface CategoryStatsProps {
  stats: Stats;
}

const categories: { type: PlaceType; label: string; icon: typeof Mountain }[] = [
  { type: "mountain", label: "ภูเขา", icon: Mountain },
  { type: "waterfall", label: "น้ำตก", icon: Waves },
  { type: "cave", label: "ถ้ำ", icon: Castle },
  { type: "island", label: "หมู่เกาะและทะเล", icon: Palmtree },
];

export function CategoryStats({ stats }: CategoryStatsProps) {
  return (
    <section className="card-glass p-6" aria-labelledby="category-heading">
      <h2 id="category-heading" className="text-xl font-bold text-forest">ประเภทสถานที่</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {categories.map(({ type, label, icon: Icon }) => (
          <div key={type} className="rounded-xl border border-beige/30 bg-cream/50 p-4">
            <Icon className="h-5 w-5 text-forest" aria-hidden="true" />
            <p className="mt-3 text-sm text-slate">{label}</p>
            <p className="mt-1 text-2xl font-bold text-forest">{stats.byType[type]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
