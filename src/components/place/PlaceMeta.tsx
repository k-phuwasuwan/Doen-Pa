import { Clock, Tent } from "lucide-react";
import type { Place } from "@/types";

// TODO: bestSeason and campingInfo will come from real Place data
interface PlaceMetaProps {
  place: Place;
}

export function PlaceMeta({ place }: PlaceMetaProps) {
  const hasBestSeason = !!place.bestSeason;
  const hasCampingInfo = !!place.campingInfo;

  if (!hasBestSeason && !hasCampingInfo) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
      {hasBestSeason && (
        <div className="liquid-glass-card rounded-2xl p-4 space-y-1.5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-brand-700">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            ช่วงเวลาเปิดปิด
          </h3>
          <p className="text-xs sm:text-sm text-brand-800/65 leading-relaxed">
            {place.bestSeason}
          </p>
        </div>
      )}

      {hasCampingInfo && (
        <div className="liquid-glass-card rounded-2xl p-4 space-y-1.5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-brand-700">
            <Tent className="w-4 h-4 text-emerald-600 shrink-0" />
            จุดกางเต็นท์
          </h3>
          <p className="text-xs sm:text-sm text-brand-800/65 leading-relaxed">
            {place.campingInfo}
          </p>
        </div>
      )}
    </div>
  );
}
