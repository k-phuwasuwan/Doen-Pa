import { MapPin, Globe } from "lucide-react";
import type { Place } from "@/types";

const regionLabel: Record<string, string> = {
  north: "ภาคเหนือ",
  central: "ภาคกลาง",
  south: "ภาคใต้",
  northeast: "ภาคตะวันออกเฉียงเหนือ",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
};

interface PlaceInfoProps {
  place: Place;
}

export function PlaceInfo({ place }: PlaceInfoProps) {
  return (
    <div className="space-y-3 mb-5">
      <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-brand-700 tracking-tight leading-tight">
        {place.name}
      </h1>
      <div className="flex flex-wrap items-center gap-3">
        <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-brand-700">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{place.location}, {place.province}</span>
        </div>
        <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-brand-700">
          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{regionLabel[place.region] ?? place.region}</span>
        </div>
      </div>
    </div>
  );
}
