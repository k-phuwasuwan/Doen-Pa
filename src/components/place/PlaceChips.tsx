import { Mountain, Droplets, Map, Umbrella, TreePine, Ruler, ArrowUp } from "lucide-react";
import type { Place, PlaceType } from "@/types";

const typeConfig: Record<PlaceType, { label: string; icon: React.ReactNode }> = {
  mountain: { label: "ภูเขา", icon: <Mountain className="w-4 h-4" /> },
  waterfall: { label: "น้ำตก", icon: <Droplets className="w-4 h-4" /> },
  cave: { label: "ถ้ำ", icon: <Map className="w-4 h-4" /> },
  island: { label: "หมู่เกาะและทะเล", icon: <Umbrella className="w-4 h-4" /> },
  national_park: { label: "อุทยานแห่งชาติ", icon: <TreePine className="w-4 h-4" /> },
};

interface PlaceChipsProps {
  place: Place;
}

export function PlaceChips({ place }: PlaceChipsProps) {
  const typeInfo = typeConfig[place.type];

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {/* Type chip */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/10 text-forest text-sm font-medium">
        {typeInfo.icon}
        {typeInfo.label}
      </span>

      {/* Altitude chip */}
      {place.altitude && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-beige/60 text-slate text-sm">
          <ArrowUp className="w-4 h-4" />
          {place.altitude}
        </span>
      )}

      {/* Distance chip */}
      {place.distance && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-beige/60 text-slate text-sm">
          <Ruler className="w-4 h-4" />
          {place.distance}
        </span>
      )}
    </div>
  );
}

