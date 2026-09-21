import { Mountain, Droplets, Map, Umbrella, TreePine, Ruler, ArrowUp } from "lucide-react";
import type { Place, PlaceType } from "@/types";

const typeConfig: Record<PlaceType, { label: string; icon: React.ReactNode }> = {
  mountain: { label: "ภูเขา", icon: <Mountain className="w-4 h-4 text-emerald-700" /> },
  waterfall: { label: "น้ำตก", icon: <Droplets className="w-4 h-4 text-emerald-700" /> },
  cave: { label: "ถ้ำ", icon: <Map className="w-4 h-4 text-emerald-700" /> },
  island: { label: "หมู่เกาะและทะเล", icon: <Umbrella className="w-4 h-4 text-emerald-700" /> },
  national_park: { label: "อุทยาน", icon: <TreePine className="w-4 h-4 text-emerald-700" /> },
};

interface PlaceChipsProps {
  place: Place;
}

export function PlaceChips({ place }: PlaceChipsProps) {
  const typeInfo = typeConfig[place.type];

  const chips = [
    {
      key: "type",
      icon: typeInfo.icon,
      label: typeInfo.label,
      show: true,
    },
    {
      key: "altitude",
      icon: <ArrowUp className="w-4 h-4 text-emerald-700" />,
      label: place.altitude,
      show: !!place.altitude,
    },
    {
      key: "distance",
      icon: <Ruler className="w-4 h-4 text-emerald-700" />,
      label: place.distance,
      show: !!place.distance,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-5">
      {chips
        .filter((c) => c.show)
        .map((chip) => (
          <div
            key={chip.key}
            className="liquid-glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-brand-700 hover:scale-105 transition-transform duration-200"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-700/10 flex items-center justify-center shrink-0">
              {chip.icon}
            </div>
            <span>{chip.label}</span>
          </div>
        ))}
    </div>
  );
}
