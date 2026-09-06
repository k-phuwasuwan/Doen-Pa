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
    <div className="mb-4">
      <h1 className="text-3xl font-bold text-forest mb-3 leading-tight">
        {place.name}
      </h1>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate">
          <MapPin className="w-4 h-4 shrink-0 text-forest/60" />
          <span className="text-sm">
            {place.location}, {place.province}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate">
          <Globe className="w-4 h-4 shrink-0 text-forest/60" />
          <span className="text-sm">{regionLabel[place.region] ?? place.region}</span>
        </div>
      </div>
    </div>
  );
}

